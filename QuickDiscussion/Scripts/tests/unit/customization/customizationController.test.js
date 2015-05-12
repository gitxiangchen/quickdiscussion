define(['app/app', 'app/common/localization', 'app/common/utility'], function (app) {
    'use strict';

    describe('Test customization controller', function () {

        var scope, controller, localize;

        // Initialize and load preview controller for unit test.
        function loadController($controller, $rootScope, $timeout) {
            scope = $rootScope.$new();
            scope["configuration"] = {
            };
            if (configured) {
                scope.configuration.data.siteUrl = 'http://site.com';
                scope.configuration.data.listName = 'Tasks';
                scope.configuration.data.category = 'Priority';
                scope.configuration.data.series = [{ aggregateField: 'Field' }];
            }
            var controllerId = 'customizationController';
            controller = $controller(ontrollerId, {
                $scope: scope, $timeout: $timeout, localize: localize
            });
        };

        beforeEach(function () {
            module('common');
            module('utility');
            module('localize');

            angular.mock.inject(function ($injector) {
                localize = $injector.get('localize');
            });
        });
    });
});