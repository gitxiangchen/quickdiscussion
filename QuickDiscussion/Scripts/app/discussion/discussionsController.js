// we must use requirejs DI to load data service here, then angularjs to DI the service instance to controller
define(['app/app'], function (app) {
    'use strict';

    var controllerId = 'discussionsController';
    var discussionsController = function ($scope, $q, $filter, $http, $location, localize, common, dataService) {

        var logger = common.logger.getLogger(controllerId);
        var vm = this;

        $scope.getSearchHints = function (term) {
            return dataService.getSearchHints(term);
        };

        $scope.pageChanged = function (page) {
            $scope.currentPage = page;
            getRecentTopics();
        };

        $scope.addThread = function () {
            alert('add thread');
        }

        initialize();
        activate();

        function initialize() {

            $scope.topicCount = 0;
            $scope.topics = [];
            $scope.forumCount = 0;
            $scope.forums = [];

            // paging for discussions
            $scope.totalRecords = 0;
            $scope.pageSize = 10;
            $scope.maxSize = 10; // maximum page buttons shown at once
            $scope.currentPage = 1;
            $scope.filteredCount = 0;
            $scope.filteredTopics = [];

            activateWatches();
            loadBreadcrumb();
        };

        function activate() {
            var promises = [getForums()];
            common.activateController(promises, controllerId)
                .then(function () { logger.trace({ message: 'Controller activated' }); });
        };

        function activateWatches() {
            $scope.$watch("searchText", function (filterText) {
                filterTopics(filterText);
            });
        };

        function filterTopics(filterText) {
            $scope.filteredTopics = $filter("discussionNameFilter")($scope.topics, filterText);
            $scope.filteredCount = $scope.filteredTopics.length;
        }

        function getForums() {
            dataService.getForums().then(function (data) {
                $scope.forums = data;
                $scope.forumCount = data.length;
                // now load recent discussion threads
                getRecentTopics();
            }, function (error) {
                logger.error({ message: error });
            });
        };

        function getRecentTopics() {
            var calls = [];
            _.forEach($scope.forums, function (forum) {
                if (forum.DiscussionList) {
                    calls.push(dataService.getTopics(forum.DiscussionList, 0, 20));
                }
            });

            $q.all(calls).then(function (results) {
                var aggregatedTopics = [];
                angular.forEach(results, function (threads) {
                    aggregatedTopics = aggregatedTopics.concat(threads);
                });
                $scope.topics = aggregatedTopics;
                $scope.topicCount = $scope.topics.length;
            });
        };

        function loadBreadcrumb() {
            vm.navRoutes = [{
                url: '#',
                display: '<i class="glyphicon glyphicon-home"> Dashboard',
                css: ''
            }, {
                url: '#discussions',
                display: 'Discussion',
                css: ''
            }];
        }
    };

    app.controller(controllerId, ['$scope', '$q', '$filter', '$http', '$location', 'localize', 'common', 'dataService', discussionsController]);
})