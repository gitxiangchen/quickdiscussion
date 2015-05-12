require.config({
    // by default baseUrl is the directory that contains the HTML page running RequireJS
    // here we explicitly set to be the same as the default 
    baseUrl: '../scripts',
    urlArgs: 'v=1.0',
    paths: {
        // swap real implementation with mock services
        'app/services/data': 'mocks/services/data',
        'app/services/user': 'mocks/services/user',
        'app/services/setting': 'mocks/services/setting',
        'app/services/search': 'mocks/services/search'
    }
});

require(
    [
        'app/common/utility',
        'app/common/common',
        'app/common/filter',
        'app/resources/en/strings',
        'app/common/localization',
        'app/app',
        'app/configuration/config',
        'app/layouts/directives',
        'app/services/user',
        'app/layouts/topnavController',
        'app/layouts/shellController'
    ],
    function () {
        angular.bootstrap(document, ['quickDiscussionApp']);
    });
