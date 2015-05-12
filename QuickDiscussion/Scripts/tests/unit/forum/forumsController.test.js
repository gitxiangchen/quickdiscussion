define(['app/app', 'app/forum/forumsController', 'app/resources/en/strings', 'app/resources/zh/strings'], function (app, forumsController, enStrings, zhStrings) {
    'use strict';

    describe('Test forums controller', function () {

        var controller, scope, httpMock, localize;
        var config = { version: '1.0.0.0' };
        var controllerId = 'forumsController';
        var dataMock = {};
        var forums = [
            {
                ID: '1', Title: 'General Discussion', OData_DCDateModified: new Date(), OData_DCDateCreated: new Date(),
                DiscussionSiteUrl: '', DiscussionListName: 'General Discussion', Note: 'General discussion note', itemCount: 100
            },
            {
                ID: '2', Title: 'Technical Discussion', OData_DCDateModified: new Date(), OData_DCDateCreated: new Date(),
                DiscussionSiteUrl: '', DiscussionListName: 'Technical Discussion', Note: 'Technical discussion note', itemCount: 110
            },
            {
                ID: '3', Title: 'Customer Discussion', OData_DCDateModified: new Date(), OData_DCDateCreated: new Date(),
                DiscussionSiteUrl: '', DiscussionListName: 'Customer Discussion', Note: 'Customer discussion note', itemCount: 12
            }
        ];

        function loadController($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller(controllerId, {
                $scope: scope, config: config, localize: localize, dataService: dataMock
            });
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

        it("Should load forums", inject(function ($controller, $rootScope, $q) {
            mockDataService($q);

            loadController($controller, $rootScope);
            scope.$digest();

            expect(dataMock.getForums).toHaveBeenCalled();
            expect(dataMock.getForums.calls.length).toEqual(1);

            // expect model to have been updated
            expect(scope['forumCount']).toEqual(forums.length);
            expect(scope['forums']).toBeDefined();
            expect(scope['forums'].length).toEqual(forums.length);
        }));

        it("Should load forums with breadcrumb navigation", inject(function ($controller, $rootScope, $q) {

            mockDataService($q);

            loadController($controller, $rootScope);
            scope.$digest();

            // expect breadcrumb to have been loaded
            expect(scope['breadcrumbs']).toBeDefined();
            expect(scope['breadcrumbs'].length).toEqual(2);
            expect(scope['breadcrumbs'][0].url).toEqual('#');
            expect(scope['breadcrumbs'][1].url).toEqual('#forums');
        }));
        
        it("Should load forums with all localized strings when language changes", inject(function ($injector, $controller, $rootScope, $q) {

            mockDataService($q);

            // TODO: no longer use httpService to load resource strings but requirejs 
            //var httpMock = $injector.get('$httpBackend');
            //var reLocalizationUrl = /\/zh\/json.js/;
            //httpMock.expectGET(reLocalizationUrl).respond({ strings: zhStrings });

            loadController($controller, $rootScope);
            expect(scope.breadcrumbs).toBeDefined();
            expect(scope.breadcrumbs.length).toEqual(2);
            expect(scope.breadcrumbs[0].display).toContain(enStrings.app.dashboard.title);
            expect(scope.breadcrumbs[1].display).toEqual(enStrings.app.forum.title);

            // set language to non-default language
            localize.setLanguage('zh');
            // it should $broadcast language change event which calls to load breadcrumb 
            scope.$digest();
            
            //httpMock.flush(); 

            // expect breadcrumb to have been loaded with localized strings
            expect(scope.breadcrumbs).toBeDefined();
            expect(scope.breadcrumbs.length).toEqual(2);
            expect(scope.breadcrumbs[0].display).toContain(zhStrings.app.dashboard.title);
            expect(scope.breadcrumbs[1].display).toEqual(zhStrings.app.forum.title);
        }));
        
    });
});