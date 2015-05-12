define(['require', 'exports', 'app/app'], function (require, exports, app) {
    'use strict';

    exports.serviceName = 'userService';
    var UserService = (function () {
        function UserService($q, $resource, spTokens, appTokens, utils, localize) {
            this.utils = utils;
            this.localize = localize;
            this.$q = $q;

            var oDataUrl = spTokens.SPAppWebUrl + "/_api/web";
            this.spUserService = $resource(oDataUrl, null, {
                getCurrentUser: {
                    method: 'GET',
                    url: spTokens.SPAppWebUrl + "/_api/web/currentUser",
                    headers: {
                        Accept: 'application/json;odata=verbose'
                    }
                },
                checkEffectivePermissions: {
                    method: 'GET',
                    url: spTokens.SPAppWebUrl + "/_api/web/effectiveBasePermissions",
                    headers: {
                        Accept: 'application/json;odata=verbose'
                    }
                },
                checkUserEffectivePermissions: {
                    method: 'GET',
                    params: { user: '@user' },
                    url: spTokens.SPAppWebUrl + "/_api/web/getusereffectivepermissions(@user)?@user=':user'",
                    headers: {
                        Accept: 'application/json;odata=verbose'
                    }
                }
            });
        }

        UserService.prototype.getCurrentUser = function () {
            var service = this;
            var defer = service.$q.defer();
            service.spUserService.getCurrentUser(null, function (data) {
                var user = {
                    id: data.d.Id,
                    email: data.d.Email,
                    title: data.d.Title,
                    loginName: data.d.LoginName
                };
                defer.resolve(user);
            }, function (err) {
                defer.reject(service.localize.getString('app.user.currentUserError', { error: service.getErrorMessage(err) }));
            });

            return defer.promise;
        };

        UserService.prototype.checkEffectivePermissions = function () {
            var service = this;
            var defer = service.$q.defer();
            service.spUserService.checkEffectivePermissions(null, function (data) {
                var permissions = new SP.BasePermissions();
                permissions.fromJson(data.d.EffectiveBasePermissions);
                defer.resolve(permissions);
            }, function (err) {
                defer.reject(service.localize.getString('app.user.currentUserPermissionsError', { error: service.getErrorMessage(err) }));
            });
            return defer.promise;
        };

        UserService.prototype.checkUserEffectivePermissions = function (user) {
            var service = this;
            var defer = service.$q.defer();
            service.spUserService.checkUserEffectivePermissions({ user: user }, function (data) {
                var permissions = new SP.BasePermissions();
                permissions.fromJson(data.d.EffectiveBasePermissions);
                defer.resolve(permissions);
            }, function (err) {
                defer.reject(service.localize.getString('app.user.specifiedUserPermissionsError', { user: user, error: service.getErrorMessage(err) }));
            });
            return defer.promise;
        };

        UserService.prototype.checkPermission = function (perm) {
            return this.checkEffectivePermissions().then(function (permissions) {
                return permissions.has(perm);
            });
        };

        UserService.prototype.checkPermissions = function (perms) {
            this.checkEffectivePermissions(function (permissions) {
                var result = new Array(perms.length);
                for (var i = 0; i < perms.length; i++) {
                    result[i] = permissions.has(perms[i]);
                }
                return result;
            });
        };

        UserService.prototype.checkUserPermission = function (user, perm) {
            return this.checkUserEffectivePermissions(user).then(function (permissions) {
                return permissions.has(perm);
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

        UserService.prototype.getErrorMessage = function (err) {
            if (this.utils.checkNestedProperty(err, 'data>error>message>value')) {
                return err.data.error.message.value;
            }

            return err.toString();
        };

        return UserService;
    })();
    
    app.service(exports.serviceName, ['$q', '$resource', 'spTokens', 'appTokens', 'utils', 'localize', UserService]);
});