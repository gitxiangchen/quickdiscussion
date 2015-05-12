define(['app/app', 'app/services/cache', 'app/discussion/discussionController', 'app/discussion/discussionFilter', 'app/resources/en/strings', 'app/resources/zh/strings'], function (app, cache, discussionController, filter, enStrings, zhStrings) {
    'use strict';

    describe("Test discussion controller", function () {
        var controller, scope, httpMock, localize, cache; 
        var dataMock = {};
        var config = { version: '1.0.0.0' };
        var routeParams = {
            forumNameOrId: '1',
            topicId: '1'
        };
        var forum = {
            id: 1,
            name: 'Forum',
            itemCount: 100
        };
        var topic = {
            id: 1,
            forumNameOrId: 1,
            subject: 'Topic'
        };
        var discussions = [
            {
                id: 1,
                subject: null,
                message: 'Message1'
            },
            {
                id: 2,
                subject: null,
                message: 'Message2'
            }
        ];
        var controllerId = 'discussionController';

        function loadController($controller, $rootScope, $q) {
            mockDataService($q);
            scope = $rootScope.$new();
            controller = $controller(controllerId, {
                $scope: scope, $routeParams: routeParams, localize: localize, dataService: dataMock, cacheService: cache
            });
        }

        function mockDataService($q) {
            var deferredForum = $q.defer();
            deferredForum.resolve(forum); 
            dataMock.getForum = jasmine.createSpy('getForum').andReturn(deferredForum.promise);
            var deferredTopic = $q.defer();
            deferredTopic.resolve(topic);
            dataMock.getTopicOrReply = jasmine.createSpy('getTopicOrReply').andReturn(deferredTopic.promise);
            var deferredReplies = $q.defer();
            deferredReplies.resolve(discussions);
            dataMock.getRepliesJSOM = jasmine.createSpy('getRepliesJSOM').andReturn(deferredReplies.promise);
        }

        beforeEach(function () {
            angular.mock.module('quickDiscussionApp', function ($provide) {
                $provide.value('dataService', dataMock);
            });

            angular.mock.inject(function ($injector) {
                localize = $injector.get('localize');
                cache = $injector.get('cacheService');
                routeParams = $injector.get('$routeParams');
                routeParams.forumNameOrId = 1;
                routeParams.topicId = 1;
            });
        });

        it("Should load discussions", inject(function ($controller, $rootScope, $q) {

            loadController($controller, $rootScope, $q);
            scope.$digest();

            expect(dataMock.getTopicOrReply).toHaveBeenCalled();
            expect(dataMock.getTopicOrReply.calls.length).toEqual(1);
            expect(dataMock.getRepliesJSOM).toHaveBeenCalled();
            expect(dataMock.getRepliesJSOM.calls.length).toEqual(1);

            // expect model to have been updated
            expect(scope.topic).toBeDefined();
            expect(scope.discussions).toBeDefined();
            expect(scope.discussions.length).toEqual(discussions.length);

        }));

        it("Should load discussions with breadcrumb navigation", inject(function ($controller, $rootScope, $q) {

            loadController($controller, $rootScope, $q);
            scope.$digest();

            // expect breadcrumb to have been loaded
            expect(scope.breadcrumbs).toBeDefined();
            expect(scope.breadcrumbs.length).toEqual(4);
            expect(scope.breadcrumbs[0].url).toEqual('#');
            expect(scope.breadcrumbs[1].url).toEqual('#forums');
            expect(scope.breadcrumbs[2].url).toEqual('#forum/' + scope.forumNameOrId);
            expect(scope.breadcrumbs[3].url).toEqual('#discussion/' + scope.forumNameOrId + '/' + scope.topicId);
        }));
        
        it("Should load discussions with all localized strings when language changes", inject(function ($injector, $controller, $rootScope, $q) {

            //var httpMock = $injector.get('$httpBackend');
            // TODO: no longer use httpService to load resource strings but requirejs 
            //var reLocalizationUrl = /\/zh\/json.js/;
            //httpMock.expectGET(reLocalizationUrl).respond({ strings: zhStrings });
            // not sure why it will request for dashboard template (possible due to localization call)
            //var reDashboardUrl = /\/dashboard\/dashboard.html/;
            //httpMock.expectGET(reDashboardUrl).respond('<div>Dashboard</div>');

            loadController($controller, $rootScope, $q);
            // set language to non-default language
            localize.setLanguage('zh');
            // it should $broadcast language change event which calls to load breadcrumb 
            scope.$digest();

            //httpMock.flush();
            // expect breadcrumb to have been loaded with localized strings
            expect(scope.breadcrumbs).toBeDefined();
            expect(scope.breadcrumbs.length).toEqual(4);
            expect(scope.breadcrumbs[0].display).toContain(zhStrings.app.dashboard.title);
            expect(scope.breadcrumbs[1].display).toEqual(zhStrings.app.forum.title);
            // we should have loaded forum and grabbed its title/name
            var forum = scope.forum ? scope.forum.name : scope.forumNameOrId;
            expect(scope.breadcrumbs[2].display).toEqual(forum);
            expect(scope.breadcrumbs[3].display).toEqual(scope.topic.subject);
        }));
        
    });
});