/**
 * Defines the shell controller. The shell controller setup the basic shell layout
 * and activate the default route controller, which is lazily loaded. It also checks
 * for current user and permission.
 */
define(['app/app'], function (app) {
    'use strict';

    var controller = function ($rootScope, $location, $route, common, config, localize) {

        var vm = this; 
        var logger = common.logger.getLogger(controllerId);
        var events = config.events;
        
        vm.isAdmin = false;
        vm.isBusy = true;
        vm.spinnerOptions = {
            radius: 40,
            lines: 7,
            length: 0,
            width: 30,
            speed: 1.7,
            corners: 1.0,
            trail: 100,
            color: '#F58A00'
        };

        activate();

        function activate() {
            var promises = [loadResources()];
            common.activateController(promises, controllerId)
                .then(function () { logger.trace({ message: 'Controller activated' }); });

            var path = $location.path();
            if (path === '/') {
                $route.reload();
            } else {
                $location.path('/').replace();
            }

            logger.trace({ message: 'Controller activated', showToast: true });
        }

        function loadResources() {
            vm.busyMessage = localize.getString('app.general.busy');
        }

        function toggleSpinner(on) { vm.isBusy = on; }

        $rootScope.$on('$routeChangeStart',
            function (event, next, current) { toggleSpinner(true); }
        );

        $rootScope.$on(events.controllerActivateSuccess,
            function (event, data) { toggleSpinner(false); }
        );

        $rootScope.$on(events.spinnerToggle,
            function (event, data) { toggleSpinner(data.show); }
        );
    };
    var controllerId = 'shellController';
    app.controller(controllerId, ['$rootScope', '$location', '$route', 'common', 'config', 'localize', controller]);
});