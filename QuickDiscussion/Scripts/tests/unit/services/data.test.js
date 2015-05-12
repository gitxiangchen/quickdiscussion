define(['app/app', 'app/services/data'], function (app, data) {
    describe("Test data service", function () {
        var spTokens, httpMock, utils, dataService;

        var spyHostUrl = 'http://sharepoint.com';
        var spySiteUrl = 'http://test.com';
        var spyListName = 'Discussions';
        var spyForumNameOrId = '93692721-DA53-45FA-AF63-6904E82FF25F';
        var spyBaseUrl = '/_api/web';
        var spyHostWebBaseUrl = '/_api/SP.AppContextSite(@target)/web';

        var discussionFields = ['Body', 'Author/Id', 'Author/Title', 'Created', 'DiscussionLastUpdated', 'Editor/Id', 'Editor/Title', 'ID', 'IsQuestion', 'LastReplyBy/Id', 'LastReplyBy/Title', 'Modified', 'Title', 'BestAnswerId', 'ParentItemID', 'ParentItemEditorId', 'IsFeatured'];
        var discussionExpandFields = ['Author', 'Editor', 'LastReplyBy'];

        var spyContextInformationUrl = '/_api/contextinfo';
        var contextInfoResponse = {
            d: {
                GetContextWebInformation: {
                    FormDigestValue: 'some_digest_value'
                }
            }
        };

        beforeEach(function () {
            module('common');
            module('utility');
            module('quickDiscussionApp');
            inject(function ($injector) {
                spTokens = $injector.get('spTokens');
                spTokens.SPAppWebUrl = '';
                spTokens.SPHostUrl = spyHostUrl;
                utils = $injector.get('utils');
                dataService = $injector.get('dataService');
                httpMock = $injector.get('$httpBackend');
            });
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

        it("getReplies returns a list of discussion items for a given forum and topic", function () {
            var response = {
                d: {
                    results: [
                        {
                            Title: 'Question 1',
                            Body: '<strong>Test Question</strong>',
                            IsQuestion: true,
                            Modified: new Date(2013,1,23)
                        },
                        {
                            Title: 'Question 2',
                            Body: 'Sample discussion forum',
                            IsQuestion: false,
                            Modified: new Date(2014,2,13)
                        }
                    ]
                }
            };
            var topicId = 1;
            var mockUrl = spyBaseUrl + "/lists(guid'" + spyForumNameOrId + "')/items?$filter=ParentItemID eq " + topicId + "&$select=" +
                discussionFields.join() + "&$expand=" + discussionExpandFields.join() + "&orderby=Created desc";
            httpMock.expectGET(mockUrl).respond(JSON.stringify(response)); 
            var listData1, error1;
            dataService.getReplies(spyForumNameOrId, topicId).then(
                function (data) {
                    listData1 = data;
                }, function (err) {
                    error1 = err;
                });
            httpMock.flush();

            expect(listData1.length).toEqual(2);
            expect(listData1[0].message).toEqual(response.d.results[0].Body);
            expect(listData1[0].subject).toEqual(response.d.results[0].Title);
            expect(error1).toBeUndefined();
        });

        it("getReplies returns error for a given forum and topic", function () {
            var errorResponse = {
                error: {
                    message: {
                        value: 'some test error message'
                    }
                }
            };
            // handle error condition
            var topicId = 1;
            var errorCode = 500;
            var mockUrl = spyBaseUrl + "/lists(guid'" + spyForumNameOrId + "')/items?$filter=ParentItemID eq " + topicId + "&$select=" +
                discussionFields.join() + "&$expand=" + discussionExpandFields.join() + "&orderby=Created desc";
            httpMock.expectGET(mockUrl).respond(errorCode, JSON.stringify(errorResponse));
            var listData2, error2;
            dataService.getReplies(spyForumNameOrId, topicId).then(
                function (data) {
                    listData2 = data;
                }, function (err) {
                    error2 = err;
                });
            httpMock.flush();

            expect(listData2).toBeUndefined();
            expect(error2).toBeDefined();
            expect(error2.status).toEqual(errorCode);
            expect(error2.error).toEqual(errorResponse.error.message.value);
        });

        it("getForum returns the forum for a given app web forum name or id", function () {
            var forumNameOrId = '43CB507B-407D-4B88-B822-7D2B659E3F5D';
            var forumResponse = {
                d: {
                    Id: forumNameOrId,
                    Title: 'Test',
                    Description: 'Test'
                }
            };
            var mockUrl = spyBaseUrl + "/lists(guid'" + forumNameOrId + "')";
            httpMock.expectGET(mockUrl).respond(JSON.stringify(forumResponse));
            var forum, error;
            dataService.getForum(forumNameOrId).then(function (data) {
                forum = data;
            }, function (err) {
                error = err;
            });
            httpMock.flush();

            expect(forum).toBeDefined();
            expect(forum.id).toEqual(forumResponse.d.Id);
            expect(forum.name).toEqual(forumResponse.d.Title);
            expect(forum.description).toEqual(forumResponse.d.Description);
        });

        it("getForum returns the forum for a given host web forum name or id", function () {
            var forumNameOrId = '__43CB507B-407D-4B88-B822-7D2B659E3F5D';
            var nameOrId = forumNameOrId.substr(2);
            var forumResponse = {
                d: {
                    Id: nameOrId,
                    Title: 'Test',
                    Description: 'Test'
                }
            };
            var mockUrl = spyHostWebBaseUrl + "/lists(guid'" + nameOrId + "')?@target='" + spyHostUrl + "'";
            httpMock.expectGET(mockUrl).respond(JSON.stringify(forumResponse));
            var forum, error;
            dataService.getForum(forumNameOrId).then(function (data) {
                forum = data;
            }, function (err) {
                error = err;
            });
            httpMock.flush();

            expect(forum).toBeDefined();
            expect(forum.id).toEqual(forumNameOrId);
            expect(forum.name).toEqual(forumResponse.d.Title);
            expect(forum.description).toEqual(forumResponse.d.Description);
        });

        it("getTopicOrReply returns the given topic on app web", function () {
            var topicResponse = {
                d: {
                    Title: 'Topic 1',
                    Body: 'Test Question',
                    IsQuestion: true,
                    Modified: new Date(2013, 1, 23)
                }
            };
            var errorResponse = {
                error: {
                    message: {
                        value: 'some test error message'
                    }
                }
            };
            var topicNameOrId = 1;
            var forumNameOrId = '43CB507B-407D-4B88-B822-7D2B659E3F5D';
            var mockUrl = spyBaseUrl + "/lists(guid'" + forumNameOrId + "')/items(" + topicNameOrId + ")?$select=" +
                discussionFields.join() + "&$expand=" + discussionExpandFields.join();
            httpMock.expectGET(mockUrl).respond(JSON.stringify(topicResponse));
            var topic1, error1;
            dataService.getTopicOrReply(forumNameOrId, topicNameOrId).then(
                function (data) {
                    topic1 = data;
                }, function (err) {
                    error1 = err;
                });
            httpMock.flush();

            expect(topic1).toBeDefined();
            expect(error1).toBeUndefined();
            expect(topic1.message).toEqual(topicResponse.d.Body);
            expect(topic1.subject).toEqual(topicResponse.d.Title);

            // handle error condition
            var topic2, error2;
            var errorCode = 500;
            httpMock.expectGET(mockUrl).respond(errorCode, JSON.stringify(errorResponse));
            dataService.getTopicOrReply(forumNameOrId, topicNameOrId).then(function () {
                topic2 = data;
            }, function (err) {
                error2 = err;
            });
            httpMock.flush();

            expect(topic2).toBeUndefined();
            expect(error2).toBeDefined();
            expect(error2.status).toEqual(errorCode);
            expect(error2.error).toEqual(errorResponse.error.message.value);
        });

        it("createTopic returns new topic on app web forum", function () {
            var forum = {
                id: '6FCA7D48-B590-46B9-A5BD-804DBEACEC0D',
                name: 'TestForum',
                listItemEntityTypeFullName: 'TestForumListItem'
            };
            var newTopic = {
                subject: 'Test Topic',
                message: 'topic message'
            };
            var responseData = {
                d: {
                    Id: '7C29BBB7-F172-4E7E-B463-4C2D81183ED5',
                    Title: newTopic.subject,
                    Body: newTopic.message,
                    EntityTypeName: 'TestForumList',
                    ListItemEntityTypeFullName: 'TestForumListItem'
                }
            };
            var mockAppWebUrl = spyBaseUrl + "/lists(guid'" + forum.id + "')/items";
            httpMock.expectPOST(spyContextInformationUrl).respond(JSON.stringify(contextInfoResponse));
            httpMock.expectPOST(mockAppWebUrl).respond(JSON.stringify(responseData));
            var topic, error;

            dataService.createTopic(forum, newTopic).then(function (data) {
                topic = data;
            }, function (_err) {
                error = _err.error;
            });
            httpMock.flush();

            expect(error).toBeUndefined();
            expect(topic).toBeDefined();
            expect(topic.forumNameOrId).toEqual(forum.id);
            expect(topic.id).toEqual(responseData.d.Id);
            expect(topic.subject).toEqual(responseData.d.Title);
            expect(topic.message).toEqual(responseData.d.Body);
        });

        it("createTopic returns new topic on host web forum", function () {
            var forumNameOrId = '__6FCA7D48-B590-46B9-A5BD-804DBEACEC0D';
            var nameOrId = forumNameOrId.substr(2);
            var forum = {
                id: forumNameOrId,
                name: 'TestForum',
                isQuestion: false,
                listItemEntityTypeFullName: 'TestForumListItem'
            };
            var newTopic = {
                subject: 'Test Topic',
                message: 'topic message'
            };
            var responseData = {
                d: {
                    Id: '7C29BBB7-F172-4E7E-B463-4C2D81183ED5',
                    Title: newTopic.subject,
                    Body: newTopic.message,
                    EntityTypeName: 'TestForumList',
                    IsQuestion: forum.isQuestion,
                    ListItemEntityTypeFullName: 'TestForumListItem'
                }
            };
            var mockHostWebUrl = spyHostWebBaseUrl + "/lists(guid'" + nameOrId + "')/items?@target='" + spyHostUrl + "'";
            httpMock.expectPOST(spyContextInformationUrl).respond(JSON.stringify(contextInfoResponse));
            httpMock.expectPOST(mockHostWebUrl).respond(JSON.stringify(responseData));
            var topic, error;

            dataService.createTopic(forum, newTopic).then(function (data) {
                topic = data;
            }, function (_err) {
                error = _err.error;
            });
            httpMock.flush();

            expect(error).toBeUndefined();
            expect(topic).toBeDefined();
            expect(topic.forumNameOrId).toEqual(forum.id);
            expect(topic.id).toEqual(responseData.d.Id);
            expect(topic.subject).toEqual(responseData.d.Title);
            expect(topic.message).toEqual(responseData.d.Body);
            expect(topic.isQuestion).toEqual(forum.isQuestion);
        });

        it("getTopicOrReply returns the given topic on host web", function () {
            var forumNameOrId = '__43CB507B-407D-4B88-B822-7D2B659E3F5D';
            var nameOrId = forumNameOrId.substr(2);
            var topicResponse = {
                d: {
                    Title: 'Topic 1',
                    Body: 'Test Question',
                    IsQuestion: true,
                    Modified: new Date(2013, 1, 23)
                }
            };
            var errorResponse = {
                error: {
                    message: {
                        value: 'some test error message'
                    }
                }
            };
            var topicNameOrId = 1;
            var mockUrl = spyHostWebBaseUrl + "/lists(guid'" + nameOrId + "')/items(" + topicNameOrId + ")?@target='" + spyHostUrl + "'&$select=" +
                discussionFields.join() + "&$expand=" + discussionExpandFields.join();
            httpMock.expectGET(mockUrl).respond(JSON.stringify(topicResponse));
            var topic1, error1;
            dataService.getTopicOrReply(forumNameOrId, topicNameOrId).then(
                function (data) {
                    topic1 = data;
                }, function (err) {
                    error1 = err;
                });
            httpMock.flush();

            expect(topic1).toBeDefined();
            expect(error1).toBeUndefined();
            expect(topic1.message).toEqual(topicResponse.d.Body);
            expect(topic1.subject).toEqual(topicResponse.d.Title);

            // handle error condition
            var topic2, error2;
            var errorCode = 500;
            httpMock.expectGET(mockUrl).respond(errorCode, JSON.stringify(errorResponse));
            dataService.getTopicOrReply(forumNameOrId, topicNameOrId).then(function () {
                topic2 = data;
            }, function (err) {
                error2 = err;
            });
            httpMock.flush();

            expect(topic2).toBeUndefined();
            expect(error2).toBeDefined();
            expect(error2.status).toEqual(errorCode);
            expect(error2.error).toEqual(errorResponse.error.message.value);
        });

        it("getTopics returns all topics of the given forum", function () {
            var response = {
                d: {
                    results: [
                        {
                            Title: 'Topic 1',
                            Body: 'Test Question',
                            IsQuestion: true,
                            Modified: new Date(2013, 1, 23)
                        },
                        {
                            Title: 'Topic 2',
                            Body: 'Test Question 2',
                            IsQuestion: false,
                            Modified: new Date(2014, 2, 13)
                        }
                    ]
                }
            };
            var errorResponse = {
                error: {
                    message: {
                        value: 'some test error message'
                    }
                }
            };
            var pageIndex = 0, pageSize = 20;
            var mockUrl = spyBaseUrl + "/lists/getbytitle('" + spyListName + "')/items?$filter=ParentItemID eq null&$top=" + pageSize + "&$skip=" + (pageIndex * pageSize) + "&$select=" +
                discussionFields.join() + "&$expand=" + discussionExpandFields.join() + "&orderby=Created desc";
            httpMock.expectGET(mockUrl).respond(JSON.stringify(response));
            var topics, error;
            dataService.getTopics(spyListName, pageIndex, pageSize).then(
                function (data) {
                    topics = data;
                }, function (err) {
                    error = err;
                });
            httpMock.flush(); 

            expect(topics.length).toEqual(2);
            expect(topics[0].message).toEqual(response.d.results[0].Body);
            expect(topics[0].subject).toEqual(response.d.results[0].Title);
            expect(error).toBeUndefined();

            // handle exception
            var errorCode = 500;
            httpMock.expectGET(mockUrl).respond(errorCode, JSON.stringify(errorResponse));
            var listData2, error2; 
            dataService.getTopics(spyListName, pageIndex, pageSize).then(
                function (data) {
                    listData2 = data;
                }, function (err) {
                    error2 = err;
                });
            httpMock.flush();

            expect(listData2).toBeUndefined();
            expect(error2).toBeDefined();
            expect(error2.status).toEqual(errorCode);
            expect(error2.error).toEqual(errorResponse.error.message.value);
        });

        it("getReplies returns specific error if forum is invalid", function () {
            var invalidListName = 'Discussions';
            var responseData = {
                error: {
                    code: "-1, System.ArgumentException",
                    message: {
                        lang: "en-US",
                        value: "List '" + invalidListName + "' does not exist at site with URL '" + spySiteUrl + "'."
                    }
                }
            };
            var fields = [], errorCode = 404;
            var topicNameOrId = 1;
            var mockUrl = /\/lists\/getbytitle\(/;
            httpMock.expectGET(mockUrl).respond(errorCode, responseData);
            var list, error;
            dataService.getReplies(invalidListName, topicNameOrId).then(function (data) {
                list = data;
            }, function (err) {
                error = err;
            });
            httpMock.flush();

            expect(list).toBeUndefined();
            expect(error).toBeDefined();
            expect(error.status).toEqual(errorCode);
            expect(error.error).toEqual(responseData.error.message.value);
        });

        it("createForum returns new forum on app web", function () {
            var newForum = {
                name: 'Test Forum',
                description: 'sample',
                onHostWeb: false
            };
            var responseData = {
                d: {
                    Id: '7C29BBB7-F172-4E7E-B463-4C2D81183ED5',
                    Title: "Test Forum",
                    Description: 'some forum',
                    ItemCount: 0,
                    EntityTypeName: 'TestForumList'
                }
            };
            var invalidUrl = 'http://invalid.com';
            var fields = [];
            var mockAppWebUrl = spyBaseUrl + "/lists";
            httpMock.expectPOST(spyContextInformationUrl).respond(JSON.stringify(contextInfoResponse));
            httpMock.expectPOST(mockAppWebUrl).respond(JSON.stringify(responseData));
            var forum, error;
           
            dataService.createForum(newForum).then(function (data) {
                forum = data;
            }, function (_err) {
                error = _err.error;
            });
            httpMock.flush();
            expect(error).toBeUndefined();
            expect(forum).toBeDefined();
            expect(forum.id).toEqual(responseData.d.Id);
            expect(forum.name).toEqual(responseData.d.Title);
            expect(forum.description).toEqual(responseData.d.Description);
            expect(forum.itemCount).toEqual(responseData.d.ItemCount);
            expect(forum.entityTypeName).toEqual(responseData.d.EntityTypeName);
        });

        it("createForum returns new forum on host web", function () {
            var newForum = {
                name: 'Test Forum',
                description: 'sample',
                onHostWeb: true
            };
            var newForumId = '__7C29BBB7-F172-4E7E-B463-4C2D81183ED5';
            var responseData = {
                d: {
                    Id: newForumId.substr(2),
                    Title: "Test Forum",
                    Description: 'some forum',
                    ItemCount: 0,
                    EntityTypeName: 'TestForumList'
                }
            };
            var invalidUrl = 'http://invalid.com';
            var fields = [];
            var mockHostWebUrl = spyHostWebBaseUrl + "/lists?@target='" + spyHostUrl + "'";
            httpMock.expectPOST(spyContextInformationUrl).respond(JSON.stringify(contextInfoResponse));
            httpMock.expectPOST(mockHostWebUrl).respond(JSON.stringify(responseData));
            var forum, error;

            dataService.createForum(newForum).then(function (data) {
                forum = data;
            }, function (_err) {
                error = _err.error;
            });
            httpMock.flush();
            expect(error).toBeUndefined();
            expect(forum).toBeDefined();
            expect(forum.id).toEqual(newForumId);
            expect(forum.name).toEqual(responseData.d.Title);
            expect(forum.description).toEqual(responseData.d.Description);
            expect(forum.itemCount).toEqual(responseData.d.ItemCount);
            expect(forum.entityTypeName).toEqual(responseData.d.EntityTypeName);
        });

        it("updateForum update an exist forum on app web", function () {
            var oldForum = {
                id: '68773E50-367E-4D3A-85E6-FAA1D2986BC0',
                name: 'Test Forum',
                description: 'sample',
                itemCount: 2,
                onHostWeb: false
            };
            var responseData = {
                d: {
                    Id: oldForum.id,
                    Title: oldForum.name,
                    Description: oldForum.description,
                    ItemCount: oldForum.itemCount,
                    EntityTypeName: oldForum.entityTypeName
                }
            };
            var invalidUrl = 'http://invalid.com';
            var fields = [];
            var mockAppWebUrl = spyBaseUrl + "/lists(guid'" + oldForum.id + "')";
            httpMock.expectPOST(spyContextInformationUrl).respond(JSON.stringify(contextInfoResponse));
            httpMock.expectPOST(mockAppWebUrl).respond(JSON.stringify(responseData));
            var forum, error;

            dataService.updateForum(oldForum).then(function (data) {
                forum = data;
            }, function (_err) {
                error = _err.error;
            });
            httpMock.flush();
            expect(error).toBeUndefined();
            expect(forum).toBeDefined();
            expect(forum.id).toEqual(responseData.d.Id);
            expect(forum.name).toEqual(responseData.d.Title);
            expect(forum.description).toEqual(responseData.d.Description);
            expect(forum.itemCount).toEqual(responseData.d.ItemCount);
            expect(forum.entityTypeName).toEqual(responseData.d.EntityTypeName);
        });

        it("createForum returns 403 security error", function () {
            var responsesData = {
                "odata.error": {
                    code: '-2130575251, Microsoft.SharePoint.SPException',
                    message: {
                        lang: "en-US",
                        value: "The security validation for this page is invalid and might be corrupted. Please use your web browser's Back button to try your operation again."
                    }
                }
            };
            var invalidUrl = 'http://invalid.com';
            var fields = [];
            var mockUrl = spyBaseUrl + "/lists";
            httpMock.expectPOST(spyContextInformationUrl).respond(JSON.stringify(contextInfoResponse));
            httpMock.expectPOST(mockUrl).respond(403, JSON.stringify(responsesData));
            var error;
            var newForum = { 
                name: 'Test Forum',
                description: 'sample',
                onHostWeb: false
            };
            dataService.createForum(newForum).then(function (data) {
            }, function (_err) {
                error = _err.error;
            });
            httpMock.flush();
            expect(error).toEqual(responsesData['odata.error'].message.value);
        });

        it("getContextInfo should return promise for digest", function () {
            httpMock.expectPOST(spyContextInformationUrl).respond(JSON.stringify(contextInfoResponse));
            var digest;
            dataService.getContextInfo().then(function (data) {
                digest = data;
            }, function (err) {
            });
            httpMock.flush();
            expect(digest).toBeDefined();
            expect(digest).toEqual(contextInfoResponse.d.GetContextWebInformation.FormDigestValue);
        });

        it("getForums returns all forums from host web and app web", function () {
            var response = {
                d: {
                    results: [
                        {
                            Id: '1', Title: 'General Forum', Description: 'General discussion list',
                            Created: new Date(), LastItemModifiedDate: new Date(), LastItemDeletedDate: new Date(),
                            ItemCount: 1000, ParentWebUrl: '/QuickDiscussion'
                        },
                        {
                            Id: '2', Title: 'Technical Forum', Description: 'Technical discussion list',
                            Created: new Date(), LastItemModifiedDate: new Date(), LastItemDeletedDate: new Date(),
                            ItemCount: 2000, ParentWebUrl: '/QuickDiscussion'
                        },
                        {
                            Id: '3', Title: 'Customer Forum', Description: 'Customer discussion list',
                            Created: new Date(), LastItemModifiedDate: new Date(), LastItemDeletedDate: new Date(),
                            ItemCount: 3000, ParentWebUrl: '/QuickDiscussion'
                        }
                    ]
                }
            };
            var discussionBoardTemplate = 108;
            var filter = encodeURI('$filter=((BaseTemplate eq ' + discussionBoardTemplate + ') and Hidden eq false)')
            var mockAppWebUrl = spyBaseUrl + "/lists?" + filter + "&$orderby=Title";
            httpMock.expectGET(mockAppWebUrl).respond(JSON.stringify(response));
            var mockHostWebUrl = spyHostWebBaseUrl + "/lists?@target='" + spyHostUrl + "'&" + filter + "&$orderby=Title";
            httpMock.expectGET(mockHostWebUrl).respond(JSON.stringify(response));
            var forums, error;
            dataService.getForums().then(
                function (data) {
                    forums = data;
                }, function (err) {
                    error = err;
                });
            httpMock.flush(); 
             
            expect(forums.length).toEqual(6);
            expect(forums[0].id).toEqual(response.d.results[0].Id);
            expect(forums[0].name).toEqual(response.d.results[0].Title);
            expect(error).toBeUndefined();
        });

        it("getForums should handle errors", function () {
            var errorResponse = {
                error: {
                    message: {
                        value: 'some test error message'
                    }
                }
            };
            // handle exception
            var errorCode = 500;
            var discussionBoardTemplate = 108;
            var filter = encodeURI('$filter=((BaseTemplate eq ' + discussionBoardTemplate + ') and Hidden eq false)')
            var mockAppWebUrl = spyBaseUrl + "/lists?" + filter + "&$orderby=Title";
            httpMock.expectGET(mockAppWebUrl).respond(errorCode, JSON.stringify(errorResponse));
            var mockHostWebUrl = spyHostWebBaseUrl + "/lists?@target='" + spyHostUrl + "'&" + filter + "&$orderby=Title";
            httpMock.expectGET(mockHostWebUrl).respond(errorCode, JSON.stringify(errorResponse));
            var forum, error;
            dataService.getForums().then(
                function (data) {
                    forum = data;
                }, function (err) {
                    error = err;
                });
            httpMock.flush();

            expect(forum).toBeUndefined();
            expect(error).toBeDefined();
            expect(error.status).toEqual(errorCode);
            expect(error.error).toEqual(errorResponse.error.message.value);
        })

        it("getTopicsByUser should return all topics from different forums for the user", function () {
           
            // mock call to retrieve forums 
            var forumResponse = {
                d: {
                    results: [
                        {
                            Id: '1', Title: 'General Forum', Description: 'General discussion list',
                            Created: new Date(), LastItemModifiedDate: new Date(), LastItemDeletedDate: new Date(),
                            ItemCount: 1000, ParentWebUrl: '/QuickDiscussion'
                        },
                        {
                            Id: '2', Title: 'Technical Forum', Description: 'Technical discussion list',
                            Created: new Date(), LastItemModifiedDate: new Date(), LastItemDeletedDate: new Date(),
                            ItemCount: 2000, ParentWebUrl: '/QuickDiscussion'
                        },
                        {
                            Id: '3', Title: 'Customer Forum', Description: 'Customer discussion list',
                            Created: new Date(), LastItemModifiedDate: new Date(), LastItemDeletedDate: new Date(),
                            ItemCount: 3000, ParentWebUrl: '/QuickDiscussion'
                        }
                    ]
                }
            };
            var discussionBoardTemplate = 108;
            var filter = encodeURI('$filter=((BaseTemplate eq ' + discussionBoardTemplate + ') and Hidden eq false)')
            var mockAppWebUrl = spyBaseUrl + "/lists?" + filter + "&$orderby=Title";
            httpMock.expectGET(mockAppWebUrl).respond(JSON.stringify(forumResponse));
            var mockHostWebUrl = spyHostWebBaseUrl + "/lists?@target='" + spyHostUrl + "'&" + filter + "&$orderby=Title";
            httpMock.expectGET(mockHostWebUrl).respond(JSON.stringify(forumResponse));

            // mock individual calls to retrieve topics by forum and user
            var topicResponse = {
                d: {
                    results: [
                        {
                            Id: 1,
                            Title: 'Topic 1',
                            Body: 'Test Question',
                            IsQuestion: true,
                            Modified: new Date(2013, 1, 23)
                        },
                        {
                            Id: 2,
                            Title: 'Topic 2',
                            Body: 'Test Question 2',
                            IsQuestion: false,
                            Modified: new Date(2014, 2, 13)
                        }
                    ]
                }
            };
            var getTopicResponse = function (index, forumTitle) {
                for (var i = 0; i < topicResponse.d.results.length; i++) {
                    topicResponse.d.results[i].Id = index + '-' + i;
                    topicResponse.d.results[i].Title = '[' + forumTitle + '] Topic' + index + '-' + i;
                }

                return topicResponse;
            };
            // regex look for order by DiscussionLastUpdate field
            var mockTopicUrl = /orderby=DiscussionLastUpdated/;
            // since we are returning 3 forums, we expect mock to return topics for 3 forums
            var numOfForums = forumResponse.d.results.length;
            // one for all app web forums
            for (var i = 0; i < numOfForums; i++) {
                httpMock.expectGET(mockTopicUrl).respond(JSON.stringify(getTopicResponse(i, forumResponse.d.results[i].Title)));
            }
            // one for all host web forums
            for (var i = 0; i < numOfForums; i++) {
                httpMock.expectGET(mockTopicUrl).respond(JSON.stringify(getTopicResponse(i, forumResponse.d.results[i].Title)));
            }

            var user = {
                id: 1,
                loginName: 'someone'
            };
            var topics, error;
            dataService.getTopicsByUser(user).then(function (data) {
                topics = data;
            }, function (err) {
                error = err;
            });
            httpMock.flush();

            expect(topics).toBeDefined();
            expect(error).toBeUndefined();
            expect(topics.length).toEqual(12);
        })
    })
});