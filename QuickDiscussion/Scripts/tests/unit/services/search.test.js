define(['app/app', 'app/services/search'], function (app) {
    'use strict';

    describe('Test search service', function () {

        var spTokens, httpMock, utils, searchService;
        var spyHostUrl = 'http://sharepoint.com';
        var spySiteUrl = 'http://test.com';
        var spyForumNameOrId = 'D9BEE1F1-A572-485F-8365-5742F0CEB291';
        var spyBaseUrl = '/_api/search/query';

        var searchResultResponse = {
            d: {
                query: {
                    PrimaryQueryResult: {
                        RelevantResults: {
                            Table: {
                                Rows: {
                                    results: []
                                }
                            }
                        }
                    }
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
                searchService = $injector.get('searchService');
                httpMock = $injector.get('$httpBackend');
            });
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        })

        it("search should return items found in specified forum", function () {
            var queryText = 'Test';

            for (var i = 0; i < 20; i++) {
                searchResultResponse.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.push({
                    Cells: {
                        results: [{
                            Key: "Title",
                            Value: "Search Result "+i,
                            ValueType: "Edm.String"
                        }, {
                            Key: "Author",
                            Value: "System Account",
                            ValueType: "Edm.String"
                        }, {
                            Key: "HitHighlightedSummary",
                            Value: "Posted: 7/17/2014 8:35 PM\r\nView Properties\r\n Reply <ddd/> /_layouts/15/userphoto.aspx?size=M&quot; alt=&quot;Picture Placeholder: System <ddd/> Some <c0>question</c0> 1\r\n0 7/17/2014 8:35 PM 7/17/2014 8:35 PM No <ddd/>",
                            ValueType: "Edm.String"
                        }, {
                            Key: "Path",
                            Value: "https://apps.sharepoint.com/QuickDiscussion/Lists/Discussions/1_.000",
                            ValueType: "Edm.String"
                        }, {
                            Key: "Description",
                            Value: null,
                            ValueType: null 
                        }, {
                            Key: "contentclass",
                            Value: "STS_ListItem_DiscussionBoard",
                            ValueType: "Edm.String"
                        }, {
                            Key: "ParentLink",
                            Value: "STS_ListItem_DiscussionBoard",
                            ValueType: "Edm.String"
                        }, {
                            Key: "LastModifiedTime",
                            Value: new Date(),
                            ValueType: "Edm.DateTime"
                        }, {
                            Key: "OriginalPath",
                            Value: "https://apps.sharepoint.com/QuickDiscussion/Lists/Discussions/1_.000",
                            ValueType: "Edm.String"
                        }]
                    }
                });
            }
            var mockAppWebUrl = spyBaseUrl + "?queryText='" + queryText + " AND (ContentClass=\"STS_ListItem_DiscussionBoard\" OR contentClass=\"STS_List_DiscussionBoard\") AND ListId:" + spyForumNameOrId + "'";
            httpMock.expectGET(mockAppWebUrl).respond(JSON.stringify(searchResultResponse));
            
            var searchResults, error;
            searchService.search(queryText, spyForumNameOrId).then(function (results) {
                searchResults = results;
            }, function (err) {
                error = err;
            });
            httpMock.flush();

            expect(searchResults).toBeDefined();
            expect(error).toBeUndefined();

            expect(searchResults.length).toEqual(searchResultResponse.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.length);
            expect(searchResults[0].title).toEqual('Search Result 0');
            expect(searchResults[0].author).toEqual('System Account');
            expect(searchResults[0].summary).toContain('Posted');
            expect(searchResults[0].path).toContain('https://apps.sharepoint.com');
        })
    })
})