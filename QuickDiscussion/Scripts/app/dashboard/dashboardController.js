// we must use requirejs DI to load data service here, then angularjs to DI the service instance to controller
define(['app/app', 'app/services/data'], function (app, dataService) {
    'use strict';

    var controllerId = 'dashboardController';
    var dashboardController = function ($scope, $q, $filter, $http, $location, localize, common, dataService, searchService) {

        var logger = common.logger.getLogger(controllerId);

        $scope.navigate = function (path) {
            $location.path(path);
        };

        $scope.searchForums = function () {
            if ($scope.searchTerm) {
                $location.path('/search').search({ 'q': $scope.searchTerm, 'scope': 'forums' });
            }
        };

        $scope.getSearchHints = function (term) {
            return searchService.suggest(term);
        };

        $scope.pageChanged = function (page) {
            $scope.currentPage = page;
            getRecentTopics();
        };

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
                $scope.topics = [];
                angular.forEach(results, function (threads) {
                    logger.debug({ message: 'Aggregates recent discussion threads: ' + threads.length });
                    $scope.topics = $scope.topics.concat(threads);
                    $scope.topicCount = $scope.topics.length;
                });                
            });
        };
    };

    app.controller(controllerId, ['$scope', '$q', '$filter', '$http', '$location', 'localize', 'common', 'dataService', 'searchService', dashboardController]);
})