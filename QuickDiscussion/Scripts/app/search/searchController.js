define(['app/app', 'app/services/data', 'app/services/search'], function (app) {
    'use strict';

    var controllerId = 'searchController';
    var searchController = function ($scope, $routeParams, $filter, $location, config, routeConfig, common, localize, searchService) {

        var logger = common.logger.getLogger(controllerId);

        $scope.onSearch = function () {
            search();
        };

        initialize();
        activate();

        function initialize() {
            $scope.pageSize = 10;
            $scope.maxSize = 10; // maximum page buttons shown at once
            $scope.currentPage = 1;
            $scope.searchedResults = [];

            $scope.searchTerm = $location.search()['q'];
            $scope.searchForum = $location.search()['forumId'];
        };

        function activate() {
            var promises = [search()];
            common.activateController(promises, controllerId)
                .then(function () { logger.info({ message: 'Controller activated' }); });
        };

        function search() {
            if ($scope.searchTerm) {
                // clear previous search results
                $scope.searchedResults.length = 0;
                searchService.search($scope.searchTerm, $scope.searchForum).then(function (results) {
                    $scope.searchedResults.push.apply($scope.searchedResults, results);
                }, function (error) {
                    logger.error({ message: 'Error searching forum ' + error.status + ': ' + error.error });
                });
            }
        }
    };

    app.controller(controllerId, ['$scope', '$routeParams', '$filter', '$location', 'config', 'routeConfig', 'common', 'localize', 'searchService', searchController]);
})