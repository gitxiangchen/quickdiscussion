/**
 * Defines the common modules and includes services: common, logger, spinner.
 */
define([], function () {
    'use strict';
    
    var moduleName = 'common';
    var commonModule = angular.module(moduleName, []);

    var loggerServiceName = 'logger'; 
    var logger = function logger(appTokens, $log) {
        var error = 1,
            warn = 2,
            info = 3,
            debug = 4,
            trace = 5,
            disable = 0;

        var Logger = (function () {

            function Logger(source) {
                this.source = source;
                if (appTokens.logging) {
                    switch (appTokens.logging.toLowerCase()) {
                        case 'error':
                            this.level = error;
                            break;
                        case 'warn':
                            this.level = warn;
                            break;
                        case 'info':
                            this.level = info;
                            break;
                        case 'debug':
                            this.level = debug;
                            break;
                        case 'trace':
                            this.level = trace;
                            break;
                        case 'disable':
                            this.level = disable;
                            break;
                        default:
                            this.level = info;
                    }
                }
            };

            Logger.prototype.error = function (log) {
                if (this.level >= error) {
                    logIt($log.error, log, this.source);
                }
            };

            Logger.prototype.info = function (log) {
                if (this.level >= info) {
                    logIt($log.info, log, this.source);
                }
            };

            Logger.prototype.warn = function (log) {
                if (this.level >= warn) {
                    logIt($log.warn, log, this.source);
                }
            };

            Logger.prototype.debug = function (log) {
                if (this.level >= debug) {
                    logIt($log.debug, log, this.source);
                }
            }

            Logger.prototype.trace = function (log) {
                if (this.level >= trace) {
                    logIt($log.log, log, this.source);
                }
            };

            function logIt(logger, log, source) {
                var header = source ? '[' + source + '] ' : '';
                var data = log.data ? '{' + log.data + '}' : '';
                // to avoid constructing log message that logging level disables, one can pass a function call
                // to construct the log message later, so here we check if a function is passed
                if (isFunction(log.message)) {
                    logger(header, log.message(), data);
                } else {
                    logger(header, log.message, data);
                }
                if (log.showToast) {
                    var toastr = window['toastr'];
                    if (toastr) {
                        if (logger === $log.error) {
                            toastr.error(log.message);
                        } else if (logger === $log.warn) {
                            toastr.warning(log.message);
                        } else if (logger === $log.info) {
                            toastr.success(log.message);
                        } else {
                            toastr.info(log.message);
                        }
                    }
                }
            }

            function isFunction(functionToCheck) {
                var getType = {};
                return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
            }

            return Logger;

        })();

        function getLogger(moduleId) {
            return new Logger(moduleId);
        }

        return {
            getLogger: getLogger
        }
    }
    commonModule.factory(loggerServiceName, ['appTokens', '$log', logger]);

    var spinnerService = function (common, commonConfig) {
        var service = {
            spinnerHide: spinnerHide,
            spinnerShow: spinnerShow
        };

        return service;

        function spinnerHide() { spinnerToggle(false); }

        function spinnerShow() { spinnerToggle(true); }

        function spinnerToggle(show) {
            common.$broadcast(commonConfig.config.spinnerToggleEvent, { show: show });
        }
    };
    var spinnerServiceName = 'spinner';
    // Must configure the common service and set its 
    // events via the commonConfigProvider
    commonModule.factory(spinnerServiceName, ['common', 'commonConfig', spinnerService]);

    var providerName = 'commonConfig';
    // Must configure the common service and set its 
    // events via the commonConfigProvider
    commonModule.provider(providerName, function () {
        this.config = {
            // These are the properties we need to set
            controllerActivateSuccessEvent: '',
            spinnerToggleEvent: ''
        };

        // must define $get property for provider
        this.$get = function () {
            return {
                config: this.config
            };
        };
    });

    var commonService = function common($q, $rootScope, $timeout, commonConfig, logger) {
        var throttles = {};

        var service = {
            // common angular dependencies
            $broadcast: $broadcast,
            $q: $q,
            $timeout: $timeout,
            // generic
            toggleSpinner: toggleSpinner,
            activateController: activateController,
            createSearchThrottle: createSearchThrottle,
            debouncedThrottle: debouncedThrottle,
            logger: logger
        };

        return service;

        function activateController(promises, controllerId) {
            return $q.all(promises).then(function (eventArgs) {
                var data = { controllerId: controllerId };
                $broadcast(commonConfig.config.controllerActivateSuccessEvent, data);
            });
        };

        function toggleSpinner(on) {
            var data = { show: on };
            $broadcast(commonConfig.config.spinnerToggleEvent, data);
        }

        function createSearchThrottle(viewmodel, list, filteredList, filter, delay) {
            // custom delay or use default
            delay = +delay || 300;
            // if only vm and list parameters were passed, set others by naming convention 
            if (!filteredList) {
                // assuming list is named sessions,
                // filteredList is filteredSessions
                filteredList = 'filtered' + list[0].toUpperCase() + list.substr(1).toLowerCase(); // string
                // filter function is named sessionFilter
                filter = list + 'Filter'; // function in string form
            }

            // create the filtering function we will call from here
            var filterFn = function () {
                // translates to ...
                // vm.filteredSessions 
                //      = vm.sessions.filter(function(item( { returns vm.sessionFilter (item) } );
                viewmodel[filteredList] = viewmodel[list].filter(function (item) {
                    return viewmodel[filter](item);
                });
            };

            return (function () {
                // Wrapped in outer IFFE so we can use closure 
                // over filterInputTimeout which references the timeout
                var filterInputTimeout;

                // return what becomes the 'applyFilter' function in the controller
                return function (searchNow) {
                    if (filterInputTimeout) {
                        $timeout.cancel(filterInputTimeout);
                        filterInputTimeout = null;
                    }
                    if (searchNow || !delay) {
                        filterFn();
                    } else {
                        filterInputTimeout = $timeout(filterFn, delay);
                    }
                };
            })();
        }

        function debouncedThrottle(key, callback, delay, immediate) {
            var defaultDelay = 1000;
            delay = delay || defaultDelay;
            if (throttles[key]) {
                $timeout.cancel(throttles[key]);
                throttles[key] = undefined;
            }
            if (immediate) {
                callback();
            } else {
                throttles[key] = $timeout(callback, delay);
            }
        };

        function $broadcast() {
            return $rootScope.$broadcast.apply($rootScope, arguments);
        };
    };

    var serviceName = 'common';
    commonModule.factory(serviceName,
        ['$q', '$rootScope', '$timeout', providerName, 'logger', commonService]);

});
