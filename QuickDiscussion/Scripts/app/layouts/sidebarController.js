define(['app/app'], function (app) {
    'use strict';

    var controllerId = 'sidebarController';
    var sidebarController = function ($route, config, routeConfig) {

        var vm = this;
        vm.isCurrent = isCurrent;

        activate();

        function activate() {
            loadNavRoutes();
        }

        function loadNavRoutes() {
            vm.navRoutes = routeConfig.routes.filter(function (r) {
                return r.config.settings && r.config.settings.nav;
            }).sort(function (r1, r2) {
                return r1.config.settings.nav > r2.config.settings.nav;
            });
        }

        function isCurrent(route) {
            if (!route.config.title || !$route.current || !$route.current.title) {
                return '';
            }
            var menuName = route.config.title;
            return $route.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
        }
    };

    app.controller(controllerId, ['$route', 'config', 'routeConfig', sidebarController]);
});
