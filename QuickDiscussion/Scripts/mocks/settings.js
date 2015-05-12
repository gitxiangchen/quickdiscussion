define(["require", "exports"], function (require, exports) {
    /**
    * Central location to drive mock behavior by setting different configure options.
    */
    var MockSettings = (function () {
        function MockSettings() {
        }
        MockSettings.userHasPermission = true;
        return MockSettings;
    })();
    exports.MockSettings = MockSettings;
});
