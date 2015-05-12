define(['require', 'exports', 'app/configuration/routeResolver', 'app/configuration/routeConfig'], function (require, exports) {
    'use strict';

    exports.appModuleName = 'quickDiscussionApp';
    // I was kept getting error 'Attempting to use an unsafe value in a safe context' when I know it is from
    // the two ng-include from shell.html, find the following thread indicates that we need to include both
    // angular-sanitize.js in file reference, as well as app module dependency below for the error to be gone
    // http://stackoverflow.com/questions/9381926/insert-html-into-view-using-angularjs
    var app = angular.module(exports.appModuleName,
        ['ngRoute', 'ngResource', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'routeResolver', 'routeConfig', 'ngGrid', 'textAngular', 'angular-bootstrap-select', 'angular-bootstrap-select.extra', 'common', 'utility', 'localization']);

    // After the AngularJS has been bootstrapped, you can no longer use the normal module API (ex, app.controller)
    // to add components to the dependency-injection container. Instead, you have to use the relevant providers. Since
    // those are only available during the config() method at initialization time, we have to keep a reference to them.
    // NOTE: This general idea is based on excellent article by
    // Ifeanyi Isitor: http://ify.io/lazy-loading-in-angularjs/
    app.config(['$routeProvider', 'routeResolverProvider', 'routeConfigProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
        function ($routeProvider, routeResolverProvider, routeConfigProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {

            // change default route for controller and view, we do not use '/app/views/'
            // and '/app/controlls' etc but use feature name for folder structure and
            // use naming convention for template file and controller file. Here we set the base 
            // to be 'app/' and controller dependency will be using requirejs config to build the 
            // right path, but for view, we have explicitly set to be relative to the app start page
            routeResolverProvider.routeConfig.setBaseDirectory('app/', '../scripts/app/');

            // define dynamically loaded route for controllers/views
            var route = routeResolverProvider.route;
            routeConfigProvider.routes.forEach(function (r) {
                $routeProvider.when(r.url, route.resolve(r.config));
            });
            $routeProvider.otherwise({ redirectTo: '/' });

            /** using the following is convenient but not unit testable:
             *  instead we will rewrite app.controller, app.service and etc. to keep 
             *  the same module API but with the underlying provider implementation
             */
            app.register = {
                controller: $controllerProvider.register,
                directive: $compileProvider.directive,
                filter: $filterProvider.register,
                factory: $provide.factory,
                service: $provide.service
            };

            // keep the older references
            app._controller = app.controller;
            app._service = app.service;
            app._factory = app.factory;
            app._value = app.value;
            app._directive = app.directive;

            // overwrite module API with provider-based controller
            app.controller = function (name, constructor) {
                $controllerProvider.register(name, constructor);
                return (this);
            };
            // overwrite module API with provider-based service
            app.service = function (name, constructor) {
                $provide.service(name, constructor);
                return (this);
            };
            // overwrite module API with provider-based factory
            app.factory = function (name, factory) {
                $provide.factory(name, factory);
                return (this);
            };
            // overwrite module API with provider-based value
            app.value = function (name, value) {
                $provide.value(name, value);
                return (this);
            };
            // overwrite module API with provider-based directive
            app.directive = function (name, factory) {
                $compileProvider.directive(name, factory);
                return (this);
            };
            // overwrite module API with provider-based filter
            app.filter = function (name, filter) {
                $filterProvider.register(name, filter);
                return (this);
            }

        }]);

    return app;
});