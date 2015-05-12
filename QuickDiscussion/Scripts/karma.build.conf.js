// Karma configuration
// Generated on Sat Mar 01 2014 22:23:25 GMT-0700 (Mountain Standard Time)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '.',

    // frameworks to use
    frameworks: ['jasmine', 'requirejs'],

    // list of files / patterns to load in the browser
    files: [
      'libs/angular/angular.js',
      'libs/angular/angular-resource.js',
      'libs/angular/angular-route.js',
      'libs/angular/angular-sanitize.js',
      'libs/angular/angular-animate.js',
      'libs/angular/ui-bootstrap-tpls-0.11.0.js',
      'libs/bootstrap-select/bootstrap-select.js',
      'libs/bootstrap-select/angular-bootstrap-select.js',
      'libs/ng-grid.js',
      'libs/textAngular/textAngular.js',
      'libs/textAngular/textAngularSetup.js',
      'libs/underscore.js',
      'tests/libs/angular-mocks.js',
      'tests/libs/sharepoint-mocks.js',


      { pattern: 'app/**/*.js', included: false },
      { pattern: 'tests/unit/**/*.js', included: false },
      { pattern: 'mocks/*.js', included: false },

      'karma.main.js'
    ],

    // list of files to exclude
    exclude: [],

    // The preprocessor configures which files should be tested for coverage. You should not include files that
    // aren't directly related to your program, e.g. libraries, mocks, neither tests.
    preprocessors: {
        '**/app/**/*.js': 'coverage'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    // for html report, see https://github.com/matthias-schuetz/karma-htmlfile-reporter
    reporters: ['progress', 'coverage', 'spec', 'html'],

    coverageReporter: {
        type : 'html',
        dir : 'tests/coverage/'
    },

    htmlReporter: {
        outputFile: 'tests/units.html'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DISABLE,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
