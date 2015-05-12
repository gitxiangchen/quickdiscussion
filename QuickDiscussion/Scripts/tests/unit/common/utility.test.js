define(['require', 'app/common/utility'], function (require, utility) {
    'use strict';

    describe("Test utility module utils service", function () {
        var utils;
        
        beforeEach(function () {
            angular.mock.module('utility');
            inject(function ($injector) {
                utils = $injector.get('utils');
            });
        });

        it('Utils service should check nested property of a JavaScript object', function () {
            var test = {
                error: {
                    message: {
                        value: 'test' 
                    }
                }
            };  

            var result = utils.checkNestedProperty(test, 'error>message>value');
            expect(result).toBeTruthy();

            result = utils.checkNestedProperty(test, 'error>message>value>toString');
            expect(result).toBeFalsy();

            result = utils.checkNestedProperty(test, 'error>message');
            expect(result).toBeTruthy();

            result = utils.checkNestedProperty(test.error, 'message>value');
            expect(result).toBeTruthy();

        });

        it('Utils service should return object property specified', function () {
            var test = {
                error: {
                    message: {
                        value: 'test'
                    }
                },
                results: [
                    { id: 0, name: '1' },
                    { id: 1, name: '2' }
                ]
            };

            var result = utils.getNestedProperty(test, 'error>message>value');
            expect(result).toEqual(test.error.message.value);

            result = utils.getNestedProperty(test, 'errors>messages');
            expect(result).toBeNull();

            result = utils.getNestedProperty(test, 'results');
            expect(result).toBeDefined();
            expect(result.length).toEqual(2);
            expect(result[0].id).toEqual(test.results[0].id);
        });

        it("Utility should format currency with the locale info", function () {
            var number = 1234.5678;
            var format = "USD:1";
            var result = utils.formatCurrency(number, format);
            expect(result).toEqual("$1,234.60"); // hardcoded limitation from AngularJS

            var format2 = "CNY";
            var result2 = utils.formatCurrency(number, format2);
            expect(result2).toEqual("¥1,234.57");

            var format3 = "EUR";
            var result3 = utils.formatCurrency(number, format3);
            expect(result3).toEqual("€1,234.57");

            var format4 = "TTD:3"; // Trinidad and Tobago dollar
            var result4 = utils.formatCurrency(number, format4);
            expect(result4).toEqual("TT$1,234.57");

            var format5 = "TND:3"; // Tunisian Dollar
            var result5 = utils.formatCurrency(number, format5);
            expect(result5).toEqual("د.ت1,234.57");

            var format6 = "TMT:4"; // Turkmenistan Manat, locale id=1090
            var result6 = utils.formatCurrency(number, format6);
            expect(result6).toEqual("m1,234.57"); // rendered by SharePoint as '1,234.57m.'

            var format7 = "UAH"; // Ukraine Hryvna, locale id=1058
            var result7 = utils.formatCurrency(number, format7);
            expect(result7).toEqual("₴1,234.57"); // rendered by SharePoint as '1,234.57₴'

            var format8 = "AFN"; // Afghanistan Afghani, locale id=1164
            var result8 = utils.formatCurrency(number, format8);
            expect(result8).toEqual("؋1,234.57");

            var format9 = "DZD"; // Algeria dinar, locale id=5121
            var result9 = utils.formatCurrency(number, format9);
            expect(result9).toEqual("د.ج1,234.57");

            var format10 = "AMD"; // Armenian dram, locale id=1067
            var result10 = utils.formatCurrency(number, format10);
            expect(result10).toEqual("֏1,234.57");

            var format11 = "AZN"; // Azerbaijani manat, locale id=1068
            var result11 = utils.formatCurrency(number, format11);
            expect(result11).toEqual("ман1,234.57");

            var format12 = "BHD"; // Bahraini dinar, locale id=15361
            var result12 = utils.formatCurrency(number, format12);
            expect(result12).toEqual(".د.ب1,234.57");

            var format13 = "BDT"; // Bangladeshi taka, locale id=2117
            var result13 = utils.formatCurrency(number, format13);
            expect(result13).toEqual("৳1,234.57");

            var format14 = "BYR"; // Belarusian ruble, locale id=1059
            var result14 = utils.formatCurrency(number, format14);
            expect(result14).toEqual("p.1,234.57");

            var format15 = "RSD"; // Serbian dinar, locale id=10266
            var result15 = utils.formatCurrency(number, format15);
            expect(result15).toEqual("Дин.1,234.57");

            var format16 = "SYP"; // Syria pond, locale id=10241
            var result16 = utils.formatCurrency(number, format16);
            expect(result16).toEqual("£1,234.57");

            var format17 = "PKR"; // Pakistani rupee, locale id=1056
            var result17 = utils.formatCurrency(number, format17);
            expect(result17).toEqual("₨1,234.57");

            var format18 = "MTL"; // Maltese scudo, locale id=1082
            var result18 = utils.formatCurrency(number, format18);
            expect(result18).toEqual("₤1,234.57");

            var format19 = "MVR"; // Maldivian rufiyaa, locale id=1125
            var result19 = utils.formatCurrency(number, format19);
            expect(result19).toEqual(".ރ1,234.57");

            var format20 = "MAD"; // Moroccan dirham, locale id=6145
            var result20 = utils.formatCurrency(number, format20);
            expect(result20).toEqual("د.م.1,234.57");

            var format21 = "NPR"; // Nepalese rupee, locale id=1121
            var result21 = utils.formatCurrency(number, format21);
            expect(result21).toEqual("रू1,234.57");

            var format22 = "PHP"; // Philippine peso, locale id=13321
            var result22 = utils.formatCurrency(number, format22);
            expect(result22).toEqual("₱1,234.57");

            var format23 = "RWF"; // Rwandan franc, locale id=1159
            var result23 = utils.formatCurrency(number, format23);
            expect(result23).toEqual("R₣1,234.57");

            var format24 = "XOF"; // West African CFA franc, Senegal and etc , locale id=1160
            var result24 = utils.formatCurrency(number, format24);
            expect(result24).toEqual("CFA1,234.57");

            var format25 = "RSD"; // Serbia Dinar, locale id=9242
            var result25 = utils.formatCurrency(number, format25);
            expect(result25).toEqual("Дин.1,234.57");

            var format26 = "SIT"; // Slovenian tolar, locale id=1060
            var result26 = utils.formatCurrency(number, format26);
            expect(result26).toEqual("€1,234.57");

            var format27 = "ZAR"; // South African rand, locale id=7177
            var result27 = utils.formatCurrency(number, format27);
            expect(result27).toEqual("R1,234.57");

            var format28 = "LKR"; // Sri Lankan rupee, locale id=1115
            var result28 = utils.formatCurrency(number, format28);
            expect(result28).toEqual("₨1,234.57");

            var format29 = "TJS"; // Tajikistani somoni, locale id=1064
            var result29 = utils.formatCurrency(number, format29);
            expect(result29).toEqual("CMH1,234.57");

            var format30 = "TRY"; // Turkey Lira, locale id=1055
            var result30 = utils.formatCurrency(number, format30);
            expect(result30).toEqual("₤1,234.57");

            var format31 = "AED"; // United Arab Emirates, Dirham, locale id=14337
            var result31 = utils.formatCurrency(number, format31);
            expect(result31).toEqual("د.إ.1,234.57");

            var format32 = "UYU"; // Uruguay Peso, locale id=14346
            var result32 = utils.formatCurrency(number, format32);
            expect(result32).toEqual("$U1,234.57");

            var format33 = "UZS"; // locale id=1091
            var result33 = utils.formatCurrency(number, format33);
            expect(result33).toEqual("лв1,234.57");
        });
    });

    describe('Test utility spTokens service', function () {
        var testUrl;

        beforeEach(function () {
            angular.mock.module('utility');
            angular.mock.module(function ($provide) {
                $provide.value('$document', [{
                    URL: testUrl
                }])
            })
        });

        it("Should return an empty object when URL has no query parameters", function () {
            testUrl = 'http://site/default.html';
            var tokens;
            angular.mock.inject(function (spTokens) {
                tokens = spTokens;
            });
            expect(tokens).toEqual({});
        });

        it("Should return object containing the query parameters from URL", function () {
            testUrl = 'http://site/default.html?wpId=abcd&editmode=1';
            var tokens;
            angular.mock.inject(function (spTokens) {
                tokens = spTokens;
            });
            expect(tokens.wpId).toBeDefined();
            expect(tokens.wpId).toEqual('abcd');
            expect(tokens.editmode).toEqual('1');
        });
    })

});