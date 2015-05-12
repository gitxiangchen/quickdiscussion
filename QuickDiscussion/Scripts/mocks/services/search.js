define(['app/app'], function (app) {
    'use strict';

    var serviceName = 'searchService';
    var SearchService = (function () {
        function SearchService($q, $http, spTokens, appTokens, utils, common) {
            this.qService = $q;
            this.httpService = $http;
            this.spTokens = spTokens;
            this.appTokens = appTokens;
            this.utils = utils;
            this.logger = common.logger.getLogger(serviceName);

            this.isOnHostWeb = function (forumNameOrId) {
                return (forumNameOrId && forumNameOrId.indexOf('__') === 0);
            }

            this.fromSPResult = function (spResult) {
                return spResult;
            };
        }

        SearchService.prototype.search = function (queryText, forumNameOrId) {
            var results = [];
            var totalCount = 100;
            var pageIndex = 0, pageSize = 20;
            var start = pageIndex * pageSize;
            var end = pageSize;
            if (totalCount - start < end) {
                end = totalCount - start;
            }
            var postfix = this.isOnHostWeb(forumNameOrId) ? ' (host web)' : '';
            if (queryText.indexOf('fail') === -1 && queryText.indexOf('error') === -1) {
                for (var i = start; i < end; i++) {
                    results.push({
                        title: 'Search (' + queryText + ') result ' + i,
                        author: 'Author ' + i,
                        summary: 'Posted(' + i + '): 7/17/2014 8:35 PM\r\nView Properties\r\n Reply <ddd/> /_layouts/15/userphoto.aspx?size=M&quot; alt=&quot;Picture Placeholder: System <ddd/> Some <c0>question</c0> 1\r\n0 7/17/2014 8:35 PM 7/17/2014 8:35 PM No <ddd/>',
                        path: 'https://apps.sharepoint.com/QuickDiscussion/Lists/Discussions/1_.000'
                    });
                }
            }
            var returnData = true;
            var defer = this.qService.defer();
            if (returnData) {
                defer.resolve(results);
            } else {
                handleError(defer, 404, 'Error searching forum');
            }

            return defer.promise;
        };

        SearchService.prototype.postSearch = function (queryText, forumNameOrId) {
            var results = [];
            var totalCount = 100;
            var pageIndex = 0, pageSize = 20;
            var start = pageIndex * pageSize;
            var end = pageSize;
            if (totalCount - start < end) {
                end = totalCount - start;
            }
            var postfix = this.isOnHostWeb(forumNameOrId) ? ' (host web)' : '';
            if (queryText.indexOf('fail') === -1 && queryText.indexOf('error') === -1) {
                for (var i = start; i < end; i++) {
                    results.push({
                        title: 'Search (' + queryText + ') result ' + i,
                        author: 'Author ' + i,
                        summary: 'Posted(' + i + '): 7/17/2014 8:35 PM\r\nView Properties\r\n Reply <ddd/> /_layouts/15/userphoto.aspx?size=M&quot; alt=&quot;Picture Placeholder: System <ddd/> Some <c0>question</c0> 1\r\n0 7/17/2014 8:35 PM 7/17/2014 8:35 PM No <ddd/>',
                        path: 'https://apps.sharepoint.com/QuickDiscussion/Lists/Discussions/1_.000'
                    });
                }
            }
            var returnData = true;
            var defer = this.qService.defer();
            if (returnData) {
                defer.resolve(results);
            } else {
                handleError(defer, 404, 'Error searching forum');
            }

            return defer.promise;
        };

        SearchService.prototype.suggest = function (queryText) {
            return this.httpService.get('http://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: queryText,
                    sensor: false
                }
            }).then(function (result) {
                var addresses = [];
                angular.forEach(result.data.results, function (item) {
                    addresses.push(item.formatted_address);
                });
                return addresses;
            });
        };

        function handleError(defer, status, err) {
            var error = {
                status: status,
                error: err
            };
            return defer.reject(error);
        };

        return SearchService;
    })();
    app.service(serviceName, ['$q', '$http', 'spTokens', 'appTokens', 'utils', 'common', SearchService]);
});