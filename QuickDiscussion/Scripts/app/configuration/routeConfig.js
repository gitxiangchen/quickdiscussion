/**
 * Angular service provide that defines all dynamically loaded route configuration. 
 * Each configuration route defines controller and view that will be lazily loaded.
 */
define([], function(){
    'use restrict';
    var routeConfig = function () {
        // The service providers are constructor functions. When instantiated they must
        // contain a property called $get, which holds the service factory function.
        this.$get = function () {
            return this;
        };

        this.routes = function () {
            return [
                {
                    url: '/',
                    config: {
                        title: 'dashboard',
                        path: 'dashboard/',
                        dependencies: ['app/discussion/discussionFilter', 'app/services/search']
                    }
                },
                {
                    url: '/search',
                    config: {
                        title: 'search',
                        path: 'search/'
                    }
                },
                {
                    url: '/forum',
                    config: {
                        title: 'forum',
                        path: 'forum/',
                        dependencies: []
                    }
                },
                {
                    url: '/customization',
                    config: {
                        title: 'customization',
                        path: 'customization/'
                    }
                },
                {
                    url: '/forumManage',
                    config: {
                        title: 'manage',
                        path: 'forum/manage/',
                        dependencies: ['app/forum/manage/manageFilter']
                    }
                },
                {
                    url: '/forumImport/:forumNameOrId',
                    config: {
                        title: 'import',
                        path: 'forum/import/',
                        dependencies: ['app/services/data', 'app/services/import']
                    }
                },
                {
                    url: '/forum/:forumNameOrId',
                    config: {
                        title: 'forum',
                        path: 'forum/',
                        dependencies: ['app/forum/forumFilter']
                    }
                },
                {
                    url: '/forums',
                    config: {
                        title: 'forums',
                        path: 'forum/'
                    }
                },
                {
                    url: '/discussions',
                    config: {
                        title: 'discussions',
                        path: 'discussion/'
                    }
                },
                {
                    url: '/discussion/:forumNameOrId/:topicId',
                    config: {
                        title: 'discussion',
                        path: 'discussion/',
                        dependencies: ['app/discussion/discussionFilter', 'app/services/cache']
                    }
                },
                {
                    // optional parameter at the end, see https://docs.angularjs.org/api/ngRoute/provider/$routeProvider
                    url: '/topic/:forumNameOrId/:action/:topicId/:messageId?',
                    config: {
                        title: 'topic',
                        path: 'discussion/'
                    }
                }
            ]
        }();
    };

    var moduleName = 'routeConfig';
    var providerName = 'routeConfig';

    var routeConfigModule = angular.module(moduleName, []);
    // must be a provider since it will be injected into module.config()
    routeConfigModule.provider(providerName, routeConfig);
})