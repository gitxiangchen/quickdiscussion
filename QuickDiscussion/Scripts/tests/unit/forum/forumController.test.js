// dependency for forumFilter is injected via requirejs, as well as localized strings for unit tests
define(['app/app', 'app/forum/forumController', 'app/forum/forumFilter', 'app/resources/en/strings', 'app/resources/zh/strings'], function (app, forumController, filter, enStrings, zhStrings) {
    'use strict';

    describe("Test forum controller", function () {
        var controller, scope, httpMock, localize;
        var dataMock = {};
        var config = { version: '1.0.0.0' };
        var controllerId = 'forumController';
        var topicCount = 100;

        function loadController($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller(controllerId, {
                $scope: scope, config: config, localize: localize, dataService: dataMock
            });
        }

        function mockDataService($q, forum, topics) {
            var deferredForum = $q.defer();
            deferredForum.resolve(forum);
            var deferredTopics = $q.defer();
            deferredTopics.resolve(topics);
            dataMock.getForum = jasmine.createSpy('getForum').andReturn(deferredForum.promise);
            dataMock.getTopics = jasmine.createSpy('getTopics').andReturn(deferredTopics.promise);
            dataMock.getTopicCount = jasmine.createSpy('getTopicCount').andCallFake(function () {
                return $q.when(topicCount);
            });
        }

        beforeEach(function () {
            angular.mock.module('quickDiscussionApp', function ($provide) {
                $provide.value('dataService', dataMock);
            });

            // mock config dependency
            app.value('config', config);

            angular.mock.inject(function ($injector) {
                localize = $injector.get('localize');
            });
        });

        it("Should load forum threads", inject(function ($controller, $rootScope, $q) {
            var forum = {
                id: 1,
                name: 'Forum'
            };
            var topics = [{
                ID: 1,
                Title: 'Test'
            }];

            mockDataService($q, forum, topics);

            loadController($controller, $rootScope);
            scope.$digest();

            expect(dataMock.getForum).toHaveBeenCalled();
            expect(dataMock.getForum.calls.length).toEqual(1);
            expect(dataMock.getTopics).toHaveBeenCalled();
            expect(dataMock.getTopics.calls.length).toEqual(1);
            expect(dataMock.getTopicCount).toHaveBeenCalled();
            expect(dataMock.getTopicCount.calls.length).toEqual(1);
            expect(scope.topics).toBeDefined();
            expect(scope.topics.length).toEqual(1);

            // expect model to have been updated
            expect(scope.totalRecords).toEqual(topicCount);
            expect(scope.topics).toBeDefined();
            expect(scope.topics.length).toEqual(topics.length);
            
        }));

        it("Should load forum threads with breadcrumb navigation", inject(function ($controller, $rootScope, $q) {
            mockDataService($q, {}, []);

            loadController($controller, $rootScope);
            scope.$digest();

            // expect breadcrumb to have been loaded
            expect(scope.breadcrumbs).toBeDefined();
            expect(scope.breadcrumbs.length).toEqual(3);
            expect(scope.breadcrumbs[0].url).toEqual('#');
            expect(scope.breadcrumbs[1].url).toEqual('#forums');
            expect(scope.breadcrumbs[2].url).toContain('#forum/');
        }));
        
        it("Should load forum threads with all localized strings when language changes", inject(function ($injector, $controller, $rootScope, $q) {
            mockDataService($q, {}, []);

            var httpMock = $injector.get('$httpBackend');
            // TODO: no longer use httpService to load resource strings but requirejs 
            //var reLocalizationUrl = /\/zh\/json.js/;
            //httpMock.expectGET(reLocalizationUrl).respond({ strings: zhStrings });
            // not sure why it will request for dashboard template
            var reDashboardUrl = /\/dashboard\/dashboard.html/;
            httpMock.expectGET(reDashboardUrl).respond('<div>Dashboard</div>');

            loadController($controller, $rootScope);
            // set language to non-default language
            localize.setLanguage('zh');
            // it should $broadcast language change event which calls to load breadcrumb 
            scope.$digest();

            //httpMock.flush();

            // expect breadcrumb to have been loaded with localized strings
            expect(scope.breadcrumbs).toBeDefined();
            expect(scope.breadcrumbs.length).toEqual(3);
            expect(scope.breadcrumbs[0].display).toContain(zhStrings.app.dashboard.title);
            expect(scope.breadcrumbs[1].display).toEqual(zhStrings.app.forum.title);
            expect(scope.breadcrumbs[2].display).toEqual(scope['forumNameOrId']); 
        }));
        
    });
});