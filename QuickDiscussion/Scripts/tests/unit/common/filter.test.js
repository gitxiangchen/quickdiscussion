define(['require', 'app/common/filter'], function (require, filter) {
    'use strict';

    describe("Test common filter service", function () {
        
        beforeEach(function () {
            angular.mock.module('quickDiscussionApp');
        });

        it('should split arrays of values based on rounded split size', angular.mock.inject(function (splitFilter) {
            var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            var result = splitFilter(arr, arr.length / 2); // size will round from 9/2 = 4.5 to 5
            expect(result).toBeDefined();
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual([1, 2, 3, 4, 5]);
            expect(result[1]).toEqual([6, 7, 8, 9]);
        }));

        it('should split arrays of values based on even split size', angular.mock.inject(function (splitFilter) {
            var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            var result = splitFilter(arr, arr.length / 2);
            expect(result).toBeDefined();
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual([1, 2, 3, 4, 5]);
            expect(result[1]).toEqual([6, 7, 8, 9, 10]);
        }));

        it('should split arrays of values based on split size', angular.mock.inject(function (splitFilter) {
            var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            var result = splitFilter(arr, arr.length/5); // size will round from 11/5 = 2.2 to 3
            expect(result).toBeDefined();
            expect(result.length).toEqual(4);
            expect(result[0]).toEqual([1, 2, 3]);
            expect(result[1]).toEqual([4, 5, 6]);
            expect(result[2]).toEqual([7, 8, 9]);
            expect(result[3]).toEqual([10, 11]);
        }));

        //iit('Filter split service should split arrays into smaller arrays', angular.mock.inject(function ($rootScope, $compile) {
        //    var repeatHtml = '<div ng-repeat="rows in dataset | split:4"><div ng-repeat="item in rows"><span id="{{$index}}"/></div></div>';

        //    var scope = $rootScope.$new();
        //    scope.dataset = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        //    var element = $compile(repeatHtml)(scope);
        //    scope.$digest();

        //    console.log('>> find element=' + element.find('div').length);
        //    expect(element.hasClass('dsa-dropdown-toggle')).toBeTruthy();
        //}))
    })
})
