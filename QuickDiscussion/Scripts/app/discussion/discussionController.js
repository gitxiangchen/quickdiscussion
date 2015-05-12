define(['app/app'], function (app) {
    'use strict';

    var controllerId = 'discussionController';
    var discussionController = function ($scope, $routeParams, $route, $filter, $location, common, localize, dataService, cacheService) {

        var logger = common.logger.getLogger(controllerId);

        $scope.goEdit = function (topicId, replyId) {
            var url = '/topic/' + $scope.forumNameOrId + '/edit/' + topicId + (replyId ? '/' + replyId : '');
            $location.path(url);
        };

        $scope.goReply = function (topicId, replyId) {
            var url = '/topic/' + $scope.forumNameOrId + '/reply/' + topicId + (replyId ? '/' + replyId : '');
            $location.path(url);
        };

        $scope.reply = function (parentId) {
            $scope.newReply.parentItemId = parentId;
            dataService.createReplyJSOM($scope.forum, $scope.newReply).then(function () {
                logger.trace({ message: 'Quick reply created' });
                $route.reload();
            }, function (err) {
                var msg = 'Quick reply (error code:' + err.status + ') : ' + err.error;
                $scope.replyErrorMessage = msg;
                $scope.showReplyError = true;
                logger.error({ message: msg });
            });

        };

        $scope.onToggleReply = function (messageId) {
            $scope.showReplyError = false;
            var toggleState = $scope.actionPanelStates[messageId];
            // toggle off all active action panels but setting hidden property to true
            for (var key in $scope.actionPanelStates) {
                $scope.actionPanelStates[key] = false;
            }
            // if a item panel never opens before, open it now, otherwise toggle it
            if (typeof toggleState == 'undefined') {
                $scope.actionPanelStates[messageId] = true;
            } else {
                $scope.actionPanelStates[messageId] = !toggleState;
            }
        };

        $scope.hideReplyPanel = function (messageId) {
            return !$scope.actionPanelStates[messageId];
        };

        $scope.cancelReply = function (messageId) {
            $scope.actionPanelStates[messageId] = false;
        }

        $scope.setStyle = function (style) {
            var cache = cacheService.getCacheStore();
            cache.setCache('threadStyle', style).then(function () {
                applyStyle(style);
            });
        };

        initialize();
        activate();

        function initialize() {
            // obtain forum board id parameter
            $scope.forumNameOrId = $routeParams.forumNameOrId;
            $scope.topicId = $routeParams.topicId;

            $scope.showReplyError = false;
            $scope.actionPanelStates = {};
            $scope.discussions = [];
            $scope.newReply = {
                message: ''
            };

            loadStyle();
            loadBreadcrumb();
            activateWatches();
        };

        function activate() {
            var promises = [getForum(), getTopic(), getReplies()];
            common.activateController(promises, controllerId)
                .then(function () { logger.info({ message: 'Controller activated' }); });
        };

        function activateWatches() {
            $scope.$on('languageChanged', function (event, language) {
                loadBreadcrumb();
            });
        };

        function getForum() {
            dataService.getForum($scope.forumNameOrId).then(function (forum) {
                $scope.forum = forum;
                loadBreadcrumb();
            }, function (error) {
                logger.error({ message: 'Failed load forum ' + error });
            });
        }

        function getTopic() {
            dataService.getTopicOrReply($scope.forumNameOrId, $scope.topicId).then(function (topic) {
                $scope.topic = topic;
                loadBreadcrumb();
            }, function (error) {
                logger.error({ message: 'Failed to load topic ' + error });
            });
        }

        function getReplies() {
            dataService.getRepliesJSOM($scope.forumNameOrId, $scope.topicId)
                .then(function (data) {
                    $scope.discussions = $scope.discussions.concat(data);
                }, function (error) {
                    logger.error({ message: 'Failed to load discussion threads ' + error });
                });
        };

        // process threads object and build the hierarchy
        function processTreeViewThreads() {
            $scope.threads = [];

            var start = angular.copy($scope.topic);
            $scope.threads.push(start);
            processThreads(start, $scope.discussions);
        }

        function processThreads(start, threads) {
            var replies = [];
            angular.forEach(threads, function (thread) {
                if (thread.parentItemId && thread.parentItemId == start.id) {
                    replies.push(angular.copy(thread));
                }
            });
            if (replies.length > 0) {
                start['replies'] = replies;

                angular.forEach(replies, function (reply) {
                    processThreads(reply, threads);
                });
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
                css: '' 
            }, {
                url: '#discussion/' + $scope.forumNameOrId + '/' + $scope.topicId,
                display: $scope.topic ? $scope.topic.subject : '',
                css: 'current'
            }];
        }

        function loadStyle() {
            cacheService.getCacheStore().getCache('threadStyle').then(function (style) {
                applyStyle(style || 'flat');
            });
        }

        function applyStyle(style) {
            // apply ng-template and css style
            if (style == 'timeline') {
                $scope.stylesheet = '/forum/timeline.css';
                $scope.activeDiscussionTemplate = 'responsiveTimeline.html';
            } else if (style == 'treeview') {
                $scope.stylesheet = '/forum/treeview.css';
                $scope.activeDiscussionTemplate = 'treeView.html';
                processTreeViewThreads();
            } else if (style === 'flat') {
                $scope.stylesheet = '/forum/flat.css';
                $scope.activeDiscussionTemplate = 'singleTimeline.html';
            }
        }
    };

    app.controller(controllerId, ['$scope', '$routeParams', '$route', '$filter', '$location', 'common', 'localize', 'dataService', 'cacheService', discussionController]);
})