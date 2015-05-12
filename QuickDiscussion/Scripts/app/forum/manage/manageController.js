// we must use requirejs DI to load data service here, then angularjs to DI the service instance to controller
define(['app/app', 'app/services/data'], function (app, dataService) {
    'use strict';

    var controllerId = 'manageController';
    var manageController = function ($scope, $filter, $location, $modal, localize, common, userService, dataService, searchService) {

        var logger = common.logger.getLogger(controllerId);

        $scope.canAddEditForum = false;

        $scope.importForum = function (outerIndex, innerIndex) {
            var index = outerIndex * Math.ceil($scope.forums.length / 2) + innerIndex;
            var forum = $scope.forums[index];
            if (forum) {
                $location.path('/forumImport/' + forum.id);
            }
        };

        $scope.getClass = function (outerIndex, innerIndex) {
            var index = outerIndex * Math.ceil($scope.forums.length / 2) + innerIndex;
            var itemCount = $scope.forums[index].itemCount;
            if (itemCount < 100) {
                return 'blockquote-info';
            } else if (itemCount < 1000) {
                return 'blockquote-success';
            } else if (itemCount < 5000) {
                return 'blockquote-warning';
            } else {
                return 'blockquote-danger';
            }
        };

        $scope.gotoForum = function (outerIndex, innerIndex) {
            var index = outerIndex * Math.ceil($scope.forums.length / 2) + innerIndex;
            $location.path('/forum/' + $scope.forums[index].id);
        };

        $scope.editForum = function (outerIndex, innerIndex) {
            var index = outerIndex * Math.ceil($scope.forums.length/2) + innerIndex;
            var modalInstance = $modal.open({
                templateUrl: 'editForum.html', // see manage.html for embedded template script
                controller: editForumInstanceController,
                size: 'lg',
                resolve: {
                    dataService: function () {
                        return dataService;
                    },
                    forum: function () {
                        return $scope.forums[index];
                    }
                }
            });

            modalInstance.result.then(function (forum) {
                logger.trace({ message: 'Save forum' });
            }, function () {
                logger.trace({ message: 'Cancel editing forum' });
            });
        }

        $scope.addForum = function () {
            var modalInstance = $modal.open({
                templateUrl: 'editForum.html', // see manage.html for embedded template script
                controller: editForumInstanceController,
                size: 'lg',
                resolve: {
                    dataService: function () {
                        return dataService;
                    },
                    forum: function () {
                        return { name: '', description: '', onHostWeb: true, count: 0, icon: 'icon-pencil' };
                    }
                }
            });

            modalInstance.result.then(function (forum) {
                $scope.forums.push(forum);
                logger.trace({ message: 'Create forum ' + forum.name });
            }, function () {
                logger.trace({ message: 'Cancel editing forum' });
            });
        }

        var editForumInstanceController = function ($scope, $modalInstance, dataService, forum) {
            $scope.forum = forum;
            $scope.alerts = [];
            $scope.isEdit = forum && forum.id;
            $scope.forumTitleValidationMessage = null;
            $scope.title = $scope.isEdit ? localize.getString("app.forum.manage.editForum") : localize.getString("app.forum.manage.newForum");
            $scope.saveButton = $scope.isEdit ? localize.getString("app.forum.manage.save") : localize.getString("app.forum.manage.saveNew");
            $scope.cancelButton = localize.getString("app.forum.manage.cancel");
            $scope.deleteButton = localize.getString("app.forum.manage.deleteForum");

            $scope.save = function () {
                if (!validate()) return;

                resetValidationError();

                if ($scope.isEdit) {
                    dataService.updateForum($scope.forum).then(function (forum) {
                        $modalInstance.close(forum);
                    }, function (err) {
                        $scope.alerts.push({
                            type: 'danger',
                            message: err.error
                        });
                    });
                } else {
                    dataService.createForum($scope.forum).then(function (forum) {
                        $modalInstance.close(forum);
                    }, function (err) {
                        $scope.alerts.push({
                            type: 'danger',
                            message: err.error
                        });
                    });
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.closeAlert = function (index) {
                $scope.alerts.splice(index, 1);
            };

            function validate() {
                var isValid = true;
                if (!forum.name || forum.name.length == 0) {
                    isValid = false;
                    $scope.forumTitleValidationMessage = localize.getString('app.forum.manage.titleRequired');
                }
                // TODO: check special character disallowed in forum name

                return isValid;
            }

            function resetValidationError() {
                $scope.forumTitleValidationMessage = null;
                $scope.alerts.length = 0;
            }
        };

        $scope.pageChanged = function (page) {
            $scope.currentPage = page;
            getForums();
        };

        initialize();
        activate();

        function initialize() {

            $scope.forums = [];
            $scope.filteredForums = [];

            activateWatches();
        };

        function activate() {
            var promises = [getForums(), checkPermission()];
            common.activateController(promises, controllerId)
                .then(function () { logger.trace({ message: 'Controller activated' }); });
        };

        function activateWatches() {
            $scope.$watch("forumFilterText", function (filterText) {
                quickFilter(filterText);
            });
        };

        function getForums() {
            dataService.getForums().then(function (data) {
                    $scope.forums = data;
                    quickFilter();
                }, function (error) {
                    logger.error({ message: error });
                });
        };

        function checkPermission() {
            userService.checkPermission(SP.PermissionKind.manageLists).then(function (result) {
                $scope.canAddEditForum = result;
                logger.info({ message: 'Check user permission to edit forum: ' + result });
            });
        }

        function quickFilter(filterText) {
            $scope.filteredForums = $filter("forumName")($scope.forums, filterText);
        }
    };

    app.controller(controllerId, ['$scope', '$filter', '$location', '$modal', 'localize', 'common', 'userService', 'dataService', 'searchService', manageController]);
})