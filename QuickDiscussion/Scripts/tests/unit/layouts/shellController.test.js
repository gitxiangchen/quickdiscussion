define(['app/app', 'app/layouts/shellController', 'app/resources/en/strings', 'app/resources/zh/strings'], function (app, shellController, enStrings, zhStrings) {
    'use strict';

    describe('Test shell controller', function () {
        var controller, scope, localize, httpMock;
        var events = {
            controllerActivateSuccess: 'controller.activateSuccess',
            spinnerToggle: 'spinner.toggle'
        };
        var config = { version: '1.0.0.0', events: events };
        var stringsResponse = {
            strings : {
                app: {
                    general: {
                        busy: 'Test Busy Message'
                    }
                }
            }
        };
        var controllerId = 'shellController';
        function loadController($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller(controllerId, {
                scope: scope, config: config, localize: localize
            });
        };

        beforeEach(function () {
            angular.mock.module('common');
            angular.mock.module('localization');
            angular.mock.module('quickDiscussionApp');

            angular.mock.inject(function ($injector) {
                localize = $injector.get('localize');
                httpMock = $injector.get('$httpBackend');
            });
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

        it("Should load localize string for busy info", inject(function ($controller, $rootScope) {
            var reDashboardUrl = /\/dashboard.html/;

            httpMock.expectGET(reDashboardUrl).respond('<div>Dashboard</div>');

            loadController($controller, $rootScope);

            scope.$digest(); 
            httpMock.flush();

            expect(controller['busyMessage']).toBeDefined();
            expect(controller['busyMessage']).toEqual(enStrings.app.general.busy);
        }));
    });
});