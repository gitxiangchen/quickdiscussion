define(['app/app'], function (app) {
    'use strict';

    // splitter for ng-repeat, see details at
    // http://stackoverflow.com/questions/21644493/how-to-split-the-ng-repeat-data-with-three-columns-using-bootstrap
    var filterName = 'split';
    var ngRepeatSplitService = function () {
        var cache = {};
        var filter = function (arr, size) {
            if (!arr) { return; }

            var newArr = [];
            size = Math.ceil(size);
            for (var i = 0; i < arr.length; i += size) {
                newArr.push(arr.slice(i, i + size));
            }
            var arrString = JSON.stringify(arr);
            var fromCache = cache[arrString + size];
            if (JSON.stringify(fromCache) === JSON.stringify(newArr)) {
                return fromCache;
            }
            cache[arrString + size] = newArr;
            return newArr;
        };
        return filter;
    };
    app.filter(filterName, ngRepeatSplitService);
});