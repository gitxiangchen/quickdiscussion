define(['app/app'], function (app) {
    'use strict';

    var serviceName = 'dataService';
    var DataService = (function () {
        var forums = [
            {
                Id: 'FA7FCD03-525A-4026-9C29-B0DB54B40003', Title: 'General Forum', Description: 'General discussion list',
                Created: new Date(), LastItemModifiedDate: new Date(), LastItemDeletedDate: new Date(),
                ItemCount: 100, ParentWebUrl: '/QuickDiscussion', ImageUrl: '/_layouts/15/images/itgen.gif?rev=37',
                ListItemEntityTypeFullName: "SP.Data.DiscussionListItem"
            },
            {
                Id: '__1D9A1C41-F7E8-41BB-866E-5726A970B993', Title: 'Technical Forum', Description: 'Technical discussion list',
                Created: new Date(), LastItemModifiedDate: new Date(), LastItemDeletedDate: new Date(),
                ItemCount: 2000, ParentWebUrl: '/QuickDiscussion', ImageUrl: '/_layouts/15/images/itgen.gif?rev=37',
                ListItemEntityTypeFullName: "SP.Data.DiscussionListItem"
            },
            {
                Id: '4B032D1D-03ED-4C42-9A0D-5A42CAD77D78', Title: 'Customer Forum', Description: 'Customer discussion list',
                Created: new Date(), LastItemModifiedDate: new Date(), LastItemDeletedDate: new Date(),
                ItemCount: 6000, ParentWebUrl: '/QuickDiscussion', ImageUrl: '/_layouts/15/images/itgen.gif?rev=37',
                ListItemEntityTypeFullName: "SP.Data.DiscussionListItem"
            }
        ];
        var dataResponse = {
            d: {
                results: []
            },
            error: {
                message: {
                    value: 'some test error message'
                }
            }
        };
        var topics = [];
        var replies = [];

        function DataService($q, $http, spTokens, appTokens, utils, common) {
            this.qService = $q;
            this.httpService = $http;
            this.spTokens = spTokens;
            this.appTokens = appTokens;
            this.utils = utils;
            this.logger = common.logger.getLogger(serviceName);
            
            this.isOnHostWeb = function (forumNameOrId) {
                return (forumNameOrId && forumNameOrId.indexOf('__') === 0);
            }

            this.getForumNameOrId = function (forumNameOrId) {
                return this.isOnHostWeb(forumNameOrId) ? forumNameOrId.substr(2) : forumNameOrId;
            }

            this.fromSPForum = function (spForum) {
                var onHostWeb = this.isOnHostWeb(spForum.Id);
                var forum = {
                    id: spForum.Id,
                    name: onHostWeb ? spForum.Title + ' (host web)' : spForum.Title,
                    description: spForum.Description,
                    itemCount: spForum.ItemCount,
                    created: spForum.Created,
                    baseTemplate: spForum.BaseTemplate,
                    entityTypeName: spForum.EntityTypeName,
                    listItemEntityTypeFullName: spForum.ListItemEntityTypeFullName,
                    lastItemModifiedDate: spForum.LastItemModifiedDate,
                    lastItemDeletedDate: spForum.LastItemDeletedDate,
                    imageUrl: spForum.ImageUrl,
                    parentWebUrl: spForum.ParentWebUrl
                };

                return forum;
            };

            this.toSPForum = function (forum, onHostWeb) {
                var spForum = {
                    Id: this.getForumNameOrId(forum.id),
                    Title: forum.name,
                    Description: forum.description,
                    Created: forum.created,
                    ItemCount: forum.itemCount,
                    ContentTypesEnabled: true,
                    AllowContentTypes: true,
                    '__metadata': { type: forum.listItemEntityTypeFullName }
                };
                return spForum;
            };
        }

        DataService.prototype.getReplies = function (forumNameOrId, topicId) {
            var returnAsJSON = false;
            var onHostWeb = this.isOnHostWeb(forumNameOrId);
            loadReplies(topicId, onHostWeb, returnAsJSON, 1, 5);
            var returnData = true;
            var defer = this.qService.defer();
            if (returnData) {
                if (returnAsJSON) {
                    defer.resolve(dataResponse.d.results);
                } else {
                    defer.resolve(replies);
                }
            } else {
                handleError(defer, 404, 'getReplies returns 404 error');
            }
            return defer.promise;
        };

        DataService.prototype.getRepliesJSOM = function (forumNameOrId, topicId) {
            var returnAsJSON = false;
            var onHostWeb = this.isOnHostWeb(forumNameOrId);
            loadReplies(topicId, onHostWeb, returnAsJSON, 1, 5);
            var returnData = true;
            var defer = this.qService.defer();
            if (returnData) {
                if (returnAsJSON) {
                    defer.resolve(dataResponse.d.results);
                } else {
                    defer.resolve(replies);
                }
            } else {
                handleError(defer, 404, 'getReplies returns 404 error');
            }
            return defer.promise;
        }

        DataService.prototype.getTopicsByUser = function (user) {
            var data = [
            {
                forumNameOrId: 1,
                topicNameOrId: 1,
                modified: new Date(),
                subject: 'Forum Question 1',
                message: 'Sample 1',
                isQuestion: false
            },
            {
                forumNameOrId: 1,
                topicNameOrId: 1,
                modified: new Date(),
                subject: 'Forum Question 2',
                message: 'Sample 2',
                isQuestion: true
            }];
            var deferred = this.qService.defer();
            deferred.resolve(data);
            return deferred.promise;
        }

        DataService.prototype.getTopicOrReply = function (forumNameOrId, topicNameOrId) {
            var deferred = this.qService.defer();
            var results = topics.filter(function (value) {
                return (value.forumNameOrId == forumNameOrId || '__' + value.forumNameOrId == forumNameOrId) && (value.id == topicNameOrId);
            });
            if (results && results.length > 0) {
                deferred.resolve(results[0]);
            } else {
                results = replies.filter(function (value) {
                    return value.id == topicNameOrId;
                });
                if (results && results.length > 0) {
                    deferred.resolve(results[0]);
                } else {
                    deferred.reject({ status: 404, error: "Failed to find forum " + forumNameOrId });
                }
            }
            return deferred.promise;
        }

        DataService.prototype.getTopics = function (forumNameOrId, pageIndex, pageSize) {
            var returnAsJSON = false;
            var onHostWeb = this.isOnHostWeb(forumNameOrId);
            loadTopics(forumNameOrId, pageIndex, pageSize, onHostWeb, returnAsJSON);
            var returnData = true;
            var defer = this.qService.defer();
            if (returnData) {
                if (returnAsJSON) {
                    defer.resolve(dataResponse.d.results);
                } else {
                    defer.resolve(topics);
                }
            } else {
                handleError(defer, 404, 'getTopics returns 404 error');
            }

            return defer.promise;
        };

        DataService.prototype.getTopicCount = function (forumNameOrId) {
            var deferred = this.qService.defer();
            var forum = _.find(forums, function (f) {
                return f.Id === forumNameOrId;
            });
            if (forum) {
                deferred.resolve(forum.ItemCount);
            } else {
                deferred.resolve(0);
            }
            return deferred.promise;
        }

        DataService.prototype.getForum = function (forumNameOrId) {
            var defer = this.qService.defer();
            var results = forums.filter(function (value) {
                return value.Id == forumNameOrId;
            });
            if (results && results.length > 0) {
                defer.resolve(this.fromSPForum(results[0]));
            } else {
                defer.reject({ status: 404, error: "Failed to find forum " + forumNameOrId });
            }
            
            return defer.promise;
        }

        DataService.prototype.getForums = function () {
            var deferred = this.qService.defer();
            var results = [];
            var queries = [];
            queries.push(this.loadForums(false));
            queries.push(this.loadForums(true));
            this.qService.all(queries).then(function (forums) {
                for (var i = 0; i < forums.length; i++) {
                    results.push.apply(results, forums[i]);
                }

                deferred.resolve(results);
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };

        DataService.prototype.loadForums = function (onHostWeb) {
            var defer = this.qService.defer();
            var self = this;
            var filteredForums = _.filter(forums, function (forum) {
                var forumOnHostWeb = self.isOnHostWeb(forum.Id);
                return forumOnHostWeb === onHostWeb;
            });
            var results = filteredForums.map(function (value) {
                var forum = self.fromSPForum(value);
                forum.onHostWeb = onHostWeb;
                return forum;
            });
            defer.resolve(results);
            return defer.promise;
        };

        DataService.prototype.createForum = function (forum) {
            var defer = this.qService.defer();
            if (forum.name.indexOf('fail') === -1 && forum.name.indexOf('error') === -1) {
                var guid = uuid();
                if (forum.onHostWeb) {
                    forum.name = forum.name + '(host web)';
                }
                forum.id = forum.onHostWeb ? '__' + guid : guid;
                forum.created = new Date();
                forum.itemCount = 0;
                forum.listItemEntityTypeFullName = 'SP.Data.DiscussionListItem';

                // add to the collection
                forums.push(this.toSPForum(forum));

                defer.resolve(forum);
            } else {
                return handleError(this.qService, 500, 'failed to create forum ' + forum.name);
            }
            
            return defer.promise;
        };

        DataService.prototype.updateForum = function (forum) {
            var defer = this.qService.defer();
            if (forum.name.indexOf('fail') === -1 && forum.name.indexOf('error') === -1) {
                forum.created = new Date();
                defer.resolve(forum);
            } else {
                return handleError(this.qService, 500, 'failed to update forum ' + forum.name);
            }
            return defer.promise;
        }

        DataService.prototype.createTopic = function (forum, topic) {
            var defer = this.qService.defer();
            topic.modified = new Date();
            topic.id = 100;

            if (topic.subject.indexOf('fail') === -1 && topic.subject.indexOf('error') === -1) {
                defer.resolve(topic);
            } else {
                return handleError(this.qService, 500, 'failed to create topic ' + topic.subject);
            }
            return defer.promise;
        };

        DataService.prototype.updateTopic = function (forum, topic) {
            var defer = this.qService.defer();
            topic.modified = new Date();
            defer.resolve(topic);
            return defer.promise;
        };

        DataService.prototype.createReply = function (forum, reply) {
            var defer = this.qService.defer();
            reply.modified = new Date();
            if (reply.message.indexOf('fail') === -1 && reply.message.indexOf('error') === -1) {
                defer.resolve(reply);
            } else if (!reply.parentItemId) {
                return handleError(this.qService, 500, 'Failed to create reply: parentItemId is missing');
            } else {
                return handleError(this.qService, 500, 'Failed to create reply for topic or message');
            }
            return defer.promise;
        };

        DataService.prototype.createReplyJSOM = function (forum, reply) {
            var deferred = this.qService.defer();
            reply.modified = new Date();
            if (reply.message.indexOf('fail') === -1 && reply.message.indexOf('error') === -1) {
                deferred.resolve(reply);
            } else if (!reply.parentItemId) {
                return handleError(this.qService, 500, 'Failed to create reply: parentItemId is missing');
            } else {
                return handleError(this.qService, 500, 'Failed to create reply for topic or message');
            }
            return deferred.promise;
        };

        DataService.prototype.createMessagesJSOM = function (forum, topic, messages) {
            var deferred = this.qService.defer();
            _.each(messages, function (message) {
                message["modified"] = new Date();
            });

            if (!topic && !topic.id) {
                return handleError(this.qService, 500, 'Failed to create messages: topic is missing');
            } else {
                deferred.resolve(messages);
            }
            return deferred.promise;
        }

        DataService.prototype.updateReply = function (forum, reply) {
            var defer = this.qService.defer();
            reply.modified = new Date();
            defer.resolve(reply);
            return defer.promise;
        };

        DataService.prototype.getSearchHints = function (term) {
            var defer = this.qService.defer();
            var hints = [
                { name: 'Denver', type: '5/5c/Flag_of_Alabama.svg/45px-Flag_of_Alabama.svg.png' },
                { name: 'Seattle', type: 'e/e6/Flag_of_Alaska.svg/43px-Flag_of_Alaska.svg.png' },
                { name: 'Los Angeles', type: '4/46/Flag_of_Colorado.svg/45px-Flag_of_Colorado.svg.png' }
            ];
            var hints2 = ['Denver', 'Seattle', 'Los Angeles'];
            defer.resolve(hints2);
            return defer.promise;
        };

        function handleError(defer, status, err) {
            var error = {
                status: status,
                error: err
            };
            return defer.reject(error);
        };

        function loadTopics(forumNameOrId, pageIndex, pageSize, onHostWeb, isJson) {
            dataResponse.d.results.length = 0;
            topics.length = 0;
            var postfix = onHostWeb ? ' (host web)' : '';
            for (var i = 0; i < pageSize; i++) {
                var num = pageIndex * pageSize + (i + 1);
                if (isJson) {
                    data.d.results.push({
                        Id: i,
                        ParentItemID: null,
                        Title: ' Question ' + num + postfix,
                        Body: '<strong>' + 'Test Question ' + num + postfix + '</strong>',
                        IsQuestion: i % 2 === 0,
                        Modified: new Date(),
                        Editor: {
                            "__metadata": { "id": "842916eb-bdb9-4492-9998-6381d0522b68", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        LastReplyBy: {
                            "__metadata": { "id": "842916eb-bdb9-4492-9998-6381d0522b68", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        DiscussionLastUpdated: new Date(2014, 4, 1)
                    });
                } else {
                    topics.push({
                        forumNameOrId: forumNameOrId,
                        id: i,
                        parentItemId: null,
                        subject: ' Question ' + num + postfix,
                        message: '<strong>' + 'Test Question ' + num + postfix + '</strong>',
                        isQuestion: i % 2 === 0,
                        modified: new Date(),
                        author: {
                            "__metadata": { "id": "842916eb-bdb9-4492-9998-6381d0522b68", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        editor: {
                            "__metadata": { "id": "842916eb-bdb9-4492-9998-6381d0522b68", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        lastReplyBy: {
                            "__metadata": { "id": "842916eb-bdb9-4492-9998-6381d0522b68", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        discussionLastUpdated: new Date(2014, 4, 1)
                    });
                }
            }
        }

        function loadReplies(topicNameOrId, onHostWeb, isJson, start, end) {
            var postfix = onHostWeb ? ' (host web)' : '';

            dataResponse.d.results.length = 0;
            replies.length = 0;

            for (var i = start; i < end; i++) {
                if (isJson) {
                    data.d.results.push({
                        Id: i + 500, // all replies have higher id number than topic for test purpose
                        ID: i,
                        GUID: '',
                        ParentItemID: topicNameOrId,
                        Title: null,
                        IsQuestion: null,
                        IsFeatured: null,
                        EmailSender: null,
                        BestAnswerId: null,
                        //EditorId: 11,
                        Editor: {
                            "__metadata": { "id": "d95f36b8-c7b1-438e-951c-6129261f22a7", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        Author: {
                            "__metadata": { "id": "842916eb-bdb9-4492-9998-6381d0522b68", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },/*
                    Author: {
                        "__metadata": {"id":"c707f13e-57b1-47a2-83d9-347df22654e0","type":"SP.Data.UserInfoItem"},
                        Id:11,
                        Name:"i:0#.f|membership|xchen@dellapps.onmicrosoft.com"
                    },*/
                        Body: '<strong>' + 'Test Question Replied' + (i + 1) + postfix + '</strong>',
                        Attachments: false,
                        Modified: new Date(),
                        Created: new Date(),
                        DiscussionLastUpdated: null
                    });
                } else {
                    replies.push({
                        id: i + 500,
                        parentItemId: topicNameOrId,
                        subject: null,
                        isQuestion: null,
                        message: '<strong>' + 'Test Question Replied' + (i + 1) + postfix + '</strong>',
                        editor: {
                            "__metadata": { "id": "d95f36b8-c7b1-438e-951c-6129261f22a7", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        author: {
                            "__metadata": { "id": "842916eb-bdb9-4492-9998-6381d0522b68", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        modified: new Date(),
                        created: new Date(),
                        discussionLastUpdated: null
                    });
                }
            }

            // add more replies to the first reply itself
            for (var i = 1; i < 4; i++) {
                if (isJson) {
                    data.d.results.push({
                        Id: i + 1000, // all replies have higher id number than topic for test purpose
                        ID: i,
                        GUID: '',
                        ParentItemID: 501,
                        Title: null,
                        IsQuestion: null,
                        IsFeatured: null,
                        EmailSender: null,
                        BestAnswerId: null,
                        //EditorId: 11,
                        Editor: {
                            "__metadata": { "id": "d95f36b8-c7b1-438e-951c-6129261f22a7", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        Author: {
                            "__metadata": { "id": "842916eb-bdb9-4492-9998-6381d0522b68", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name:"i:0#.f|membership|xchen@dellapps.onmicrosoft.com",
                            Title: "System"
                        },
                        Body: '<strong>' + 'Reply to Test Question Replied' + (i + 1) + postfix + '</strong>',
                        Attachments: false,
                        Modified: new Date(),
                        Created: new Date(),
                        DiscussionLastUpdated: null
                    });
                } else {
                    replies.push({
                        id: i + 1000,
                        parentItemId: 501,
                        subject: null,
                        isQuestion: null,
                        message: '<strong>' + 'Reply to Test Question Replied' + (i + 1) + postfix + '</strong>',
                        editor: {
                            "__metadata": { "id": "d95f36b8-c7b1-438e-951c-6129261f22a7", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        author: {
                            "__metadata": { "id": "842916eb-bdb9-4492-9998-6381d0522b68", "type": "SP.Data.UserInfoItem" },
                            Id: 1073741823,
                            Name: "SHAREPOINT\\system",
                            Title: "System"
                        },
                        modified: new Date(),
                        created: new Date(),
                        discussionLastUpdated: null
                    });
                }
            }
        }

        // helper function to create guid for mock data
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }

        function uuid() {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };
        
        return DataService;
    })();
    app.service(serviceName, ['$q', '$http', 'spTokens', 'appTokens', 'utils', 'common', DataService]);
});