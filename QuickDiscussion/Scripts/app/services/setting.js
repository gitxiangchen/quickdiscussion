define(['require', 'exports', 'app/app'], function (require, exports, app) {
    'use strict';
    
    exports.serviceName = 'settingService';

    var settingListName = 'ForumSettings';
    // __metadata list item type, ListItemEntityTypeFullName property of the list
    var settingListItemType = 'SP.Data.' + settingListName + 'ListItem';

    var SettingService = (function () {
        function SettingService($q, $resource, spTokens, appTokens, utils) {
            this.qService = $q;
            this.spTokens = spTokens;
            this.appTokens = appTokens;
            this.utils = utils;

            // angularjs $resource settings for retrieving, updating setting items
            this.oDataUrl = spTokens.SPAppWebUrl + "/_api/web/lists/getbytitle('" + settingListName + "')/items";
            this.spSettingService = $resource(this.oDataUrl, null, {
                getContextInfo: {
                    method: 'POST',
                    url: spTokens.SPAppWebUrl + "/_api/contextinfo",
                    headers: { Accept: 'application/json;odata=verbose' }
                },
                getSettings: {
                    method: 'GET',
                    url: this.oDataUrl + "?$select=ID,Scope,Configuration,DateModified,ModifiedById",
                    headers: { Accept: 'application/json;odata=verbose' }
                },
                getSetting: {
                    method: 'GET',
                    params: { id: '@id' },
                    url: this.oDataUrl + "(:id)?$select=ID,Scope,Configuration,DateModified,ModifiedById",
                    headers: { Accept: 'application/json;odata=verbose' }
                },
                getSettingByScope: {
                    method: 'GET',
                    params: { scope: '@scope' },
                    url: this.oDataUrl + "?$filter=Scope eq ':scope'&$select=ID,Scope,Configuration,DateModified,ModifiedById",
                    headers: { Accept: 'application/json;odata=verbose' }
                },
                addSetting: {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose', 'X-RequestDigest': getDigestValue
                    }
                },
                updateSetting: {
                    method: 'POST',
                    params: { id: '@id' },
                    url: this.oDataUrl + "(:id)",
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'X-HTTP-Method': 'MERGE', 'IF-MATCH': '*',
                        'Content-Type': 'application/json;odata=verbose', 'X-RequestDigest': getDigestValue
                    }
                },
                deleteSetting: {
                    method: 'POST',
                    params: { id: '@id' },
                    url: this.oDataUrl + "(:id)",
                    headers: {
                        Accept: 'application/json;odata=verbose', 'IF-MATCH': '*',
                        'X-RequestDigest': getDigestValue, 'X-HTTP-Method': 'DELETE'
                    }
                }
            });

            // When you send a POST request, you must pass the server's request form digest value in the
            // X-RequestDigest header. For sharepoint-hosted, "X-RequestDigest": $("#__REQUESTDIGEST").val()
            // for provider or auto-hosted, they get the value by sending a request to the contextinfo endpoint
            var service = this;
            var getDigestValue = function () {
                return service.digestValue;
            };

            this.handleError = function (status, err) {
                if (utils.checkNestedProperty(err, 'error>message>value')) {
                    err = err.error.message.value;
                }
                var error = {
                    status: status,
                    error: err
                };
                return this.qService.reject(error);
            };
        }

        SettingService.prototype.getSettingByScope = function (scope) { 
            var service = this; 
            return this.spSettingService.getSettingByScope({ scope: scope }).$promise.then(function (successResponse) {
                return successResponse.d.results[0];
            }, function (errorResponse) {
                return service.handleError(errorResponse.status, errorResponse.error);
            });
        }

        return SettingService;
    })();

    app.service(exports.serviceName, ['$q', '$resource', 'spTokens', 'appTokens', 'utils', SettingService]);
});