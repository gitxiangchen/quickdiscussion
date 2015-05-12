define(['app/app', 'mocks/settings'], function (app, mockSettings) {
    'use strict';

    var UserService = (function () {
        function UserService($q, $resource, spTokens, appTokens, utils, localize) {
            this.utils = utils;
            this.localize = localize;
            this.qService = $q;
            this.users = [
                { loginName: 'Xiang.Chen@sharepoint.com', id: 1, email: 'Xiang.Chen@sharepoint.com', title: 'Xiang Chen' },
                { loginName: 'Joe.Doe@sharepoint.com', id: 2, email: 'Joe.Doe@sharepoint.com', title: 'Joe Doe' }
            ];
        }

        UserService.prototype.getCurrentUser = function () {
            return this.qService.when(this.users[0]);
        };

        UserService.prototype.checkEffectivePermissions = function (success, failure) {
            var hasCustomizePagePermissionResponse = {
                d: {
                    EffectiveBasePermissions: {
                        "__metadata": {
                            type: "SP.BasePermissions"
                        },
                        "High": "2147483647",
                        "Low": "4294967295"
                    }
                }
            };
            var noCustomizePagePermissionResponse = {
                d: {
                    EffectiveBasePermissions: {
                        "__metadata": {
                            type: "SP.BasePermissions"
                        },
                        "High": "176",
                        "Low": "138612833"
                    }
                }
            };

            if (mockSettings.MockSettings.userHasPermission) {
                success(hasCustomizePagePermissionResponse);
            } else {
                success(noCustomizePagePermissionResponse);
            }
        };

        UserService.prototype.checkUserEffectivePermissions = function (user, success, failure) {
            success(true);
        };

        UserService.prototype.checkPermission = function (perm, success) {
            var defer = this.qService.defer();
            this.checkEffectivePermissions(function (data) {
                var permissions = new SP.BasePermissions();
                permissions.fromJson(data.d.EffectiveBasePermissions);
                defer.resolve(permissions.has(perm));
            }, function (err) {
                defer.resolve(false);
            });
            return defer.promise;
        };

        UserService.prototype.checkUserPermission = function (user, perm, success) {
            this.checkUserEffectivePermissions(user, function (data) {
                var permissions = new SP.BasePermissions();
                permissions.fromJson(data.d.GetUserEffectivePermissions);
                success(permissions.has(perm));
            }, function (err) {
                success(false);
            });
        };
        
        UserService.prototype.handleError = function (err, failure) {
            if (failure) {
                if (this.utils.checkNestedProperty(err, 'data>error>message>value')) {
                    err = err.data.error.message.value;
                }
                failure(err);
            }
        };

        return UserService;
    })();
    var serviceName = 'userService';
    app.service(serviceName, ['$q', '$resource', 'spTokens', 'appTokens', 'utils', 'localize', UserService]);
});