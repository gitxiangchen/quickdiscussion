/**
 * Angular service provider that uses convention to load controller and view dynamically.
 */
define([], function () {
    'use strict';

    var moduleName = 'routeResolver';
    // NOTE: the provider will be available under provider name + 'Provider' key.
    var providerName = 'routeResolver';

    // see http://docs.angularjs.org/api/AUTO.$provide for creating service provider
    var routeResolver = function () {

        // The service providers are constructor functions. When instantiated they must 
        // contain a property called $get, which holds the service factory function.
        this.$get = function () {
            return this;
        };

        this.routeConfig = function () {
            var baseDirectory = 'app/',
                viewDirectory = 'app/views/', // this is overridden by initial setup, see app.js
                controllerDirectory = 'app/controllers/'; // this is overriden by initial setup

            var getBaseDirectory = function () {
                return baseDirectory;
            };

            var setBaseDirectory = function (base, viewBase, controllerBase) {
                baseDirectory = base;
                viewDirectory = viewBase || base;
                controllerDirectory = controllerBase || base;
            };

            var getViewDirectory = function () {
                return viewDirectory;
            };

            var getControllerDirectory = function () {
                return controllerDirectory;
            };

            return {
                getViewDirectory: getViewDirectory,
                getControllerDirectory: getControllerDirectory,
                setBaseDirectory: setBaseDirectory
            };
        }();

        this.route = function (routeConfig) {
            // load angularjs $log service for safe console log, ng module must be explicitly listed
            // see http://docs.angularjs.org/api/ng/function/angular.injector
            var injector = angular.injector(['ng', 'utility', 'common']);
            var logger = injector.get('logger').getLogger(providerName);
            var resolve = function (config) {
                if (!config.path) config.path = '';

                var routeDef = {};
                // use file naming convention instead of folder convention to load controller/view
                routeDef.templateUrl = routeConfig.getViewDirectory() + config.path + config.title + '.html';
                logger.debug({ message: 'Load controller view template ' + routeDef.templateUrl });
                routeDef.controller = config.title + 'Controller';
                routeDef.title = config.title; // sidebar uses it to determine if current route is active
                routeDef.resolve = {
                    load: ["$q", "$rootScope", function ($q, $rootScope) {
                        var dependencies = [];
                        if (config.dependencies) {
                            config.dependencies.forEach(function(d){
                               dependencies.push(d);
                            });
                        }
                        var controller = routeConfig.getControllerDirectory() + config.path + config.title + 'Controller';
                        dependencies.push(controller);
                        logger.debug({ message: 'Required dependencies ' + JSON.stringify(dependencies) });
                        return resolveDependencies($q, $rootScope, dependencies);
                    }]
                };

                return routeDef;
            };
            function resolveDependencies($q, $rootScope, dependencies) {
                var defer = $q.defer();
                require(dependencies, function () {
                    logger.debug({ message: 'Resolved dependencies ' + JSON.stringify(dependencies) });
                    defer.resolve();
                    $rootScope.$apply();
                });
                return defer.promise;
            };

            return {
                resolve: resolve
            };
        }(this.routeConfig);

    };

    var routeResolverModule = angular.module(moduleName, []);
    // must be a provider since it will be injected into module.config()    
    routeResolverModule.provider(providerName, routeResolver);

});