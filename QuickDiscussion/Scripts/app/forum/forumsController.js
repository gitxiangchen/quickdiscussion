define(['app/app'], function (app) {
    'use strict';

    var controllerId = 'forumsController';
    var forumsController = function ($scope, $routeParams, $filter, $location, common, localize, dataService) {

        var logger = common.logger.getLogger(controllerId);

        //$scope.searchTerm = $location.search()['q'];

        $scope.searchForums = function () {
            $location.path('/search').search({ 'q': $scope.searchTerm, 'scope': 'forums' });
        };

        $scope.getSearchHints = function (term) {
            return dataService.getSearchHints(term);
        };

        initialize();
        activate();

        function initialize() {
            loadBreadcrumb();
        };

        function activate() {
            var promises = [getForums()];
            common.activateController(promises, controllerId)
                .then(function () { logger.info({ message: 'Controller activated' }); });
            activateWatch();
        };

        function activateWatch() {
            $scope.$on('languageChanged', function (event, language) {
                loadBreadcrumb();
            });
        }

        function getForums() {
            dataService.getForums().then(function (data) {
                $scope.forums = data;
                $scope.forumCount = data.length;
            }, function (error) {
                logger.error({ message: error });
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
            }];
        }
    };

    app.controller(controllerId, ['$scope', '$routeParams', '$filter', '$location', 'common', 'localize', 'dataService', forumsController]);
})