define(['app/app', 'app/services/data'], function (app, dataService) {
    'use strict';

    var StackExchangeAPI = 'https://api.stackexchange.com';
    var StackExchangeQuery = '/2.1/questions?order=desc&sort=votes&site=sharepoint&filter=!-.AG)sL*gPlV';

    var serviceName = 'importService';
    var ImportService = (function () {
        function ImportService($q, $http, common, utils, dataService) {
            this.qService = $q;
            this.httpService = $http;
            this.utils = utils;
            this.dataService = dataService;
            this.logger = common.logger.getLogger(serviceName);
            this.targetDiscussionsListName = 'Discussions List';

            this.getServiceUrl = function (source, query) {
                return StackExchangeAPI + StackExchangeQuery;
            };

            this.toTopic = function (question) {
                var topic = {
                    message: question.body,
                    subject: question.title,
                    vote: question.score,
                    isQuestion: true,
                    messages: []
                };
                return topic;
            };

            this.toMessage = function (answer) {
                var message = {
                    //subject: answer.title,
                    Body: answer.body
                };
                return message;
            }

            this.process = function (data) {
                var threads = [];
                var self = this;
                $.each(data.items, function (i, question) {
                    var topic = self.toTopic(question);
                    $.each(question.answers, function (j, answer) {
                        topic.messages.push(self.toMessage(answer));
                    });
                    threads.push(topic);
                });

                return threads;
            };

            this.count = function (threads) {
                var totalCount = 0;
                $.each(threads, function (index, thread) {
                    totalCount++;
                    totalCount += thread.messages.length;
                });
                return totalCount;
            }

            this.handleError = function (error) {
                var data = {
                    status: error.status || 500,
                    error: error
                }
                if (this.utils.checkNestedProperty(error, 'data>error>message>value')) {
                    data.error = error.data.error.message.value;
                    this.logger.error({ message: data.error });
                } else if (this.utils.checkNestedProperty(error, 'data>odata.error>message>value')) {
                    data.error = error.data['odata.error'].message.value;
                    this.logger.error({ message: data.error });
                } else {
                    this.logger.error({ message: error });
                }
                return this.qService.reject(data);
            };
        }

        ImportService.prototype.import = function (forum, threads) {
            var deferred = this.qService.defer();
            var status = {
                topicCount: 0,
                messageCount: 0,
                totalCount: this.count(threads)
            };
            var self = this;
            try {
                $.each(threads, function (index, topic) {
                    self.dataService.createTopic(forum, topic).then(function (newTopic) {

                        status.topicCount++;
                        deferred.notify(status);

                        self.logger.debug({ message: 'Created topic ' + topic.subject + ' successfully' });
                        self.dataService.createMessagesJSOM(forum, newTopic, topic.messages).then(function (newMessages) {

                            status.messageCount += topic.messages.length;
                            deferred.notify(status);
                            self.logger.debug({
                                message: 'Created messages (' + newMessages.length + ') successfully'
                            });

                            if (status.topicCount + status.messageCount === status.totalCount) {
                                deferred.resolve(status);
                            }

                        }, function () {
                            self.logger.debug({
                                message: 'Failed to create messages for topic ' + topic.subject
                            });
                        });
                    }, function (errorResponse) {
                        self.handleError(errorResponse);
                        self.logger.debug({ message: 'Failed to import topic: ' + errorResponse.error });
                    })
                });
            } catch (error) {
                deferred.reject(error);
            }

            return deferred.promise;
        };

        ImportService.prototype.load = function (source, query) {
            var self = this;
            return this.httpService({
                method: 'GET',
                url: self.getServiceUrl(source, query),
                headers: { Accept: 'application/json;' }
            }).then(function (successResponse) {
                return self.process(successResponse.data);
            }, function (errorResponse) {
                return this.handleError(errorResponse);
            });
        };

        return ImportService;
    })();
    app.service(serviceName, ['$q', '$http', 'common', 'utils', 'dataService', ImportService]);
})