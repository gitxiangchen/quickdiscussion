/**
 * Define application settings.
 */
define(['app/app'], function (app) {
    'use strict';

    // Configure Toastr
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        spinnerToggle: 'spinner.toggle'
    };

    var config = {
        appErrorPrefix: '[Quick Discussion Error] ', //Configure the exceptionHandler decorator
        docTitle: 'Quick Discussion: ',
        events: events,
        version: '1.0.0.0'
    };

    var appModuleName = 'quickDiscussionApp';
    var quickDiscussionApp = angular.module(appModuleName);

    quickDiscussionApp.value('config', config);

    quickDiscussionApp.config(['$logProvider', function ($logProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);

    //#region Configure the common services via commonConfig
    // http://stackoverflow.com/questions/18350416/angular-error-unknown-provider-during-module-config
    //angular.module('dingApp', ['common'])
    quickDiscussionApp.config(['commonConfigProvider', function (cfg) {
            cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
            cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
        }]);
    //#endregion
});