define(['app/app', 'app/resources/en/strings', 'app/resources/zh/strings'], function (app, enStrings, zhStrings) {
    'use strict';

    describe("Test localization service", function () {

        var url, lang = '';

        beforeEach(function () {
            angular.mock.module('utility');
            angular.mock.module('common');
            angular.mock.module('localization');
            // mock $document has to be after registering localization module
            angular.mock.module(function ($provide) {
                // mock for $document[0].URL
                $provide.value('$document', [{
                    URL: url
                }]);
                $provide.value('$window', {
                    navigator: {
                        language: lang,
                        userLanguage: lang,
                        systemLanguage: lang
                    }
                });
            });
        });

        afterEach(function () {

        });

        it("should return the language code specified in URL", function () {
            url = 'https://apps-af7452177e75ea.sharepoint.com/chinese/MyApp/Pages/Test.html?SPHostUrl=https%3A%2F%2Fdapps%2Esharepoint%2Ecom%2Fchinese&SPLanguage=zh%2DCN&SPClientTag=0&SPProductNumber=16%2E0%2E2607%2E1216&SPAppWebUrl=https%3A%2F%2Fapps%2Daf7452177e75ea%2Esharepoint%2Ecom%2Fchinese%2FMyApp&wpId=_WPID';
            var localeResult;
            angular.mock.inject(function ($injector) {                
                localeResult = $injector.get('locale');
            });
            expect(localeResult).toEqual({ language: 'zh', locale: 'zh-cn' });
        });

        it("should return the language code specified in user browser", function () {
            url = 'https://apps-af7452177e75ea.sharepoint.com/MyApp/Pages/Test.html';
            // set this value will mock user browser language setting to the specified language
            lang = 'zh-CN';
            var localeResult;
            angular.mock.inject(function ($injector) {
                localeResult = $injector.get('locale');
            });
            expect(localeResult.language).toBeDefined();
            expect(localeResult.language).toEqual('zh');

            // reset the language to default
            lang = '';
        });

        it("should return string that is not localized", function () {
            var key = 'test message';
            var localize;
            angular.mock.inject(function ($injector) {
                localize = $injector.get('localize');
            });
            var message = localize.getString(key);
            expect(message).toEqual('?' + key + '?');
        });

        it("should return string that is localized", function () {
            var key = 'app.general.requiredField';
            var locale, localize;
            angular.mock.inject(function ($injector) {
                locale = $injector.get('locale');
                locale.language = 'en';
                localize = $injector.get('localize');
            });
            var message = localize.getString(key);
            expect(message).toEqual(enStrings.app.general.requiredField);
        });

        it("should return if the localized string is not found", function () {
            var key = 'app.services.user';
            var locale, localize;
            angular.mock.inject(function ($injector) {
                locale = $injector.get('locale');
                locale.language = 'en';
                localize = $injector.get('localize');
            });
            var message = localize.getString(key);
            expect(message).toEqual('?' + key + '?');
        });

        it("should return localized string with parameter specified", function () {
            var key = 'app.services.user.getCurrentUserError';
            var error = 'connection timed out';
            // add interpolate parameters
            var locale, localize;
            angular.mock.inject(function ($injector) {
                locale = $injector.get('locale');
                locale.language = 'en';
                localize = $injector.get('localize');
            });
            var message = localize.getString(key, { error: error });
            expect(message).toContain(error);
            expect(message).toContain(enStrings.app.services.user.getCurrentUserError.replace('{{error}}', ''));
        });

        it("should return localized string with parameter for non-default language", function () {
            var key = 'app.services.user.getCurrentUserError';
            var error = 'connection timed out';
            var httpMock;
            // do not inject 'localize' here as it will instantiate 'locale' and mess up the test
            inject(function ($injector) {
                httpMock = $injector.get('$httpBackend');
                httpMock.verifyNoOutstandingExpectation();
                httpMock.verifyNoOutstandingRequest(); 
            });
            // add interpolate parameters
            var reLocalizationUrl = /\/zh\/json.js/;
            var getCurrentUserError = zhStrings.app.services.user.getCurrentUserError.replace('{{error}}', '');
            httpMock.expectGET(reLocalizationUrl).respond({ strings: zhStrings });
            var locale, localize;
            angular.mock.inject(function ($injector) {
                locale = $injector.get('locale'); 
                locale.language = 'zh';
                localize = $injector.get('localize');
            });
            // TODO: no longer use httpService to load resource strings but requirejs 
            //httpMock.flush();
            var message = localize.getString(key, { error: error });
            expect(message).toContain(error);
            expect(message).toContain(getCurrentUserError); 
        });

        it("should throw error if localized resource is invalid", function () {
            var key = 'app.services.user.getCurrentUserError';
            var httpMock, localize;
            // do not inject 'localize' here as it will instantiate 'locale' and mess up the test
            inject(function ($injector) {
                httpMock = $injector.get('$httpBackend');
                localize = $injector.get('localize');
                httpMock.verifyNoOutstandingExpectation();
                httpMock.verifyNoOutstandingRequest();
            });
            // should request for an invalid localized chinese resource string with language code 'zhCN'
            var reLocalizationUrl = /\/zhCN\/json.js/;
            // should attempt to load using httpService then throw error
            httpMock.expectGET(reLocalizationUrl).respond(404, "Invalid localized resources");

            var call = function () {
                localize.setLanguage('zhCN');
                httpMock.flush(); 
            }

            expect(call).toThrow(new Error('Failed to load localized resources: zhCN'));
        });
    })

    describe("Test localization filter service", function () {
        var localize;

        beforeEach(function () {
            angular.mock.module('common');
            angular.mock.module('utility');
            angular.mock.module('localization');
            angular.mock.inject(function ($injector) {
                localize = $injector.get('localize');
            });
        });

        it("should have i18n filter defined", inject(function ($filter) {
            var i18n = $filter('i18n');
            expect(i18n).not.toEqual(null);
            expect(i18n).not.toBeUndefined();

            // when switch to different language, verify i18n filter is defined
            var localize, httpMock;
            inject(function ($injector) {
                localize = $injector.get('localize');
                httpMock = $injector.get('$httpBackend');
                httpMock.verifyNoOutstandingExpectation();
                httpMock.verifyNoOutstandingRequest();
            });
            var reLocalizationUrl = /\/zh\/json.js/;
            httpMock.expectGET(reLocalizationUrl).respond({ message: zhStrings });

            localize.setLanguage('zh');
            var filter = $filter('i18n');
            expect(filter).not.toEqual(null);
            expect(filter).not.toBeUndefined();
        }));

        it("should convert string to localized string using i18n filter", function () {
            inject(function(i18nFilter) {
                var localizedString = i18nFilter("app.general.requiredField");
                expect(localizedString).toEqual(enStrings.app.general.requiredField);
                // for filter string that does not have localized string, return not found string
                var key = "app.services";
                expect(i18nFilter(key)).toEqual('?app.services?');
            });
        });

        it("should convert string to specific language using i18n filter", inject(function ($filter) {
            var httpMock, filter;
            angular.mock.inject(function ($injector) {
                httpMock = $injector.get('$httpBackend');
                httpMock.verifyNoOutstandingExpectation();
                httpMock.verifyNoOutstandingRequest();

                localize = $injector.get('localize');
            });
            var reLocalization = /\/zh\/json.js/;
            httpMock.expectGET(reLocalization).respond({ strings: zhStrings });

            localize.setLanguage('zh');
            filter = $filter('i18n');

            // TODO: no longer use httpService to load resource strings but requirejs
            //httpMock.flush();

            var localizedString = filter('app.general.requiredField');
            expect(localizedString).toEqual(zhStrings.app.general.requiredField);
        }));

        it('should convert string with parameter using i18n filter', angular.mock.inject(function ($filter) {
            localize.getLocalizedString = jasmine.createSpy('getLocalizedString').andCallFake(function (key) {
                return "Required field: {{field}}";
            })
            var input = 'app.general.requiredField: {{field}}';
            var result = $filter('i18n')(input, { field: 'Last Name' });
            expect(localize.getLocalizedString).toHaveBeenCalled();
            expect(result).toEqual('Required field: Last Name');
        }));
    });
})
