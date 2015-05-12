/**
* About dialog for the app.
*/
define(['require', 'exports', 'app/app', 'app/services/tabbedDialog'], function (require, exports, app, dialogModule) {
    'use strict';
    exports.serviceName = 'aboutDialogService';

    // contains array of IDialogPageInfo
    var dialogPages = [
        { id: 'about', title: 'About', templateUrl: 'product.html' },
        { id: 'contact', title: 'Contact', templateUrl: 'contact.html' }
    ];

    var aboutDialogInstanceController = function ($scope, $modalInstance) {

        $scope.tabPages = dialogPages;
        $scope.currentPage = $scope.tabPages[0];

        $scope.selectPage = function (page) {
            $scope.currentPage = page;
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    app.factory(exports.serviceName, ['localize', dialogModule.serviceName,
        function (localize, tabbedDialog) {
            return {
                open: function () {
                    return tabbedDialog.open({
                        title: localize.getString('app.topnav.about.title'),
                        controller: aboutDialogInstanceController,
                        templateUrl: '../scripts/app/layouts/about.html',
                        pages: dialogPages
                    });
                }
            };
        }]);
});
