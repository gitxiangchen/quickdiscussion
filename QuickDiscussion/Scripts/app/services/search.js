define(['app/app'], function (app) {
    'use strict';

    var searchODataUrl = "/_api/search/query";
    var postSearchODataUrl = "/_api/search/postquery";
    var suggestODataUrl = "/_api/search/suggest";

    var serviceName = 'searchService';
    var SearchService = (function () {
        function SearchService($q, $http, spTokens, appTokens, utils, common) {
            this.qService = $q;
            this.httpService = $http;
            this.spTokens = spTokens;
            this.appTokens = appTokens;
            this.utils = utils;
            this.logger = common.logger.getLogger(serviceName);

            this.getSearchODataUrl = function () {
                return this.spTokens.SPAppWebUrl + searchODataUrl;
            };

            this.getSuggestODataUrl = function () {
                return this.spTokens.SPAppWebUrl + suggestODataUrl;
            }
            
            this.buildSearchQuery = function (queryText, forumNameOrId) {
                var query = "?queryText='" + encodeURI(queryText);
                // restrict to only discussion list and items
                query += ' AND (ContentClass="STS_ListItem_DiscussionBoard" OR contentClass="STS_List_DiscussionBoard")';
                if (forumNameOrId) {
                    var forumId = this.getForumNameOrId(forumNameOrId);
                    // if forum is known, restrict to that forum list only
                    if (this.utils.isValidGuid(forumId)) {
                        query += ' AND ListId:' + forumId;
                    }
                }
                query += "'";
                // TODO: seems 'sortlist' query parameter is no longer supported
                //query += "&sortlist='rank:descending,modifiedby:ascending'";
                //query += "&enablestemming=false&enablephonetic=true&enablenicknames=true&rowlimit=100&selectproperties='SiteName,Author,Title,Path,Description,Wite,Rank,Size,HITHIGHLIGHTEDSUMMARY,IsDocument,ContentClass'&clienttype='Custom'";//&culture=0409";
                return query;
            }

            this.buildSuggestQuery = function (queryText) {
                var query = "?queryText='" + encodeURI(queryText) + "'";
                query += "&fprequerysuggestions=true&showpeoplenamesuggestions=true&fhithighlighting=true&fcapitalizefirstletters=true";
                return query;
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

            this.fromSPResult = function (spResult) {
                var cellResults = spResult.Cells.results;
                var title = find(cellResults, "Title");
                var author = find(cellResults, "Author");
                var summary = find(cellResults, "HitHighlightedSummary");
                var path = find(cellResults, "Path");
                var isDocument = find(cellResults, "IsDocument"); // value false or Edm.Boolean
                var importance = find(cellResults, "importance"); // value 0 or Edm.Int64
                var lastModified = find(cellResults, "LastModifiedTime"); // value "2014-08-13T15:29:19.0000000Z" or Edm.DateTime

                var result = {
                    title: title && title.length > 0 ? title[0].Value : '',
                    author: author && title.length > 0 ? author[0].Value : '',
                    summary: summary && summary.length > 0 ? summary[0].Value : '',
                    path: path && path.length > 0 ? path[0].Value : '',
                    lastModified: lastModified && lastModified.length > 0 ? lastModified[0].Value : null,
                    isDocument: isDocument && isDocument.length > 0 ? isDocument[0].Value : false,
                    importance: importance && importance.length > 0 ? importance[0].Value : 0
                };
                return result;
            }

            this.fromSPSuggest = function (spSuggest) {
                var result = {
                    peopleNames: spSuggest.PeopleNames.results,
                    personalResults: spSuggest.PersonalResults.results,
                    queries: spSuggest.Queries.results
                };
                return result;
            }

            // returns the forum name or ID, remove '__' if appended for host web forum
            this.getForumNameOrId = function (forumNameOrId) {
                return this.isOnHostWeb(forumNameOrId) ? forumNameOrId.substr(2) : forumNameOrId;
            }

            // returns true if forum name or ID indicates a host web forum
            this.isOnHostWeb = function (forumNameOrId) {
                return (forumNameOrId && forumNameOrId.indexOf('__') === 0);
            }

            // helper method to locate result from search results
            function find(results, name) {
                var found = _.filter(results, function (result) {
                    return result.Key == name;
                });

                return found;
            }
        }

        SearchService.prototype.search = function (queryText, forumNameOrId) {
            var self = this;
            var url = this.getSearchODataUrl();
            url += this.buildSearchQuery(queryText, forumNameOrId);
            return this.httpService({
                method: 'GET',
                url: url,
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                // lazily constructing message only if logging level is set by using a function
                var logMessage = function () {
                    var message = 'Search result[' + successResponse.data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.length + ']: \r\n';
                    if (successResponse.data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.length > 0) {
                        var spResult = successResponse.data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[0];
                        var cellResults = spResult.Cells.results;
                        _.each(cellResults, function (cellResult) {
                            message += 'key=' + cellResult.Key + ' value=' + cellResult.Value;
                            message += '\r\n';
                        });
                    }
                    return message;
                };
                self.logger.trace({ message: logMessage });
                var results = (successResponse.data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results).map(function (value) {
                    var result = self.fromSPResult(value);
                    return result;
                });
                self.logger.debug({ message: 'search returns (' + results.length + ') results' });
                return results;

            }, function (errorResponse) {
                return self.handleError(errorResponse);
            });
        }

        SearchService.prototype.postSearch = function (queryText) {
            var self = this;
            var url = this.spTokens.SPAppWebUrl + postSearchODataUrl;
            var post = {
                "__metadata": { "type": "Microsoft.Office.Server.Search.REST.SearchRequest" },
                "Querytext": queryText
            };
            return this.httpService({
                method: 'POST',
                url: url,
                data: JSON.stringify(post),
                headers: { Accept: 'application/json;odate=verbose' }
            }).then(function (successResponse) {
                var results = (successResponse.data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results).map(function (value) {
                    var result = self.fromSPResult(value);
                    return result;
                });
                self.logger.debug({ message: 'post search returns (' + results.length + ') results' });
                return results;
            }, function (errorResponse) {
                self.handleError(errorResponse);
            });
        }

        SearchService.prototype.suggest = function (queryText) {
            var self = this;
            var url = this.getSuggestODataUrl();
            url += this.buildSuggestQuery(queryText);
            return this.httpService({
                method: 'GET',
                url: url,
                headers: { Accept: 'application/json;odata=verbose' }
            }).then(function (successResponse) {
                var results = [];
                angular.forEach(successResponse.data.suggest, function (item) {
                    var result = self.fromSPSuggest(item);
                    results.push(result);
                });
                return results;
            }, function (errorResponse) {
                return self.handleError(errorResponse);
            });
        }

        return SearchService;
    })();

    app.service(serviceName, ['$q', '$http', 'spTokens', 'appTokens', 'utils', 'common', SearchService]);
})