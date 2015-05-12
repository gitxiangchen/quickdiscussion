define(['app/app', 'app/forum/manage/manageFilter', 'app/forum/manage/manageController'], function (app) {
    'use strict';

    describe('Test forum manage controller', function () {

        var controller, scope, httpMock, localize;
        var config = { version: '1.0.0.0' };
        var controllerId = 'manageController';
        var userMock = {}, dataMock = {};
        var forums = [
            {
                ID: '1', Title: 'General Discussion', OData_DCDateModified: new Date(), OData_DCDateCreated: new Date(),
                DiscussionSite: '', DiscussionList: 'General Discussion', Note: 'General discussion note', itemCount: 100
            },
            {
                ID: '2', Title: 'Technical Discussion', OData_DCDateModified: new Date(), OData_DCDateCreated: new Date(),
                DiscussionSite: '', DiscussionList: 'Technical Discussion', Note: 'Technical discussion note', itemCount: 110
            },
            {
                ID: '3', Title: 'Customer Discussion', OData_DCDateModified: new Date(), OData_DCDateCreated: new Date(),
                DiscussionSite: '', DiscussionList: 'Customer Discussion', Note: 'Customer discussion note', itemCount: 12
            }
        ];

        function loadController($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller(controllerId, {
                $scope: scope, config: config, localize: localize, userService: userMock, dataService: dataMock
            });
        };

        function mockUserService($q, userPermissionResult) {
            var defer = $q.defer();
            defer.resolve(userPermissionResult);
            // creating new mock/spy instead of using spyOn on existing method
            userMock.checkPermission = jasmine.createSpy('checkPermission').andReturn(defer.promise);
        };

        function mockDataService($q) {
            var defer = $q.defer();
            defer.resolve(forums);
            dataMock.getForums = jasmine.createSpy('getForums').andReturn(defer.promise);
        };

        beforeEach(function () {
            // mock service, see more following link below
            // http://stackoverflow.com/questions/19274274/how-do-you-mock-a-service-in-angularjs-when-unit-testing-with-jasmine
            angular.mock.module('quickDiscussionApp', function ($provide) {
                $provide.value('userService', userMock);
                $provide.value('dataService', dataMock);
            });

            // mock config dependency
            app.value('config', config);

            angular.mock.module('common');
            angular.mock.module('utility');
            angular.mock.inject(function ($injector) {
                localize = $injector.get('localize');
            });
        });

        it("Should load forums with create forum option for user with permission", inject(function ($controller, $rootScope, $q) {
            // mock user with permission to add/edit forum
            mockUserService($q, true);
            mockDataService($q);

            loadController($controller, $rootScope);
            expect(scope['canAddEditForum']).toBeFalsy();
            scope.$digest();

            expect(userMock.checkPermission).toHaveBeenCalled();
            expect(userMock.checkPermission.calls.length).toEqual(1);
            expect(userMock.checkPermission).toHaveBeenCalledWith(SP.PermissionKind.manageLists);
            expect(dataMock.getForums).toHaveBeenCalled();
            expect(dataMock.getForums.calls.length).toEqual(1);

            // expect model to have been updated
            expect(scope['canAddEditForum']).toBeTruthy();
            expect(scope['forums']).toBeDefined();
            expect(scope['forums'].length).toEqual(forums.length);
        }));

        it("Should load forums without create form option for user with no permission", inject(function ($controller, $rootScope, $q) {
            // mock user without permission to add/edit forum
            mockUserService($q, false);
            mockDataService($q);

            loadController($controller, $rootScope);
            scope.$digest();

            expect(userMock.checkPermission).toHaveBeenCalled();
            expect(userMock.checkPermission.calls.length).toEqual(1);
            expect(userMock.checkPermission).toHaveBeenCalledWith(SP.PermissionKind.manageLists);

            expect(scope['canAddEditForum']).toBeFalsy();
        }));

    })
});