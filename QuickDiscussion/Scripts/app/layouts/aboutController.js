define (['app/app'], function (app){
    'use strict'

    var controllerId = 'aboutController';
    var aboutController = function ($scope, common) {
        var logger = common.logger.getLogger(controllerId);
        $scope.tabPages = [
            { title: 'About', templateUrl: 'product.html' },
            { title: 'Contact', templateUrl: 'contact.html' }
        ];
        $scope.currentPage = $scope.tabPages[0];
        $scope.selectPage = function (page) {
            $scope.currentPage = page;
        }

        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function () {
                    logger.trace({ message: 'Controller activated' });
                })
        }
    }

    app.controller(controllerId, ['$scope', 'common', aboutController]);
})