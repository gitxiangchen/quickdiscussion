define(['app/app'], function (app) {
    'use strict';

    var controllerId = 'topicController';
    var topicController = function ($scope, $routeParams, $filter, $http, $route, $location, config, routeConfig, common, localize, dataService) {

        var logger = common.logger.getLogger(controllerId);

        $scope.subjectRequired = false;
        $scope.messageRequired = false;
        $scope.thread = {
            subject: '',
            message: '',
            parentItemId: null,
            isQuestion: false
        };
        $scope.submit = function () {
            submitForm();
        }

        $scope.cancel = function () {
            returnToTopic();
        }

        initialize();
        activate();

        function initialize() {
            // obtain forum board id parameter
            $scope.forumNameOrId = $routeParams.forumNameOrId;
            // obtain forum topic id parameter
            $scope.topicId = $routeParams.topicId;
            // obtain optional message id parameter
            $scope.messageId = $routeParams.messageId;
            $scope.action = $routeParams.action;

            $scope.htmlPost = '';

            loadBreadcrumb();
        };

        function activate() {
            var promises = [getForum(), loadForm()];
            common.activateController(promises, controllerId)
                .then(function () { logger.info({ message: 'Controller activated' }); });
        };

        function getForum() {
            dataService.getForum($scope.forumNameOrId).then(function (forum) {
                $scope.forum = forum;
                loadBreadcrumb();
            }, function (error) {
                logger.error({ message: 'Error loading forum ' + error.status + ': ' + error.error });
            });
        };

        function loadForm() {
            // update the title
            if (!$scope.messageId) {
                $scope.threadTitle = 'Reply to topic';
            } else {
                $scope.threadTitle = 'Reply to message';
            }

            if ($scope.action === 'edit') {
                var topicOrReplyId = $scope.messageId ? $scope.messageId : $scope.topicId;
                dataService.getTopicOrReply($scope.forumNameOrId, topicOrReplyId).then(function (data) {
                    $scope.thread = data;
                }, function (error) {
                    logger.error({ message: 'Failed to load topic or reply ' + error });
                });
            } else {
                $scope.thread.parentItemId = $scope.topicId;
            }
        }

        function submitForm() {
            if (validateForm()) {
                clearValidation();
                if ($scope.action === 'new') {
                    dataService.createTopic($scope.forum, $scope.thread).then(function () {
                        logger.trace({ message: 'New forum topic/reply created' });
                        returnToForum();
                    }, function (err) {
                        var msg = '(error code:' + err.status + ') : ' + err.error;
                        $scope.errorOccurred = msg;
                        logger.error({ message: msg });
                    });
                } else if ($scope.action === 'edit') {
                    if ($scope.thread.parentItemId) {
                        dataService.updateReply($scope.forum, $scope.thread).then(function () {
                            logger.trace({ message: 'Reply updated' });
                            returnToTopic();
                        }, function (err) {
                            var msg = '(error code:' + err.status + ') : ' + err.error;
                            $scope.errorOccurred = msg;
                            logger.error({ message: msg });
                        });
                    } else {
                        dataService.updateTopic($scope.forum, $scope.thread).then(function () {
                            logger.trace({ message: 'Topic updated' });
                            returnToTopic();
                        }, function (err) {
                            var msg = '(error code:' + err.status + ') : ' + err.error;
                            $scope.errorOccurred = msg;
                            logger.error({ message: msg });
                        });
                    }
                } else if ($scope.action === 'reply') {
                    dataService.createReplyJSOM($scope.forum, $scope.thread).then(function () {
                        logger.trace({ message: 'Reply created' });
                        returnToTopic();
                    }, function (err) {
                        var msg = '(error code:' + err.status + ') : ' + err.error;
                        $scope.errorOccurred = msg;
                        logger.error({ message: msg });
                    });
                }
            }
        }

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

        function returnToForum() {
            $location.path('/forum/' + $scope.forumNameOrId);
        }

        function returnToTopic() {
            $location.path('/discussion/' + $scope.forumNameOrId + '/' + $scope.topicId);
        }

        function validateForm() {
            // all require message body 
            $scope.messageRequired = ($scope.thread.message.length === 0);

            // is it forum topic or reply
            if (!$scope.thread.parentItemId) {
                // for topic subject line is required
                $scope.subjectRequired = (!$scope.thread.subject || $scope.thread.subject.length === 0);
            } else {
                $scope.subjectRequired = false;
            }

            return (!$scope.messageRequired) && (!$scope.subjectRequired);
        }

        function clearValidation() {
            $scope.subjectRequired = false;
            $scope.messageRequired = false;
        }
    };

    app.controller(controllerId, ['$scope', '$routeParams', '$filter', '$http', '$route', '$location', 'config', 'routeConfig', 'common', 'localize', 'dataService', topicController]);
})