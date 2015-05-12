define(['app/app', 'app/services/setting'], function (app, settingService) {
    'use strict';
    var controllerId = 'customizationController';
    var customizationController = function ($scope, $location, $modal, $timeout, common, localize, settingService, appTokens) {
        var logger = common.logger.getLogger(controllerId);

        $scope.applyLogging = function () {
            appTokens.logging = $scope.logging.current.value;
            $scope.loggingLevelApplied = true;

            $timeout(function () {
                $scope.loggingLevelApplied = false;
                $scope.$apply();
            }, 2000, false);
        };

        $scope.editMenu = function () {

            var modalInstance = $modal.open({
                templateUrl: 'editMenuContent.html', // see customization.html for embedded template script
                controller: editMenuInstanceController,
                //size: 'lg' or 'sm',
                //resolve: {
                //    items: function () {
                //        return $scope.items;
                //    }
                //}
            });

            modalInstance.result.then(function (selectedItem) {
                //$scope.selected = selectedItem;
                logger.info({ message: 'Updated menu' });
            }, function () {
                logger.info({ message: 'Cancel editing menu' });
            });
        };

        $scope.deleteMenu = function () {
            var modalInstance = $modal.open({
                templateUrl: 'deleteMenuContent.html',
                controller: deleteMenuInstanceController
            });

            modalInstance.result.then(function (deletedItem) {
                logger.info({ message: 'Delete menu ' + deletedItem });
            }, function () {
                logger.info({ message: 'Cancel deleting menu' });
            });
        };

        initialize();
        activate();

        function initialize() {

            $scope.forumMenus = [];
            $scope.navbarPositions = [
                { name: 'Default', value: ' ' },
                { name: 'Static', value: 'navbar-static-top' },
                { name: 'Fixed', value: 'navbar-fixed-top' }
            ];
            $scope.supportedLanguages = [
                { name: 'English', value: 'en-US' },
                { name: '中文', value: 'zh-CN' }
            ];
            $scope.loggingLevelApplied = false;
            $scope.loggingLevels = [
                { name: 'Disable', value: 'disable' },
                { name: 'Trace', value: 'trace' },
                { name: 'Debug', value: 'debug' },
                { name: 'Info', value: 'info' },
                { name: 'Warn', value: 'warn' },
                { name: 'Error', value: 'error' }
            ];
        }

        function activate() {
            var promises = [getSettings()];
            common.activateController(promises, controllerId)
                .then(function () { logger.trace({ message: 'Controller activated' }); });
        };

        function getSettings() {
            settingService.getSettingByScope('topNavigation')
                .then(function (settings) {
                    try {
                        var configuration = JSON.parse(settings.Configuration);
                        loadSettings(configuration);
                    } catch (ex) {
                        throw localize.getString('app.customization.invalidSettings', { error: ex.message });
                    }
                }, function (error) {
                    logger.error({ message: error });
                });
        };

        function loadSettings(settings) {
            if (!settings) throw localize.getString('app.customization.invalidSettings', { error: 'non-existence' });

            var loggingLevel = _.find($scope.loggingLevels, function (level) {
                return level.value === appTokens.logging;
            });
            // issue with child scope from ng-repeat and parent scope so we are binding to an object, see more
            // http://stackoverflow.com/questions/19408883/angularjs-select-not-2-way-binding-to-model
            $scope.logging = { current: loggingLevel };

            var language = settings.language ? settings.language.current : 'English';
            if (language === '中文') {
                $scope.language = $scope.supportedLanguages[1];
            } else {
                $scope.language = $scope.supportedLanguages[0];
            }

            var position = settings.position ? settings.position.current : 'Default';
            if (position === 'Static') {
                $scope.navbarPosition = $scope.navbarPositions[1];
            } else if (position === 'Fixed') {
                $scope.navbarPosition = $scope.navbarPositions[2];
            } else {
                $scope.navbarPosition = $scope.navbarPositions[0];
            }

            try {
                for (var i = 0; i < settings.navigations.length; i++) {
                    var nav = settings.navigations[i];
                    $scope.forumMenus.push(nav);
                }
            } catch (ex) {
                throw localize.getString('app.customization.invalidSettings', { error: ex.message });
            }
        }
    };

    var editMenuInstanceController = function ($scope, $modalInstance) {

        $scope.items = ['item1', 'item2'];
        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    var deleteMenuInstanceController = function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.close('deleted');
        };

        $scope.dismiss = function () {
            $modalInstance.dismiss('cancel');
        }
    };

    app.controller(controllerId, ['$scope', '$location', '$modal', '$timeout', 'common', 'localize', 'settingService', 'appTokens', customizationController]);
});