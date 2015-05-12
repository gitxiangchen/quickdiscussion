// we must use requirejs DI to load data service here, then angularjs to DI the service instance to controller
define(['app/app', 'app/services/data', 'app/services/import'], function (app, dataService, importService) {
    'use strict';
    var controllerId = 'importController';
    var importController = function ($scope, $location, $routeParams, localize, common, userService, dataService, importService) {
        var logger = common.logger.getLogger(controllerId);

        $scope.checkAll = function () {
            $scope.checkedAll = !$scope.checkedAll;
            for (var i = 0; i < $scope.threads.length; i++) {
                $scope.checked[i] = $scope.checkedAll;
            }
            checkForImport();
        };

        $scope.check = function (index) {
            $scope.checked[index] = !$scope.checked[index];
            checkForImport();
        }

        $scope.loadData = function () {
            //$scope.requireSource = !$scope.importSource.name;
            //$scope.requireSourceQuery = !$scope.searchText;
            if (!$scope.requireSource && !$scope.requireSourceQuery) {
                common.toggleSpinner(true);
                importService.load($scope.importSource.name, $scope.searchText).then(function (threads) {
                    $scope.threads = threads;
                    var topicCount = 0, messageCount = 0;
                    $.each(threads, function (index, thread) {
                        topicCount++;
                        messageCount += thread.messages ? thread.messages.length : 0;
                    });
                    $scope.topicCount = topicCount;
                    $scope.messageCount = messageCount;
                    common.toggleSpinner(false);
                }, function (error) {
                    common.toggleSpinner(false);
                    logger.error({ message: 'Error loading discussions from external data: ' + error.error });
                });
            }
        };

        $scope.importData = function () {
            if ($scope.forum) {

                $scope.progress.value = 0;
                $scope.progress.activeCount = 0;
                $scope.progress.totalCount = 0;

                var threads = getThreadsForImport();
                if (threads && threads.length > 0) {

                    $scope.status.importing = true;

                    var self = this;
                    importService.import($scope.forum, threads).then(function (status) {
                        $scope.progress.activeCount = (status.topicCount + status.messageCount);
                        $scope.progress.totalCount = status.totalCount;
                        $scope.progress.value = Math.round($scope.progress.activeCount / $scope.progress.totalCount * 100);

                        $scope.status.imported = true;
                        logger.debug({ message: 'Import forum succeeded' });
                    }, function () {
                        $scope.status.imported = true;
                        logger.debug({ message: 'Import forum failed' });
                    }, function (status) {
                        $scope.progress.activeCount = (status.topicCount + status.messageCount);
                        $scope.progress.totalCount = status.totalCount;
                        $scope.progress.value = Math.round($scope.progress.activeCount / $scope.progress.totalCount * 100);

                    });
                } else {
                    logger.debug({ message: 'No item is selected for import' });
                }
            }
        };

        initialize();
        activate();

        function initialize() {
            // obtain forum board id parameter
            $scope.forumNameOrId = $routeParams.forumNameOrId;
            $scope.status = {
                importReady: false,
                importing: false,
                imported: false
            }
            $scope.progress = {
                value: 0,
                max: 100,
                activeCount: 0,
                totalCount: 0
            };

            $scope.showMessage = {};
            $scope.canAddEditForum = false;

            $scope.searchText = 'sharepoint';
            $scope.checked = {};
            $scope.importSource = { name: 'StackExchange' };
            $scope.importSources = [{ name: 'StackExchange' }, { name: 'SharePoint' }, { name: 'JIVE' }];

            loadActions();
        };

        function activate() {
            var promises = [getForum(), checkPermission()];
            common.activateController(promises, controllerId)
                .then(function () { logger.trace({ message: 'Controller activated' }); });
        };

        function getForum() {
            dataService.getForum($scope.forumNameOrId).then(function (forum) {
                $scope.forum = forum;
            }, function (error) {
                logger.error({ message: 'Error loading forum ' + error.status + ': ' + error.error });
            });
        }
        
        function checkPermission() {
            userService.checkPermission(SP.PermissionKind.manageLists).then(function (result) {
                $scope.canAddEditForum = result;
                logger.info({ message: 'Check user permission to edit forum: ' + result });
            });
        }

        function loadActions() {
            $scope.steps = [{
                step: 0,
                display: '<i class="glyphicon glyphicon-home"></i> ' + localize.getString('app.forum.manage.import.title'),
            }, {
                step: 1,
                display: localize.getString('app.forum.manage.import.step1')
            }, {
                step: 2,
                display: localize.getString('app.forum.manage.import.step2')
            }, {
                step: 3,
                display: localize.getString('app.forum.manage.import.step3')
            }];
        }

        function checkForImport() {
            $scope.status.importReady = false;
            if ($scope.forum) {
                for (var i = 0; i < $scope.threads.length; i++) {
                    if ($scope.checked[i]) {
                        $scope.status.importReady = true;
                    }
                }
            }
        }

        function getThreadsForImport() {
            var threads = [];
            for (var i = 0; i < $scope.threads.length; i++) {
                if ($scope.checked[i]) {
                    threads.push($scope.threads[i]);
                }
            }
            return threads;
        }
    }
    app.controller(controllerId, ['$scope', '$location', '$routeParams', 'localize', 'common', 'userService', 'dataService', 'importService', importController]);
});