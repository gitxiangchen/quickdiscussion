define(['app/app'], function (app) {
    'use strict';

    describe('Test dynamic route config', function () {

        var httpMock;

        beforeEach(function () {
            module('quickDiscussionApp');
            inject(function ($injector) {
                httpMock = $injector.get('$httpBackend');
            });
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

        it("Should load default home route", inject(function ($location, $rootScope, $route) {
            var reDashboardUrl = /\/dashboard\/dashboard.html/;
            httpMock.expectGET(reDashboardUrl).respond('<div>Dashboard</div>');

            $location.path('/');
            $rootScope.$digest();
            httpMock.flush();

            expect($location.path()).toEqual('/');
            expect($route.current.controller).toBe('dashboardController');

        }));

        it("Should load forum with specific forum name/id", inject(function ($location, $rootScope, $route) {
            var reForumUrl = /\/forum\/forum.html/;
            httpMock.expectGET(reForumUrl).respond('<div>Forum</div>');

            $location.path('/forum/1');
            $rootScope.$digest();
            httpMock.flush();

            expect($location.path()).toEqual('/forum/1');
            expect($route.current.controller).toBe('forumController');
            expect($route.current.params['forumNameOrId']).toEqual('1');
        }));

        it("Should load discussion with specific forum name/id and topic name/id", inject(function ($location, $rootScope, $route) {
            var reDiscussionUrl = /\/discussion\/discussion.html/;
            httpMock.expectGET(reDiscussionUrl).respond('<div>Discussion</div>');

            var path = '/discussion/MyForum/MyTopic';
            $location.path(path);
            $rootScope.$digest();

            httpMock.flush();

            expect($location.path()).toEqual(path);
            expect($route.current.params['forumNameOrId']).toEqual('MyForum');
            expect($route.current.params['topicId']).toEqual('MyTopic');
        }));
    });
});