define(['app/app'], function (app) {
    'use strict';

    var SettingService = (function () {
        function SettingService($q, $http, spTokens, appTokens, utils) {
            this.qService = $q;
            this.httpService = $http;
            this.spTokens = spTokens;
            this.appTokens = appTokens;
            this.utils = utils;
        }

        SettingService.prototype.getSettingByScope = function (scope) {
            var settings = {
                position: {
                    current: 'Default'
                },
                language: {
                    current: 'English',
                    options: ['English', '中文']
                },
                navigations: [
                {
                    id: 100, name: 'app.topnav.language.main', url: '#',
                    menus: [{ name: 'app.topnav.language.english', action: '$scope.setLanguage("en")' }, { name: 'app.topnav.language.chinese', action: '$scope.setLanguage("zh")' }, { name: '', url: '-' }, { name: 'app.topnav.language.auto', action: '$scoope.setLanguage()' } ]
                }
                ]
            };
            var settingsString = JSON.stringify(settings);
            var data = {
                d: {
                    results: [{
                        Scope: "TopNavigation",
                        Configuration: settingsString
                    }]
                },
                error: {
                    message: {
                        value: 'some test error message'
                    }
                }
            };
            var returnData = true;
            var defer = this.qService.defer();
            if (returnData) {
                defer.resolve(data.d.results[0]);
            } else {
                handleError(404, data, defer);
            }

            return defer.promise;
        };

        function handleError(status, err) {
            if (utility.checkNestedProperty(err, 'error>message>value')) {
                err = err.error.message.value;
            }
            var error = {
                status: status,
                error: err
            };
            return $q.reject(error);
        };

        return SettingService;
    })();
    var serviceName = 'settingService';
    app.service(serviceName, ['$q', '$http', 'spTokens', 'appTokens', 'utils', SettingService]);
});