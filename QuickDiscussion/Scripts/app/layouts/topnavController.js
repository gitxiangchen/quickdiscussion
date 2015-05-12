// use requirejs to load dependency on service class, e.g. app/services/settings then angularjs to inject dependency
define(['app/app', 'app/services/user', 'app/services/setting', 'app/services/data'], function (app) {
    'use strict';

    var controllerId = 'topnavController';
    var topnavController = function ($scope, $injector, common, spTokens, config, localize, userService, settingService, dataService) {
        var logger = common.logger.getLogger(controllerId);

        //$scope.chromeControlId = 'chrome_ctrl_placeholder';
        $scope.hostWebUrl = spTokens.SPHostUrl;
        $scope.isAdministrator = false;
        $scope.posts = [];
        
        $scope.onSearch = function () {
            if ($scope.searchText) {
                alert('search');
            }
        }

        $scope.about = function () {
            require(['app/layouts/aboutDialog'], function (dialogModule) {
                $injector.invoke([
                    dialogModule.serviceName, function (aboutDialogService) {
                        aboutDialogService.open().result.then(function () {
                        }, function () {
                        });
                    }]);
            });
        }

        $scope.setLanguage = function (language) {
            localize.setLanguage(language);
        }

        $scope.performAction = function (action) {
            eval(action);
            logger.info({ message: 'Perform action: ' + action });
        }

        $scope.getClass = function getClass(index, list) {
            if (list[index].url && list[index].url === '-')
                return 'divider';
            else
                return '';
        };

        initialize();
        activate();

        function initialize() {
            $scope.topMenus = [];
        }

        function activate() {
            var promises = [getSettings(), getCurrentUser(), checkPermission()];
            common.activateController(promises, controllerId)
                .then(function () { logger.trace({ message: 'Controller activated' }); });
        };

        function getSettings() {
            settingService.getSettingByScope('topNavigation')
                .then(function (settings) {
                    try {
                        var configuration = JSON.parse(settings.Configuration);
                        for (var i = 0; i < configuration.navigations.length; i++) {
                            var nav = configuration.navigations[i];
                            $scope.topMenus.push(nav);
                        }
                    } catch (ex) {
                        throw localize.getString('app.customization.invalidSettings', { error: ex.message });
                    }
                }, function (error) {
                    logger.error({ message: 'Error loading top navigation settings: ' + error });
                });
        };

        function getCurrentUser() {
            userService.getCurrentUser().then(function (user) {
                $scope.user = user;
                getUserPosts(user);
            }, function (error) {
                logger.error({ message: 'Failed to get current user: ' + error });
            });
        }

        function checkPermission() {
            userService.checkPermission(SP.PermissionKind.addAndCustomizePages).then(function (result) {
                $scope.isAdministrator = result;
                logger.info({ message: 'Check user permission as administrator: ' + result });
            });
        }

        function getUserPosts(user) {
            dataService.getTopicsByUser(user).then(function (data) {
                $scope.posts = data;
            }, function (err) {
                $scope.posts.length = 0;
            });
        }
        
        function renderChrome(common) {
            
            // The Help, Account and Contact pages receive the 
            //   same query string parameters as the main page
            var options = {
                "appIconUrl": "siteicon.png",
                "appTitle": "Chrome control app",
                "appHelpPageUrl": "Help.html?"
                    + document.URL.split("?")[1],
                // The onCssLoaded event allows you to 
                //  specify a callback to execute when the
                //  chrome resources have been loaded.
                //"onCssLoaded": "chromeLoaded()",
                "settingsLinks": [
                    {
                        "linkUrl": "Account.html?"
                            + document.URL.split("?")[1],
                        "displayName": "Account settings"
                    },
                    {
                        "linkUrl": "Contact.html?"
                            + document.URL.split("?")[1],
                        "displayName": "Contact us"
                    }
                ]
            };

            var nav = new SP.UI.Controls.Navigation('chrome_ctrl_placeholder', options);
            nav.setVisible(true);
        }
    };

    app.controller(controllerId, ['$scope', '$injector', 'common', 'spTokens', 'config', 'localize', 'userService', 'settingService', 'dataService', topnavController]);
});