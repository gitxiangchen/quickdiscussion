define(['app/app'], function (app) {
    'use strict';

    var serviceName = 'cacheService';
    var CacheService = (function () {
        function CacheService($q, utils, common) {
            this.sessionCache = new SessionStorageCache($q, utils, common);
        }

        CacheService.prototype.getCacheStore = function (type) {
            return this.sessionCache;
        }
        return CacheService;
    })();

    var SessionStorageCache = (function () {
        function SessionStorageCache($q, utils, common) {
            this.qService = $q;
            this.utils = utils;
            this.logger = common.logger.getLogger('SessionStorageCache');
        }

        SessionStorageCache.prototype.initialize = function () {
        };

        SessionStorageCache.prototype.getCache = function (key) {
            var result = sessionStorage.getItem(key);
            if (result) {
                this.logger.debug({ message: 'Loaded cache key=' + key + ' value=' + result });
            } else {
                this.logger.debug({ message: 'Found no value for cache key=' + key });
            }
            return this.qService.when(result);
        };

        SessionStorageCache.prototype.setCache = function (key, value) {
            sessionStorage.setItem(key, value);
            this.logger.debug({ message: 'Successfully updated cache key: ' + key });
            return this.qService.when(true);
        };

        SessionStorageCache.prototype.removeCache = function (key) {
            sessionStorage.removeItem(key);
            this.logger.debug({ message: 'Successfully removed cache key: ' + key });
            return this.qService.when(true);
        };
        return SessionStorageCache;
    })();

    app.service(serviceName, ['$q', 'utils', 'common', CacheService]);
})