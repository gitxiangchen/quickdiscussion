define(['app/app'], function (app) {
    'use strict';

    var discussionBoardType = 'SP.List'; // _metadata list type
    var discussionBoardTemplate = 108; // discussion list base template id
    var appWebListODataUrl = "/_api/web/lists";
    var hostWebListODataUrl = "/_api/SP.AppContextSite(@target)/web/lists";

    var serviceName = 'dataService';
    var DataService = (function () {
        function DataService($q, $http, spTokens, appTokens, utils, spUtils, common) {
            this.qService = $q;
            this.httpService = $http;
            this.spTokens = spTokens;
            this.appTokens = appTokens;
            this.utils = utils;
            this.logger = common.logger.getLogger(serviceName);

            this.discussionFields = ['Body', 'Author/Id', 'Author/Title', 'Created', 'DiscussionLastUpdated', 'Editor/Id', 'Editor/Title', 'ID', 'IsQuestion', 'LastReplyBy/Id', 'LastReplyBy/Title', 'Modified', 'Title', 'BestAnswerId', 'ParentItemID', 'ParentItemEditorId', 'IsFeatured'];

            this.getAppWebForumsODataUrl = function () {
                var filter = encodeURI('$filter=((BaseTemplate eq ' + discussionBoardTemplate + ') and Hidden eq false)')
                return this.spTokens.SPAppWebUrl + appWebListODataUrl + '?' + filter + "&$orderby=Title";
            };

            this.getHostWebForumsODataUrl = function () {
                var filter = encodeURI('$filter=((BaseTemplate eq ' + discussionBoardTemplate + ') and Hidden eq false)')
                return this.spTokens.SPAppWebUrl + hostWebListODataUrl + "?@target='" + this.spTokens.SPHostUrl + "'&" + filter + "&$orderby=Title";
            };

            this.getTopicsODataUrl = function (forumNameOrId, pageIndex, pageSize) {
                var resource = this.getODataUrlForTopics(forumNameOrId);
                if (arguments.length === 3) {
                    resource += '&' + this.buildPagingUri(pageIndex, pageSize);
                }
                resource += '&' + this.buildFieldsUri(this.discussionFields);
                resource += '&' + this.buildOrderUri('Created');
                return resource;
            };

            this.getTopicsByUserODataUrl = function (forumNameOrId, user) {
                var resource = this.getODataUrlForTopicsAndUser(forumNameOrId, user);
                resource += '&' + this.buildFieldsUri(this.discussionFields);
                resource += '&' + this.buildOrderUri('DiscussionLastUpdated');

                return resource;
            }

            this.getTopicOrReplyODataUrl = function (forumNameOrId, topicNameOrId, pageIndex, pageSize) {
                var resource = this.getODataUrlForTopicOrReply(forumNameOrId, topicNameOrId);
                if (resource.indexOf('?') !== -1) {
                    resource += '&' + this.buildFieldsUri(this.discussionFields);
                } else {
                    resource += '?' + this.buildFieldsUri(this.discussionFields);
                }
                if (arguments.length === 3) {
                    resource += '&' + this.buildPagingUri(pageIndex, pageSize);
                }
                return resource;
            };

            this.getRepliesODataUrl = function (forumNameOrId, topicNameOrId) {
                var resource = this.getODataUrlForReplies(forumNameOrId, topicNameOrId);
                resource += '&' + this.buildFieldsUri(this.discussionFields);
                resource += '&' + this.buildOrderUri('Created');
                return resource;
            };

            // forumNameOrId is GUID string for forum id and if it is on host web, prefixed with '__'
            this.getODataUrlForForum = function (forumNameOrId) {
                var onHostWeb = this.isOnHostWeb(forumNameOrId);
                var nameOrId = this.getForumNameOrId(forumNameOrId);
                var url = onHostWeb ? this.spTokens.SPAppWebUrl + hostWebListODataUrl : this.spTokens.SPAppWebUrl + appWebListODataUrl;
                if (this.utils.isValidGuid(nameOrId)) {
                    url += "(guid'" + nameOrId + "')";
                } else {
                    url += "/getbytitle('" + spUtils.getListName(nameOrId) + "')";
                }

                return url;
            };

            this.getODataUrlForTopics = function (forumNameOrId) {
                var onHostWeb = this.isOnHostWeb(forumNameOrId);
                if (onHostWeb) {
                    return this.getODataUrlForForum(forumNameOrId) + "/items?@target='" + this.spTokens.SPHostUrl + "'&$filter=ParentItemID eq null";
                } else {
                    return this.getODataUrlForForum(forumNameOrId) + "/items?$filter=ParentItemID eq null";
                }
            };

            this.getODataUrlForTopicsAndUser = function (forumNameOrId, user) {
                var onHostWeb = this.isOnHostWeb(forumNameOrId);
                if (onHostWeb) {
                    return this.getODataUrlForForum(forumNameOrId) + "/items?@target='" + this.spTokens.SPHostUrl + "'&$filter=ParentItemID eq null and AuthorId eq " + user.id;
                } else {
                    return this.getODataUrlForForum(forumNameOrId) + "/items?$filter=ParentItemID eq null and AuthorId eq " + user.id;
                }
            };

            this.getODataUrlForTopicOrReply = function (forumNameOrId, topicNameOrId) {
                var onHostWeb = this.isOnHostWeb(forumNameOrId);
                if (onHostWeb) {
                    return this.getODataUrlForForum(forumNameOrId) + "/items(" + topicNameOrId + ")?@target='" + this.spTokens.SPHostUrl + "'";
                } else {
                    return this.getODataUrlForForum(forumNameOrId) + "/items(" + topicNameOrId + ")";
                }
            };

            this.getODataUrlForReplies = function (forumNameOrId, topicNameOrId) {
                var onHostWeb = this.isOnHostWeb(forumNameOrId);
                if (onHostWeb) {
                    return this.getODataUrlForForum(forumNameOrId) + "/items?@target='" + this.spTokens.SPHostUrl + "'&$filter=ParentItemID eq " + topicNameOrId;
                } else {
                    return this.getODataUrlForForum(forumNameOrId) + "/items?$filter=ParentItemID eq " + topicNameOrId;
                }
            }

            this.toSPForum = function (forum) {
                var spForum = {
                    Id: this.getForumNameOrId(forum.id),
                    Title: forum.name,
                    Description: forum.description,
                    BaseTemplate: discussionBoardTemplate,
                    ContentTypesEnabled: true,
                    AllowContentTypes: true,
                    '__metadata': { type: discussionBoardType }
                };
                return spForum;
            };

            this.fromSPForum = function (spForum, onHostWeb) {
                var forum = {
                    id: onHostWeb ? '__' + spForum.Id : spForum.Id,
                    name: spForum.Title,
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

            this.toSPTopic = function (forum, topic) {
                var spTopic = {
                    Id: topic.id,
                    Title: topic.subject,
                    Body: topic.message,
                    IsQuestion: topic.isQuestion,
                    EditorId: topic.editor.Id,
                    DiscussionLastUpdated: topic.discussionLastUpdated,
                    '__metadata': { type: forum.listItemEntityTypeFullName }
                };

                return spTopic;
            };

            this.toSPReply = function (forum, reply) {
                var spReply = {
                    ParentItemID: reply.parentItemId,
                    Body: reply.message,
                    AuthorId: reply.author.Id,
                    EditorId: reply.editor.Id,
                    '__metadata': { type: forum.listItemEntityTypeFullName }
                };

                return spReply;
            };
            // convert a list item collection for discussion messages (JSOM object) to replies
            this.fromSPRepliesJSOM = function (listItemCollection) {
                var replies = [];
                var listItemEnumerator = listItemCollection.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var item = listItemEnumerator.get_current();
                    var editor = item.get_item('Editor');
                    var author = item.get_item('Author');
                    var lastReplyBy = item.get_item('LastReplyBy');
                    var reply = {
                        forumNameOrId: '',
                        id: item.get_item('ID'),
                        subject: item.get_item('Title'),
                        message: item.get_item('Body'),
                        parentItemId: item.get_item('ParentItemID'),
                        isQuestion: item.get_item('IsQuestion'),
                        editor: {
                            Id: editor ? editor.get_lookupId() : null,
                            Title: editor ? editor.get_lookupValue() : null
                        },
                        author: {
                            Id: author ? author.get_lookupId() : null,
                            Title: author ? author.get_lookupValue() : null
                        },
                        modified: item.get_item('Modified'),
                        created: item.get_item('Created'),
                        lastReplyBy: {
                            Id: lastReplyBy ? lastReplyBy.get_lookupId() : null,
                            Title: lastReplyBy ? lastReplyBy.get_lookupValue() : null
                        },
                        discussionLastUpdated: item.get_item('DiscussionLastUpdated')
                    };
                    replies.push(reply);
                }

                return replies;
            }

            this.fromSPTopicOrReply = function (spTopicOrReply) {
                var topicOrReply = {
                    forumNameOrId: '',
                    id: spTopicOrReply.Id,
                    subject: spTopicOrReply.Title,
                    message: spTopicOrReply.Body,
                    parentItemId: spTopicOrReply.ParentItemID,
                    isQuestion: spTopicOrReply.IsQuestion,
                    editor: spTopicOrReply.Editor,
                    author: spTopicOrReply.Author,
                    modified: spTopicOrReply.Modified,
                    created: spTopicOrReply.Created,
                    lastReplyBy: spTopicOrReply.LastReplyBy,
                    discussionLastUpdated: spTopicOrReply.DiscussionLastUpdated
                };

                return topicOrReply;
            };

            this.createSPTopic = function (forum, topic) {
                var spTopic = {
                    Title: topic.subject,
                    Body: topic.message,
                    IsQuestion: topic.isQuestion,
                    ParentItemID: topic.id,
                    //VoteNumber: topic.vote,
                    //AuthorId: '', // cause cannot convert primitive data to "Edm.Int32" error
                    //EditorId: '',
                    '__metadata': { type: forum.listItemEntityTypeFullName }
                };
                return spTopic;
            };

            this.createSPReply = function (forum, reply) {
                var spReply = {
                    Body: reply.message,
                    ParentItemID: toNumber(reply.parentItemId),
                    //AuthorId: '',
                    //EditorId: '',
                    '__metadata': { type: forum.listItemEntityTypeFullName}
                }

                return spReply;
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

            this.buildPagingUri = function (pageIndex, pageSize) {
                return '$top=' + pageSize + '&$skip=' + (pageIndex * pageSize);
            };

            this.buildFieldsUri = function (fields) {                
                // if there are fields that require to be expanded in rest query
                var expandFields = [];
                for (var i = 0; i < fields.length; i++) {
                    var index = fields[i].indexOf('/');
                    if (index !== -1) {
                        var field = fields[i].substr(0, index);
                        if (expandFields.indexOf(field) === -1) {
                            expandFields.push(field);
                        }
                    }
                }
                
                var resource = '$select=' + fields.join();
                // if we have projected fields in the list, add to the $expand query string
                if (expandFields.length > 0) {
                    resource += '&$expand=' + expandFields.join();
                }

                return resource;
            }

            this.buildOrderUri = function (field, order) {
                if (!order || (order.toLowerCase() !== 'asc' && order.toLowerCase() !== 'desc')) {
                    order = 'desc';
                }
                return 'orderby=' + field + ' ' + order;
            }

            // returns the forum name or ID, remove '__' if appended for host web forum
            this.getForumNameOrId = function (forumNameOrId) {
                return this.isOnHostWeb(forumNameOrId) ? forumNameOrId.substr(2) : forumNameOrId;
            }

            // returns true if forum name or ID indicates a host web forum
            this.isOnHostWeb = function (forumNameOrId) {
                return (forumNameOrId && forumNameOrId.indexOf('__') === 0);
            }

            // build caml query and use JSOM to query SharePoint for all replies to the specific topic id
            this.getAllMessagesByTopicIdQuery = function (topicNameOrId) {
                var qry = new SP.CamlQuery;
                var viewXml =
                    "<View Scope='Recursive'> \
                        <Query> \
                            <Where> \
                                <Eq> \
                                    <FieldRef Name='ParentFolderId' /> \
                                    <Value Type='Integer'>" + topicNameOrId + "</Value> \
                                </Eq> \
                            </Where> \
                        </Query> \
                    </View>";
                qry.set_viewXml(viewXml);
                return qry;
            };

            function toNumber(id) {
                if (typeof id == 'number') {
                    return id;
                } else {
                    return Number(id);
                }
            };
        }

        DataService.prototype.getReplies = function (forumNameOrId, topicNameOrId) {
            var self = this;
            var resource = this.getRepliesODataUrl(forumNameOrId, topicNameOrId);
            return this.httpService({
                method: 'GET',
                url: resource,
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                self.logger.debug({ message: 'getReplies returns ' + successResponse.data.d.results.length });
                var discussions = (successResponse.data.d.results).map(function (value) {
                    return self.fromSPTopicOrReply(value);
                })
                return discussions;
            }, function (errorResponse) {
                return self.handleError(errorResponse);
            });
        };

        // REST API does not offer a way to query and retrieve all message replies to a specific topic,
        // alternatively we use JSOM to get all message items that are contained within discussion container
        // (Folder) , to identify messages by discussion we will use SPBuiltInFieldId.ParentFolderId field in CAML query
        DataService.prototype.getRepliesJSOM = function (forumNameOrId, topicId) {
            var onHostWeb = this.isOnHostWeb(forumNameOrId);
            var context, web;
            if (onHostWeb) {
                context = new SP.ClientContext(this.spTokens.SPAppWebUrl);
                var factory = new SP.ProxyWebRequestExecutorFactory(this.spTokens.SPAppWebUrl);
                context.set_webRequestExecutorFactory(factory);
                var appContextSite = new SP.AppContextSite(context, this.spTokens.SPHostUrl);
                web = appContextSite.get_web();
            } else {
                context = SP.ClientContext.get_current();
                web = context.get_web();
            }

            var listId = this.getForumNameOrId(forumNameOrId);
            var list = web.get_lists().getById(listId);
            context.load(list);

            var query = this.getAllMessagesByTopicIdQuery(topicId);
            var messageItems = list.getItems(query);
            context.load(messageItems);

            var self = this;
            var deferred = this.qService.defer();
            context.executeQueryAsync(
                function () {
                    deferred.resolve(self.fromSPRepliesJSOM(messageItems));
                },
                function (sender, args) {
                    deferred.reject({ status: 500, error: args.get_message() });
                }
            );

            return deferred.promise;
        };

        DataService.prototype.getTopicOrReply = function (forumNameOrId, topicNameOrId) {
            var self = this;
            var resource = this.getTopicOrReplyODataUrl(forumNameOrId, topicNameOrId);
            return this.httpService({
                method: 'GET',
                url: resource,
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                self.logger.debug({ message: 'getTopicOrReply returns ' + successResponse.data.d });
                return self.fromSPTopicOrReply(successResponse.data.d);
            }, function (errorResponse) {
                return self.handleError(errorResponse);
            });
        };

        DataService.prototype.getTopics = function (forumNameOrId, pageIndex, pageSize) {
            var self = this;
            var resource = this.getTopicsODataUrl(forumNameOrId, pageIndex, pageSize);
            return this.httpService({
                method: 'GET',
                url: resource,
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                self.logger.debug({ message: 'getTopics returns ' + successResponse.data.d.results.length });
                var topics = (successResponse.data.d.results).map(function (value) {
                    return self.fromSPTopicOrReply(value);
                });
                return topics;
            }, function (errorResponse) {
                return self.handleError(errorResponse);
            });
        };

        DataService.prototype.getTopicCount = function (forumNameOrId) {
            var self = this;
            var resource = this.getODataUrlForTopics(forumNameOrId);
            return this.httpService({
                method: 'GET',
                url: resource + '&$select=ID,ParentItemID',
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                var topicCount = successResponse.data.d.results.length;
                self.logger.debug({ message: 'getTopicCount returns ' + topicCount });
                return topicCount;
            }, function (errorResponse) {
                return self.handleError(errorResponse);
            })
        }

        // use JavaScript object model to retrieve all topics in a forum by querying all folders in the forum list
        DataService.prototype.getTopicsJSOM = function (forumNameOrId, pageIndex, pageSize) {
            var context = new SP.ClientContext.get_current();
            var web = context.get_web();

            var list = web.get_lists().getById(forumNameOrId);
            context.load(list);

            var qry = SP.CamlQuery.createAllFoldersQuery();
            var discussionItems = list.getItems(qry);
            context.load(discussionItems);

            var deferred = this.qService.defer();
            context.executeQueryAsync(
                function () {
                    deferred.resolve(discussionItems);
                },
                function () {
                    deferred.reject();
                }
            );

            return deferred.promise;
        };

        DataService.prototype.getTopicsByUser = function (user) {
            var self = this;
            var results = [];
            var deferred = this.qService.defer();
            this.getForums().then(function (forums) {
                var forumList = [];
                for (var i = 0; i < forums.length; i++) {
                    forumList.push(self.getTopicsByForumAndUser(forums[i].id, user));
                }
                // handle multiple asynchronous calls 
                self.qService.all(forumList).then(function (topics) {
                    // array .push method can take multiple arguments, so by using .apply to pass all the elements of the second 
                    // array as arguments to .push, we can get all items in each array in to one array result
                    for (var i = 0; i < topics.length; i++) {
                        results.push.apply(results, topics[i]);
                    }
                    deferred.resolve(results);
                });
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };

        DataService.prototype.getTopicsByForumAndUser = function (forumNameOrId, user) {
            var self = this;
            var resource = this.getTopicsByUserODataUrl(forumNameOrId, user);
            return this.httpService({
                method: 'GET',
                url: resource,
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                self.logger.debug({ message: 'getTopics returns ' + successResponse.data.d.results.length });
                var topics = (successResponse.data.d.results).map(function (value) {
                    var topic = self.fromSPTopicOrReply(value);
                    topic.forumNameOrId = forumNameOrId;
                    return topic;
                });
                return topics;
            }, function (errorResponse) {
                return self.handleError(errorResponse);
            });
        };

        DataService.prototype.getForum = function (forumNameOrId) {
            var onHostWeb = this.isOnHostWeb(forumNameOrId);
            var url = this.getODataUrlForForum(forumNameOrId);
            if (onHostWeb) {
                url += "?@target='" + this.spTokens.SPHostUrl + "'";
            }
            var self = this;
            return this.httpService({
                method: 'GET',
                url: url,
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                var forum = self.fromSPForum(successResponse.data.d, onHostWeb);
                self.logger.debug({ message: 'getForum returns forum: ' + JSON.stringify(forum) });
                return forum;
            }, function (errorResponse) {
                return self.handleError(errorResponse);
            });
        };

        // returns forums created on App Web as well as on Host Web
        DataService.prototype.getForums = function () {
            var results = [];
            var queries = [];
            var deferred = this.qService.defer();
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
            var self = this;
            var url = onHostWeb ? this.getHostWebForumsODataUrl() : this.getAppWebForumsODataUrl();
            return this.httpService({
                method: 'GET',
                url: url,
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                var forums = (successResponse.data.d.results).map(function (value) {
                    var forum = self.fromSPForum(value, onHostWeb);
                    forum.onHostWeb = onHostWeb;
                    return forum;
                });
                self.logger.debug({ message: 'getForums returns (' + forums.length + '): ' + JSON.stringify(forums) });
                return forums;
            }, function (errorResponse) {
                return self.handleError(errorResponse);
            });
        };

        DataService.prototype.createForum = function (forum) {
            var self = this;
            var spForum = this.toSPForum(forum);
            var create = function (digest) {
                var url = self.spTokens.SPAppWebUrl + appWebListODataUrl;
                if (forum.onHostWeb) {
                    url = self.spTokens.SPAppWebUrl + hostWebListODataUrl + "?@target='" + self.spTokens.SPHostUrl + "'";
                }
                return self.httpService({
                    method: 'POST',
                    url: url,
                    data: spForum,
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-RequestDigest': digest
                    }
                }).then(function (sucessResponse) {
                    var newForum = self.fromSPForum(sucessResponse.data.d, forum.onHostWeb);
                    self.logger.debug({ message: 'create forum succceed: ' + JSON.stringify(newForum) });
                    return newForum;
                }, function (errorResponse) {
                    return self.handleError(errorResponse);
                });
            }

            return this.getContextInfo().then(create);
        };

        DataService.prototype.updateForum = function (forum) {
            var self = this;
            var spForum = this.toSPForum(forum);
            var update = function (digest) {
                var url = self.spTokens.SPAppWebUrl + appWebListODataUrl + "(guid'" + self.getForumNameOrId(forum.id) + "')";
                if (forum.onHostWeb) {
                    url = self.spTokens.SPAppWebUrl + hostWebListODataUrl + "(guid'" + self.getForumNameOrId(forum.id) + "')?@target='" + self.spTokens.SPHostUrl + "'";
                }
                return self.httpService({
                    method: 'POST',
                    url: url,
                    data: spForum,
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'X-HTTP-Method': 'MERGE', 'IF-MATCH': '*',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-RequestDigest': digest
                    }
                }).then(function (successResponse) {
                    return forum;
                }, function (errorResponse) {
                    return self.handleError(errorResponse);
                });
            };

            return this.getContextInfo().then(update);
        };

        DataService.prototype.createTopic = function (forum, topic) {
            var self = this;
            var spTopic = this.createSPTopic(forum, topic);
            var create = function (digest) {
                var onHostWeb = self.isOnHostWeb(forum.id);
                var url = self.getODataUrlForForum(forum.id) + "/items";
                if (onHostWeb) {
                    url += "?@target='" + self.spTokens.SPHostUrl + "'";
                }
                return self.httpService({
                    method: 'POST',
                    url: url,
                    data: spTopic,
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose', 
                        'X-RequestDigest': digest
                    }
                }).then(function (successResponse) {
                    var newTopic = self.fromSPTopicOrReply(successResponse.data.d);
                    newTopic.forumNameOrId = forum.id;
                    self.logger.debug({ message: 'create topic succeed: ' + JSON.stringify(newTopic) });
                    return newTopic;
                }, function (errorResponse) {
                    return self.handleError(errorResponse);
                });
            };

            return this.getContextInfo().then(create);
        };

        DataService.prototype.updateTopic = function (forum, topic) {
            var self = this;
            var spTopic = this.toSPTopic(forum, topic);
            var update = function (digest) {
                var onHostWeb = self.isOnHostWeb(forum.id);
                var url = self.getODataUrlForForum(forum.id) + "/items(" + topic.id + ")";
                if (onHostWeb) {
                    url += "?@target='" + self.spTokens.SPHostUrl + "'";
                }
                return self.httpService({
                    method: 'POST',
                    url: url,
                    data: spTopic,
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'IF-MATCH': "*",
                        'X-HTTP-Method': "MERGE",
                        'X-RequestDigest': digest
                    }
                }).then(function (sucessResponse) {
                    self.logger.debug({ message: 'update topic succeed: ' + JSON.stringify(sucessResponse) });
                    return sucessResponse;
                }, function (errorResponse) {
                    return self.handleError(errorResponse);
                });
            };

            return this.getContextInfo().then(update);
        };

        // use createReplyJSOM instead as this method created a reply but could not set
        // the proper parentItemId to be a valid message reply
        DataService.prototype.createReply = function (forum, reply) {
            if (!(reply && reply.parentItemId)) throw new Error('reply to topic or message id is missing');

            var self = this;
            var spReply = this.createSPReply(forum, reply);
            var create = function (digest) {
                var onHostWeb = self.isOnHostWeb(forum.id);
                var url = self.getODataUrlForForum(forum.id) + "/items";
                if (onHostWeb) {
                    url += "?@target='" + self.spTokens.SPHostUrl + "'";
                }
                return self.httpService({
                    method: 'POST',
                    url: url,
                    data: spReply,
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-RequestDigest': digest
                    }
                }).then(function (successResponse) {
                    var newReply = self.fromSPTopicOrReply(successResponse.data.d);
                    newReply.forumNameOrId = forum.id;
                    self.logger.debug({ message: 'create reply succeed: ' + JSON.stringify(newReply) });
                    return newReply;
                }, function (errorResponse) {
                    return self.handleError(errorResponse);
                });
            };

            return this.getContextInfo().then(create);
        };

        DataService.prototype.createReplyJSOM = function (forum, reply) {
            var onHostWeb = this.isOnHostWeb(forum.id);
            var context, web;
            if (onHostWeb) {
                context = new SP.ClientContext(this.spTokens.SPAppWebUrl);
                var factory = new SP.ProxyWebRequestExecutorFactory(this.spTokens.SPAppWebUrl);
                context.set_webRequestExecutorFactory(factory);
                var appContextSite = new SP.AppContextSite(context, this.spTokens.SPHostUrl);
                web = appContextSite.get_web();
            } else {
                context = new SP.ClientContext.get_current();
                web = context.get_web();
            }
            var listId = this.getForumNameOrId(forum.id);
            var list = web.get_lists().getById(listId);
            var discussionItem = list.getItemById(reply.parentItemId);
            context.load(discussionItem);

            var spReply = SP.Utilities.Utility.createNewDiscussionReply(context, discussionItem);
            spReply.set_item('Body', reply.message);
            spReply.update();

            var deferred = this.qService.defer();
            context.executeQueryAsync(
                function () {
                    deferred.resolve(spReply);
                },
                function (sender, args) {
                    deferred.reject({ status: 500, error: args.get_message() });
                }
            );

            return deferred.promise;
        };

        DataService.prototype.updateReply = function (forum, reply) {
            var self = this;
            var spReply = this.toSPReply(forum, reply);
            var update = function (digest) {
                var onHostWeb = self.isOnHostWeb(forum.id);
                var url = self.getODataUrlForForum(forum.id) + "/items(" + reply.id + ")";
                if (onHostWeb) {
                    url += "?@target='" + self.spTokens.SPHostUrl + "'";
                }
                return self.httpService({
                    method: 'POST',
                    url: url,
                    data: spReply,
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'IF-MATCH': "*",
                        'X-HTTP-Method': "MERGE",
                        'X-RequestDigest': digest
                    }
                }).then(function (sucessResponse) {
                    self.logger.debug({ message: 'update reply succeed: ' + JSON.stringify(sucessResponse) });
                    return sucessResponse;
                }, function (errorResponse) {
                    return self.handleError(errorResponse);
                });
            };

            return this.getContextInfo().then(update);
        };

        DataService.prototype.createMessagesJSOM = function (forum, topic, messages) {
            var onHostWeb = this.isOnHostWeb(forum.id);
            var context, web;
            if (onHostWeb) {
                context = new SP.ClientContext(this.spTokens.SPAppWebUrl);
                var factory = new SP.ProxyWebRequestExecutorFactory(this.spTokens.SPAppWebUrl);
                context.set_webRequestExecutorFactory(factory);
                var appContextSite = new SP.AppContextSite(context, this.spTokens.SPHostUrl);
                web = appContextSite.get_web();
            } else {
                context = new SP.ClientContext.get_current();
                web = context.get_web();
            }
            var listId = this.getForumNameOrId(forum.id);
            var list = web.get_lists().getById(listId);
            var discussionItem = list.getItemById(topic.id);
            context.load(discussionItem);

            var messageItems = [];
            $.each(messages, function (index, properties) {
                messageItems.push(SP.Utilities.Utility.createNewDiscussionReply(context, discussionItem));
                //for (var name in properties) {
                if (properties['Body']) {
                    //messageItems[index].set_item(name, properties[name])
                    messageItems[index].set_item('Body', properties['Body']);
                    messageItems[index].update();
                }
            });

            var deferred = this.qService.defer();
            context.executeQueryAsync(
                function () {
                    deferred.resolve(messageItems);
                },
                function (sender, args) {
                    deferred.reject({ status: 500, error: args.get_message() });
                }
            );

            return deferred.promise;
        }

        /**
        * Helper method to retrieve SharePoint context by calling REST/OData end point for form digest value.
        * See createForum and etc. function where we use chained promise and getContextInfo will be the first 
        * function, in order to handle nested exception, see 
        * http://liamkaufman.com/blog/2013/09/09/using-angularjs-promises/
        * Note httpService will return as promise
        */
        DataService.prototype.getContextInfo = function () {
            var self = this;
            var url = this.spTokens.SPAppWebUrl + "/_api/contextinfo";
            return this.httpService({
                method: 'POST',
                url: url,
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                return successResponse.data.d.GetContextWebInformation.FormDigestValue;
            }, function (errorResponse) {
                return errorResponse;
            });
        };

        return DataService;
    })();

    app.service(serviceName, ['$q', '$http', 'spTokens', 'appTokens', 'utils', 'spUtils', 'common', DataService]);
});