define(['require', 'exports', 'app/app'], function (require, exports, app) {
    'use strict';

    exports.serviceName = 'tabbedDialogService';
    var TabbedDialogService = (function () {
        function TabbedDialogService($modal, common) {
            this.modal = $modal;
            this.logger = common.logger.getLogger(exports.serviceName);
        }

        TabbedDialogService.prototype.open = function (options) {
            if (!options) {
                throw new Error(exports.serviceName + '.open was called without any options.');
            }

            var dialogModel = {
                title: options.title,
                pages: angular.copy(options.pages)
            };

            var modalSettings = {
                backdrop: 'static',
                controller: options.controller,
                templateUrl: options.templateUrl,
                resolve: {
                    dialogModel: function () {
                        return dialogModel;
                    }
                },
                windowClass: 'bootstrap dialog container'
            };

            return this.modal.open(modalSettings);
        }

        return TabbedDialogService;
    })();

    app.service(exports.serviceName, ['$modal', 'common', TabbedDialogService]);
});