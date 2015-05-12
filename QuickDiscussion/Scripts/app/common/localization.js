define(['app/app', 'app/resources/en/strings', 'app/resources/zh/strings'], function (app, enStrings, zhStrings) {

    var moduleName = 'localization';
    var localizationModule = angular.module(moduleName, []);


    /**
     * Locale service returns the locale info from current URL.
     */
    var locale = function ($window, $document) {
        var supportedLocales = ['en', 'zh'];

        var localeTokenExp = /(?:\?|&)SPLanguage=([^&]+)/i
        var localeExp = /(([a-z]+)(?:-[a-z0-9\-]+)?)/i;

        // use the $window service to get the language of the user's browser
        var lang = $window.navigator.userLanguage || $window.navigator.language || $window.navigator.systemLanguage;
        var localeMatch = localeExp.exec(lang);
        var localeInfo = {
            language: localeMatch ? localeMatch[2].toLowerCase() : lang.toLowerCase(),
            locale: lang.toLowerCase()
        };

        // is the language supported as localized strings? use indexOf is not supported in IE 6, 7 and 8
        if (supportedLocales.indexOf(localeInfo.language) === -1) {
            localeInfo.language = supportedLocales[0];
        }

        var localeTokenMatch = localeTokenExp.exec($document[0].URL);
        if (localeTokenMatch) {
            localeMatch = localeExp.exec(decodeURIComponent(localeTokenMatch[1]));
            if (localeMatch) {
                localeInfo.locale = localeMatch[1].toLowerCase();
                var urlLanguage = localeMatch[2].toLowerCase();
                if (supportedLocales.indexOf(urlLanguage) !== -1) {
                    localeInfo.language = urlLanguage;
                }
            }
        }

        return localeInfo;
    };
    var localeServiceName = 'locale';
    localizationModule.factory(localeServiceName, ['$window', '$document', locale]);

    /**
     * Localization service exposes method that returns localized strings. This is adapted from
     * Jim Lavin's ng module. see http://ngmodules.org/modules/angularjs-localizationservice
     * and update http://codingsmackdown.tv/blog/2013/04/23/localizing-your-angularjs-apps-update/.
     */
    var LocalizationService = (function () {
        function LocalizationService($q, $http, $rootScope, $interpolate, locale, utils, common) {
            this.logger = common.logger.getLogger(localizationServiceName);
            this.qService = $q;
            this.httpService = $http;
            this.scope = $rootScope;
            this.interpolate = $interpolate; 
            this.language = locale.language;
            this.utils = utils;
            this.languageResources = {
                'en': enStrings,
                'zh': zhStrings
            };
            this.resources = this.languageResources[this.language];
        }

        LocalizationService.prototype.setLanguage = function (language) {
            if (this.language !== language) {
                this.language = language;

                this.resources = this.languageResources[this.language];
                if (this.resources) {
                    this.languageChanged(this.language);
                } else {
                    this.loadResources();
                }
            }
        }

        LocalizationService.prototype.getString = function (key, params) {
            var str = this.getLocalizedString(this.resources, key);
            if (str) {
                return this.interpolate(str)(params);
            } else {
                return this.handleNotFound(str, key);
            }
        }

        LocalizationService.prototype.loadResources = function () {

            if (this.resources && this.resources.language && this.resources.language == this.language) return;

            // using httpservice does not work in web page but can be mocked in unit tests
            this.httpServiceResources();
            // using requirejs to load resources seems to have worked in web page but not in unit tests
            //this.requirejsResources();
            
        }

        // build the url to retrieve the localized resource file using requirejs
        LocalizationService.prototype.requirejsResources = function () {
            var self = this;            
            var url = 'app/resources/' + this.language + '/strings';
            var dependencies = [];
            dependencies.push(url);           
            this.logger.info({ message: 'Require dependencies: ' + JSON.stringify(dependencies) });
            require(dependencies, function (data) {
                self.logger.info({ message: 'Resolved dependencies: ' + JSON.stringify(dependencies) });
                self.resources = data;
                self.languageChanged(self.language);
                self.scope.$apply();
            }, function (err) {
                self.logger.error({ message: "Failed to load dependencies: " + JSON.stringify(err) });
                // error has a list of modules that failed
                var failed = err.requireModules && err.requireModules[0];
                if (failed === url) {
                    // undef is function only on the global requirejs object
                    requirejs.undef(failed);

                    // load the default localization strings
                    requirejs.config({
                        paths: {
                            url: 'app/resources/en/strings'
                        }
                    });

                    //Try again. Note that the above require callback
                    //with the "Do something with $ here" comment will
                    //be called if this new attempt to load jQuery succeeds.
                    require(dependencies, function (data) {
                        self.logger.info({ message: 'Resolve dependency: ["app/resources/en/strings"]' });
                        self.resources = data;
                        self.scope.$apply();
                    });
                } else {
                    throw new Error("Failed to load localized resources");
                }
            });
        }

        // request the resource file using http service and load JSON strings
        LocalizationService.prototype.httpServiceResources = function () {
            var self = this;
            var url = '../scripts/app/resources/' + this.language + '/json.js';
            this.httpService({ method: "GET", url: url, header: "Accept: application/json;" }).success(function (data) {
                if (!self.utils.checkNestedProperty(data, 'strings')) {
                    throw new Error("Invalid localized resources");
                }
                self.resources = data.strings;
                self.languageChanged(self.language);
                self.logger.trace({ message: 'Load localized resource for language: ' + self.language });
            }).error(function (data, status, headers, config) {
                throw new Error("Failed to load localized resources: " + self.language);
            });
        }

        LocalizationService.prototype.getLocalizedString = function (resources, key) {
            // resource string is using dot notation where we need to replace with '>' as in utility getNestedProperty 
            var resKey = key.replace(/\./gi, '>');
            var found = this.utils.getNestedProperty(resources, resKey);
            if (angular.isString(found)) {
                return found;
            } else {
                return null;
            }
        }

        LocalizationService.prototype.handleNotFound = function (str, key) {
            return str || '?' + key + '?';
        }

        LocalizationService.prototype.languageChanged = function (language) {
            this.scope.$broadcast('languageChanged', language);
        };

        return LocalizationService;

    })();
    var localizationServiceName = 'localize';
    localizationModule.service(localizationServiceName, ['$q', '$http', '$rootScope', '$interpolate', localeServiceName, 'utils', 'common', LocalizationService]);

    /**
     * Localization filter service. usage: {{ token | i18n }}
     */
    localizationModule.filter('i18n', [localizationServiceName, 'common', function (localize, common) {
        return function (input, params) {
            return localize.getString(input, params);
        };
    }]);
})