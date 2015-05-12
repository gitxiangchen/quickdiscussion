define(['require', 'app/common/common'], function (require, common) {
    'use strict';

    describe("Test common module common service", function () {

        var appTokens, mockLog, logModule, logType, logMessage, logData, logShowToast;

        beforeEach(function () {
            angular.mock.module('utility');
            angular.mock.module('common');
            angular.mock.inject(function ($injector) {
                appTokens = $injector.get('appTokens');
                mockLog = $injector.get('$log');
                mockLog.warn = jasmine.createSpy('warn').andCallFake(function (header, message, data) {
                    logModule = header;
                    logType = 'warn';
                    logMessage = message;
                    logData = data;
                });
                mockLog.error = jasmine.createSpy('error').andCallFake(function (header, message, data) {
                    logModule = header;
                    logType = 'error';
                    logMessage = message;
                    logData = data;
                });
                mockLog.info = jasmine.createSpy('info').andCallFake(function (header, message, data) {
                    logModule = header;
                    logType = 'info';
                    logMessage = message;
                    logData = data;
                });
                mockLog.log = jasmine.createSpy('log').andCallFake(function (header, message, data) {
                    logModule = header;
                    logType = 'log';
                    logMessage = message;
                    logData = data;
                });
                mockLog.debug = jasmine.createSpy('debug').andCallFake(function (header, message, data) {
                    logModule = header;
                    logType = 'debug';
                    logMessage = message;
                    logData = data;
                });
            });
        });
        
        it("should create logger service", function () {
            angular.mock.inject(function ($injector) {
                var logger = $injector.get('logger');
                expect(logger).toBeDefined();
            });
        });

        it("Should log error", function () {
            // reset values
            logType = '';
            logMessage = '';
            logModule = '';

            angular.mock.inject(function ($injector) {
                // specify logging level before inject logger
                appTokens.logging = 'error';

                var instance = $injector.get('logger');
                var logger = instance.getLogger('moduleName');
                expect(logger).toBeDefined();

                logger.error({ message: 'test' });

                expect(mockLog.error).toHaveBeenCalled();
                expect(logModule).toContain('moduleName');
                expect(logType).toEqual('error');
                expect(logMessage).toEqual('test');
            });
        });

        it("Should log info", function () {
            // reset values
            logType = '';
            logMessage = '';
            logModule = '';

            angular.mock.inject(function ($injector) {
                // specify logging level before inject logger
                appTokens.logging = 'info';

                var instance = $injector.get('logger');
                var logger = instance.getLogger('moduleName');
                expect(logger).toBeDefined();

                logger.info({ message: 'test' });

                expect(mockLog.info).toHaveBeenCalled();
                expect(logModule).toContain('moduleName');
                expect(logType).toEqual('info');
                expect(logMessage).toEqual('test');
            });
        });

        it("Should log warn", function () {
            // reset values
            logType = '';
            logMessage = '';
            logModule = '';

            angular.mock.inject(function ($injector) {
                appTokens.logging = 'warn';
                var instance = $injector.get('logger');
                var logger = instance.getLogger('moduleName');
                expect(logger).toBeDefined();

                logger.warn({ message: 'test' });

                expect(mockLog.warn).toHaveBeenCalled();
                expect(logModule).toContain('moduleName');
                expect(logType).toEqual('warn');
                expect(logMessage).toEqual('test');
            });
        });

        it("Should log debug", function () {
            // reset values
            logType = '';
            logMessage = '';
            logModule = '';

            angular.mock.inject(function ($injector) {
                // set logging level before we get logger object
                appTokens.logging = 'debug';
                var instance = $injector.get('logger');
                var logger = instance.getLogger('moduleName');
                expect(logger).toBeDefined();

                logger.debug({ message: 'test' });

                expect(mockLog.debug).toHaveBeenCalled();
                expect(logModule).toContain('moduleName');
                expect(logType).toEqual('debug');
                expect(logMessage).toEqual('test');
            });
        });

        it("Should log trace", function () {
            // reset values
            logType = '';
            logMessage = '';
            logModule = '';

            angular.mock.inject(function ($injector) {
                // specify logging level before getting logger object
                appTokens.logging = 'trace';

                var instance = $injector.get('logger');
                var logger = instance.getLogger('moduleName');
                expect(logger).toBeDefined();

                logger.trace({ message: 'test' });

                expect(mockLog.log).toHaveBeenCalled();
                expect(logModule).toContain('moduleName');
                expect(logType).toEqual('log');
                expect(logMessage).toEqual('test');
            });
        });

        it("Should log all when set to trace mode", function () {
            // reset values
            logType = '';
            logMessage = '';
            logModule = '';

            angular.mock.inject(function ($injector) {
                // specify logging level before getting logger object
                appTokens.logging = 'trace';

                var instance = $injector.get('logger');
                var logger = instance.getLogger('moduleName');
                expect(logger).toBeDefined();

                logger.trace({ message: 'trace' });
                logger.debug({ message: 'debug' });
                logger.warn({ message: 'warn' });
                logger.info({ message: 'info' });
                logger.error({ message: 'error' });

                expect(mockLog.log).toHaveBeenCalled();
                expect(mockLog.info).toHaveBeenCalled();
                expect(mockLog.warn).toHaveBeenCalled();
                expect(mockLog.debug).toHaveBeenCalled();
                expect(mockLog.error).toHaveBeenCalled();
            });
        });

        it("Should log only error when set to info error", function () {
            // reset values
            logType = '';
            logMessage = '';
            logModule = '';

            angular.mock.inject(function ($injector) {
                // specify logging level before getting logger object
                appTokens.logging = 'error';

                var instance = $injector.get('logger');
                var logger = instance.getLogger('moduleName');
                expect(logger).toBeDefined();

                logger.trace({ message: 'trace' });
                logger.debug({ message: 'debug' });
                logger.warn({ message: 'warn' });
                logger.info({ message: 'info' });
                logger.error({ message: 'error' });

                expect(mockLog.log.calls.length).toEqual(0);
                expect(mockLog.info.calls.length).toEqual(0);
                expect(mockLog.warn.calls.length).toEqual(0);
                expect(mockLog.debug.calls.length).toEqual(0);
                expect(mockLog.error).toHaveBeenCalled();
                expect(mockLog.error.calls.length).toEqual(1);
            });
        });

        it("Should log error, warn, and info at default logging level", function () {
            // reset values
            logType = '';
            logMessage = '';
            logModule = '';

            angular.mock.inject(function ($injector) {
                // specify the default logging level before getting logger object
                appTokens.logging = 'info';

                var instance = $injector.get('logger');
                var logger = instance.getLogger('moduleName');
                expect(logger).toBeDefined();

                logger.trace({ message: 'trace' });
                logger.debug({ message: 'debug' });
                logger.warn({ message: 'warn' });
                logger.info({ message: 'info' });
                logger.error({ message: 'error' });

                expect(mockLog.log.calls.length).toEqual(0);
                expect(mockLog.debug.calls.length).toEqual(0);
                expect(mockLog.info).toHaveBeenCalled();
                expect(mockLog.warn).toHaveBeenCalled();
                expect(mockLog.error).toHaveBeenCalled();
            });
        });
    })
});