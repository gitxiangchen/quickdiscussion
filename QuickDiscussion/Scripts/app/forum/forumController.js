define(['app/app', 'app/services/data', 'app/services/search'], function (app) {
    'use strict';

    var controllerId = 'forumController';
    var forumController = function ($scope, $routeParams, $filter, $http, $route, $location, spTokens, common, localize, dataService, searchService) {

        var logger = common.logger.getLogger(controllerId);

        $scope.searchTerm = $location.search()['q'];

        $scope.addTopic = function () {
            $location.path('/topic/' + $scope.forum.id + '/new/0');
        }

        $scope.getSearchHints = function (term) {
            return dataService.getSearchHints(term);
        };

        $scope.searchForum = function () {
            //$location.path('/search').search('q', $scope.searchTerm);
            $location.path('/search').search({ 'q': $scope.searchTerm, 'scope': 'forum', 'forumId': $scope.forum.id });
        };

        $scope.pageChanged = function () {
            logger.debug({ message: 'pagination navigate to page: ' + $scope.currentPage })
            getTopics();
        };

        initialize();
        activate();

        function initialize() {

            // obtain forum board id parameter
            $scope.forumNameOrId = $routeParams.forumNameOrId;

            $scope.topics = [];

            // paging for forum threads
            $scope.pageSize = 10;
            $scope.maxSize = 10; // maximum page buttons shown at once
            $scope.currentPage = 1;
            $scope.spUserUrl = spTokens.SPHostUrl + '/_layouts/15/userdisp.aspx?ID=';

            activateWatches();
            
            loadBreadcrumb();
        };

        function activate() {
            var promises = [getForum(), getTopicCount(), getTopics()];
            common.activateController(promises, controllerId)
                .then(function () { logger.info({ message: 'Controller activated' }); });
        };

        function activateWatches() {
            $scope.$on('languageChanged', function (event, language) {
                loadBreadcrumb();
            });
            $scope.$watch("searchText", function (filterText) {
                filterTopics(filterText);
            });
        };

        function filterTopics(filterText) {
            $scope.filteredTopics = $filter("forumTopicNameFilter")($scope.topics, filterText);
            $scope.filteredCount = $scope.filteredTopics.length;
        }

        function getForum() {
            dataService.getForum($scope.forumNameOrId).then(function (forum) {
                $scope.forum = forum;
                loadBreadcrumb();
            }, function (error) {
                logger.error({ message: 'Error loading forum ' + error.status + ': ' + error.error });
            });
        }

        function getTopicCount() {
            dataService.getTopicCount($scope.forumNameOrId).then(function (count) {
                $scope.totalRecords = count;
            }, function (error) {
                logger.error({ message: 'Error loading topic count ' + error.status + ': ' + error.error });
            })
        }

        function getTopics() {
            dataService.getTopics($scope.forumNameOrId, $scope.currentPage-1, $scope.pageSize)
                .then(function (data) {
                    $scope.topics = data;
                    // trigger initial filter
                    filterTopics('');
                }, function (error) {
                    logger.error({ message: 'Error loading topics ' + error.status + ': ' + error.error });
                });
        };

        function loadBreadcrumb() {
            $scope.breadcrumbs = [{
                url: '#',
                display: '<i class="glyphicon glyphicon-home"> ' + localize.getString('app.dashboard.title'),
                css: ''
            }, {
                url: '#forums',
                display: localize.getString('app.forum.title'),
                css: ''
            }, {
                url: '#forum/' + $scope.forumNameOrId,
                display: $scope.forum ? $scope.forum.name : $scope.forumNameOrId,
                css: 'current'
            }];
        }
    };

    app.controller(controllerId, ['$scope', '$routeParams', '$filter', '$http', '$route', '$location', 'spTokens', 'common', 'localize', 'dataService', 'searchService', forumController]);
})