var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return /\.test\.js$/.test(file);
});

// backfill for Phantom.js when running unit test in PhantomJS mode
if (!Function.prototype.bind) {
    Function.prototype.bind = function (context) {
        var self = this;
        return function () {
            return self.apply(context, arguments);
        };
    };
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base',

    paths: {
        'libs/angular/i18n/angular-locale': 'libs/angular/i18n/angular-locale_en-us',
        'toastr': 'libs/toastr'
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
