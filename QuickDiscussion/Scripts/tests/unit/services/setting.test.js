define(['app/app', 'app/services/setting'], function (app, data) {
    describe("Test settings service module", function () {
        var spTokens, httpMock, utils, settingService;

        var spyHostUrl = 'http://sharepoint.com';
        var spySiteUrl = 'http://test.com';
        var spyListName = 'ForumSettings';
        var spyBaseUrl = '/_api/web';

        beforeEach(function () {
            module('common');
            module('utility');
            module('quickDiscussionApp');
            inject(function ($injector) {
                spTokens = $injector.get('spTokens');
                spTokens.SPAppWebUrl = '';
                spTokens.SPHostUrl = spyHostUrl;
                utils = $injector.get('utils');
                httpMock = $injector.get('$httpBackend'); 
                settingService = $injector.get('settingService'); 
            });
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

        it("getSettings returns a list of setting items", function () {
            var response = {
                d: {
                    results: [
                        {
                            Scope: 'TopNavigation',
                            Configuration: '{position:{current}}'
                        }
                    ]
                },
                error: {
                    message: {
                        value: 'some test error message'
                    }
                }
            };
            var fields = [];
            var scope = 'topNavigation';
            var mockUrl = spyBaseUrl + "/lists/getbytitle('" + spyListName + "')/items?$filter=Scope eq '" + scope + "'&$select=ID,Scope,Configuration,DateModified,ModifiedById";
            httpMock.expectGET(mockUrl).respond(JSON.stringify(response));
            var listSettings, error;
            settingService.getSettingByScope(scope).then(
                function (data) {
                    listSettings = data;
                }, function (err) {
                    error = err;
                });
            httpMock.flush();

            expect(listSettings.Scope).toEqual(response.d.results[0].Scope);
            expect(listSettings.Configuration).toEqual(response.d.results[0].Configuration);
            expect(error).toBeUndefined();
        });
    })
});