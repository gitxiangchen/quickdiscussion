define(['app/app', 'app/services/user', 'app/resources/en/strings'], function (app, user, strings) {
    'use strict';

    describe("Test user service module", function () {
        var spTokens, userService, httpMock;
        var localizationResponse = {
            strings: {
                app: {
                    services: {
                        user: {
                            getCurrentUserError: 'Error get current user'
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
                userService = $injector.get('userService');
                httpMock = $injector.get('$httpBackend');
            }); 
        });

        afterEach(function () {
            httpMock.verifyNoOutstandingExpectation();
            httpMock.verifyNoOutstandingRequest();
        });

        it('should return the current user', function () {
            var spyGetCurrentUserUrl = '/_api/web/currentUser';
            var userResponse = {
                d: {
                    '__metadata': {
                        id: 'https://apps-af7452177e7653.sharepoint.com/MyApp',
                        uri: 'https://apps-af7452177e7653.sharepoint.com/MyApp/_api/Web/GetUserById(11)',
                        type: 'SP.User'
                    },
                    Id: 11,
                    LoginName: 'i:0#.f|membership|someone@apps.onmicrosoft.com',
                    Title: 'Someone',
                    PrincipalType: 1,
                    Email: 'someone@apps.onmicrosoft.com'
                }
            };
            httpMock.expectGET(spyGetCurrentUserUrl).respond(JSON.stringify(userResponse));
            var result, error;
            userService.getCurrentUser().then(function (user) {
                result = user;
            }, function (err) {
                error = err;
            });

            httpMock.flush();

            expect(error).toBeUndefined();
            expect(result.email).toEqual('someone@apps.onmicrosoft.com');
            expect(result.id).toEqual(11);
            expect(result.loginName).toEqual('i:0#.f|membership|someone@apps.onmicrosoft.com');
            expect(result.title).toEqual('Someone');
        });
        
        it('should return the current users effective permissions', function () {
            var spyCheckEffectivePermissionsUrl = '/_api/web/effectiveBasePermissions';
            var permissionResponse = {
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
            httpMock.expectGET(spyCheckEffectivePermissionsUrl).respond(JSON.stringify(permissionResponse));
            var result, error;
            userService.checkEffectivePermissions().then(function (data) {
                result = data;
            }, function (err) {
                error = err;
            });

            httpMock.flush();
            expect(result).toBeDefined();
            // expect a valid SP.BasePermissoins object
            expect(result.data["__metadata"]["type"]).toEqual("SP.BasePermissions");
            expect(result.data["High"]).toBeDefined();
            expect(result.data["Low"]).toBeDefined();
            expect(error).toBeUndefined();
        });
        
        it('should return a given users effective permissions', function () {
            var spyCheckUserEffectivePermissionsUrl = "/_api/web/getusereffectivepermissions(@user)?@user='someone'";
            var permissionResponse = {
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
            httpMock.expectGET(spyCheckUserEffectivePermissionsUrl).respond(JSON.stringify(permissionResponse));
            var result, error;
            userService.checkUserEffectivePermissions('someone').then(function (data) {
                result = data;
            }, function (err) {
                error = err;
            });

            httpMock.flush();

            expect(error).toBeUndefined();
            expect(result).toBeDefined();
            // expect a valid SP.BasePermission object
            expect(result.data["__metadata"]["type"]).toEqual("SP.BasePermissions");
            expect(result.data["High"]).toBeDefined();
            expect(result.data["Low"]).toBeDefined();
        });
        
        it('should return true if current user has AddAndManagePage permission', function () {
            var spyCheckEffectivePermissionsUrl = '/_api/web/effectiveBasePermissions';
            var permissionResponse = {
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
            httpMock.expectGET(spyCheckEffectivePermissionsUrl).respond(JSON.stringify(permissionResponse));
            var data, error;
            userService.checkPermission(SP.PermissionKind.addAndCustomizePages).then(function (result) {
                data = result;
            }, function (err) {
                error = err;
            });

            httpMock.flush();

            expect(error).toBeUndefined();
            expect(data).toBeTruthy();
        });
        
        it('should return false if current user does not have the specified permission', function () {
            var spyCheckPermissionUrl = '/_api/web/effectiveBasePermissions';
            var permissionResponse = {
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
            httpMock.expectGET(spyCheckPermissionUrl).respond(JSON.stringify(permissionResponse));
            var data;
            userService.checkPermission(SP.PermissionKind.addAndCustomizePages).then(function (result) {
                data = result;
            });

            httpMock.flush();
            expect(data).toBeFalsy();
        });
        
        it('should handle nested error message and code when permission check fails', function () {
            var spyGetCurrentUserUrl = '/_api/web/currentUser';
            var userResponse = {
                error: {
                    message: {
                        value: 'Something went wrong'
                    }
                }
            };
            httpMock.expectGET(spyGetCurrentUserUrl).respond(404, JSON.stringify(userResponse));
            var result, error;
            userService.getCurrentUser().then(function (user) {
                result = user;
            }, function (err) {
                error = err;                
            });

            httpMock.flush();

            expect(result).toBeUndefined();
            expect(error).toBeDefined();
            expect(error).toContain(userResponse.error.message.value);
        });
          
    });
});