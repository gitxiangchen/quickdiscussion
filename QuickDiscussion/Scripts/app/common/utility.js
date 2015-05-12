define([], function () {
    'use strict';

    var moduleName = 'utility';
    var utilityModule = angular.module(moduleName, []);

    /**
     * Utility service exposes the following utility methods.
     */
    var utilityService = function (filterService) {
        var propertySplitter = '>';
        // complete reference can be found http://www.xe.com/symbols.php and reference implementation from http://jsfiddle.net/TheSharpieOne/N7YuP/3/
        var isoCurrencyCodes = { "ALL": { "text": "Lek", "uniDec": "76, 101, 107", "uniHex": "4c, 65, 6b" }, "AFN": { "text": "؋", "uniDec": "1547", "uniHex": "60b" }, "ARS": { "text": "$", "uniDec": "36", "uniHex": "24" }, "AWG": { "text": "ƒ", "uniDec": "402", "uniHex": "192" }, "AUD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "AZN": { "text": "ман", "uniDec": "1084, 1072, 1085", "uniHex": "43c, 430, 43d" }, "BSD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "BBD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "BYR": { "text": "p.", "uniDec": "112, 46", "uniHex": "70, 2e" }, "BZD": { "text": "BZ$", "uniDec": "66, 90, 36", "uniHex": "42, 5a, 24" }, "BMD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "BOB": { "text": "$b", "uniDec": "36, 98", "uniHex": "24, 62" }, "BAM": { "text": "KM", "uniDec": "75, 77", "uniHex": "4b, 4d" }, "BWP": { "text": "P", "uniDec": "80", "uniHex": "50" }, "BGN": { "text": "лв", "uniDec": "1083, 1074", "uniHex": "43b, 432" }, "BRL": { "text": "R$", "uniDec": "82, 36", "uniHex": "52, 24" }, "BND": { "text": "$", "uniDec": "36", "uniHex": "24" }, "KHR": { "text": "៛", "uniDec": "6107", "uniHex": "17db" }, "CAD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "KYD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "CLP": { "text": "$", "uniDec": "36", "uniHex": "24" }, "CNY": { "text": "¥", "uniDec": "165", "uniHex": "a5" }, "COP": { "text": "$", "uniDec": "36", "uniHex": "24" }, "CRC": { "text": "₡", "uniDec": "8353", "uniHex": "20a1" }, "HRK": { "text": "kn", "uniDec": "107, 110", "uniHex": "6b, 6e" }, "CUP": { "text": "₱", "uniDec": "8369", "uniHex": "20b1" }, "CZK": { "text": "Kč", "uniDec": "75, 269", "uniHex": "4b, 10d" }, "DKK": { "text": "kr", "uniDec": "107, 114", "uniHex": "6b, 72" }, "DOP": { "text": "RD$", "uniDec": "82, 68, 36", "uniHex": "52, 44, 24" }, "XCD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "EGP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "SVC": { "text": "$", "uniDec": "36", "uniHex": "24" }, "EEK": { "text": "kr", "uniDec": "107, 114", "uniHex": "6b, 72" }, "EUR": { "text": "€", "uniDec": "8364", "uniHex": "20ac" }, "FKP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "FJD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "GHC": { "text": "¢", "uniDec": "162", "uniHex": "a2" }, "GIP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "GTQ": { "text": "Q", "uniDec": "81", "uniHex": "51" }, "GGP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "GYD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "HNL": { "text": "L", "uniDec": "76", "uniHex": "4c" }, "HKD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "HUF": { "text": "Ft", "uniDec": "70, 116", "uniHex": "46, 74" }, "ISK": { "text": "kr", "uniDec": "107, 114", "uniHex": "6b, 72" }, "INR": { "text": "", "uniDec": "", "uniHex": "" }, "IDR": { "text": "Rp", "uniDec": "82, 112", "uniHex": "52, 70" }, "IRR": { "text": "﷼", "uniDec": "65020", "uniHex": "fdfc" }, "IMP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "ILS": { "text": "₪", "uniDec": "8362", "uniHex": "20aa" }, "JMD": { "text": "J$", "uniDec": "74, 36", "uniHex": "4a, 24" }, "JPY": { "text": "¥", "uniDec": "165", "uniHex": "a5" }, "JEP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "KZT": { "text": "лв", "uniDec": "1083, 1074", "uniHex": "43b, 432" }, "KPW": { "text": "₩", "uniDec": "8361", "uniHex": "20a9" }, "KRW": { "text": "₩", "uniDec": "8361", "uniHex": "20a9" }, "KGS": { "text": "лв", "uniDec": "1083, 1074", "uniHex": "43b, 432" }, "LAK": { "text": "₭", "uniDec": "8365", "uniHex": "20ad" }, "LVL": { "text": "Ls", "uniDec": "76, 115", "uniHex": "4c, 73" }, "LBP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "LRD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "LTL": { "text": "Lt", "uniDec": "76, 116", "uniHex": "4c, 74" }, "MKD": { "text": "ден", "uniDec": "1076, 1077, 1085", "uniHex": "434, 435, 43d" }, "MYR": { "text": "RM", "uniDec": "82, 77", "uniHex": "52, 4d" }, "MUR": { "text": "₨", "uniDec": "8360", "uniHex": "20a8" }, "MXN": { "text": "$", "uniDec": "36", "uniHex": "24" }, "MNT": { "text": "₮", "uniDec": "8366", "uniHex": "20ae" }, "MZN": { "text": "MT", "uniDec": "77, 84", "uniHex": "4d, 54" }, "NAD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "NPR": { "text": "रू", "uniDec": "8360", "uniHex": "20a8" }, "ANG": { "text": "ƒ", "uniDec": "402", "uniHex": "192" }, "NZD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "NIO": { "text": "C$", "uniDec": "67, 36", "uniHex": "43, 24" }, "NGN": { "text": "₦", "uniDec": "8358", "uniHex": "20a6" }, "NOK": { "text": "kr", "uniDec": "107, 114", "uniHex": "6b, 72" }, "OMR": { "text": "﷼", "uniDec": "65020", "uniHex": "fdfc" }, "PKR": { "text": "₨", "uniDec": "8360", "uniHex": "20a8" }, "PAB": { "text": "B/.", "uniDec": "66, 47, 46", "uniHex": "42, 2f, 2e" }, "PYG": { "text": "Gs", "uniDec": "71, 115", "uniHex": "47, 73" }, "PEN": { "text": "S/.", "uniDec": "83, 47, 46", "uniHex": "53, 2f, 2e" }, "PHP": { "text": "₱", "uniDec": "8369", "uniHex": "20b1" }, "PLN": { "text": "zł", "uniDec": "122, 322", "uniHex": "7a, 142" }, "QAR": { "text": "﷼", "uniDec": "65020", "uniHex": "fdfc" }, "RON": { "text": "lei", "uniDec": "108, 101, 105", "uniHex": "6c, 65, 69" }, "RUB": { "text": "руб", "uniDec": "1088, 1091, 1073", "uniHex": "440, 443, 431" }, "SHP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "SAR": { "text": "﷼", "uniDec": "65020", "uniHex": "fdfc" }, "RSD": { "text": "Дин.", "uniDec": "1044, 1080, 1085, 46", "uniHex": "414, 438, 43d, 2e" }, "SCR": { "text": "₨", "uniDec": "8360", "uniHex": "20a8" }, "SGD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "SBD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "SOS": { "text": "S", "uniDec": "83", "uniHex": "53" }, "ZAR": { "text": "R", "uniDec": "82", "uniHex": "52" }, "LKR": { "text": "₨", "uniDec": "8360", "uniHex": "20a8" }, "SEK": { "text": "kr", "uniDec": "107, 114", "uniHex": "6b, 72" }, "CHF": { "text": "CHF", "uniDec": "67, 72, 70", "uniHex": "43, 48, 46" }, "SRD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "SYP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "TWD": { "text": "NT$", "uniDec": "78, 84, 36", "uniHex": "4e, 54, 24" }, "THB": { "text": "฿", "uniDec": "3647", "uniHex": "e3f" }, "TTD": { "text": "TT$", "uniDec": "84, 84, 36", "uniHex": "54, 54, 24" }, "TRY": { "text": "₤", "uniDec": "", "uniHex": "20a4" }, "TRL": { "text": "₤", "uniDec": "8356", "uniHex": "20a4" }, "TVD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "UAH": { "text": "₴", "uniDec": "8372", "uniHex": "20b4" }, "GBP": { "text": "£", "uniDec": "163", "uniHex": "a3" }, "USD": { "text": "$", "uniDec": "36", "uniHex": "24" }, "UYU": { "text": "$U", "uniDec": "36, 85", "uniHex": "24, 55" }, "UZS": { "text": "лв", "uniDec": "1083, 1074", "uniHex": "43b, 432" }, "VEF": { "text": "Bs", "uniDec": "66, 115", "uniHex": "42, 73" }, "VND": { "text": "₫", "uniDec": "8363", "uniHex": "20ab" }, "YER": { "text": "﷼", "uniDec": "65020", "uniHex": "fdfc" }, "ZWD": { "text": "Z$", "uniDec": "90, 36", "uniHex": "5a, 24" }, "TND": { "text": "د.ت", "uniDec": "", "uniHex": "" }, "TMT": { "text": "m", "uniDec": "", "uniHex": "" }, "DZD": { "text": "د.ج", "uniDec": "", "uniHex": "" }, "AMD": { "text": "֏", "uniDec": "", "uniHex": "058F" }, "BHD": { "text": ".د.ب", "uniDec": "", "uniHex": "" }, "BDT": { "text": "৳", "uniDec": "", "uniHex": "09F3" }, "MTL": { "text": "₤", "uniDec": "", "uniHex": "" }, "MVR": { "text": ".ރ", "uniDec": "", "uniHex": "" }, "MAD": { "text": "د.م.", "uniDec": "", "uniHex": "" }, "RWF": { "text": "R₣", "uniDec": "", "uniHex": "" }, "XOF": { "text": "CFA", "uniDec": "", "uniHex": "" }, "SIT": { "text": "€", "uniDec": "", "uniHex": "" }, "TJS": { "text": "CMH", "uniDec": "", "uniHex": "" }, "AED": { "text": "د.إ.", "uniDec": "", "uniHex": "" } };
        var regexGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
        var regexUrl = /((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i;
        return {
            isValidGuid: function (id) {
                return regexGuid.test(id);
            },
            isValidUrl: function (url) {
                return regexUrl.test(url);
            },
            // obtain a URL without query string and hash value
            stripQueryStringAndHashFromPath: function (url) {
                return url.split("?")[0].split("#")[0];
            },
            // check the given JavaScript object and property path (with dot notation, such as 'error.message.value')
            checkNestedProperty: function (target, property) {
                var parts = property.split(propertySplitter);
                for (var i = 0, l = parts.length; i < l; i++) {
                    var part = parts[i];
                    if (target !== null && typeof target === "object" && part in target) {
                        target = target[part];
                    } else {
                        return false;
                    }
                }
                return true;
            },
            // get the property specified by the property name of the given object (with dot notation, such as 'error.message.value')
            getNestedProperty: function (target, property) {
                var parts = property.split(propertySplitter);
                for (var i = 0, l = parts.length; i < l; i++) {
                    var part = parts[i];
                    if (target !== null && typeof target === "object" && part in target) {
                        target = target[part];
                    } else {
                        return null;
                    }
                }
                return target;
            },
            // format currency for i18n support
            formatCurrency: function (value, format) {
                // format string is expected to be "currencyCode:#OfDecimals"
                var strings = format.split(':');
                var currencySymbol = '$';
                if (strings.length > 0 && strings[0].length > 0) {
                    if (isoCurrencyCodes[strings[0]]) {
                        currencySymbol = isoCurrencyCodes[strings[0]].text || '$';
                    }
                }
                var precision = 2;
                if (strings.length > 1 && strings[1].length > 0) {
                    precision = parseInt(strings[1]) || 2;
                }

                // native toFixed does not round up properly, e.g. (0.125).toFixed(2) === "0.12") instead of "0.13"
                var power = Math.pow(10, precision);

                // Multiply up by precision, round accurately, then divide and use native toFixed():
                var num = (Math.round(value * power) / power).toFixed(precision);

                return filterService('currency')(num, currencySymbol);
            }
        };
    };
    var utilityServiceName = 'utils';
    utilityModule.factory(utilityServiceName, ['$filter', utilityService]);

    /*
     * SharePoint utility service.
     */
    var spUtilityService = function () {
        return {
            // returns user display name from SharePoint user name, which can be in the 
            // format of SHAREPOINT\\system or i:0#.f|membership|xchen@dellapps.onmicrosoft.com 
            getUserName: function (name) {

            },

            // return list/forum name and handle special characters
            getListName: function (listName) {
                return encodeURI(listName.replace(/'/g, "''")).replace(/\'/g, "%27"); 
            }
        }
    };
    var spUtilityServiceName = 'spUtils';
    utilityModule.factory(spUtilityServiceName, [spUtilityService]);

    /**
     * Token service exposes the following tokens from app web URL.
     *      SPHostUrl: string
     *      SPAppWebUrl: string
     *      SPLanguage: string
     *      SPClientTag: string
     *      SPProductNumber: string
     *      wpId: string
     *      editmode: string
     */
    var tokenService = function ($document) {
        var tokens = {};

        var params = $document[0].URL.split("?");
        if (params.length < 2) {
            return tokens;
        }

        params = params[1].split("#")[0].split("&");
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            if (singleParam[0]) {
                tokens[singleParam[0]] = decodeURIComponent(singleParam[1]);
            }
        }

        return tokens;
    };
    var tokenServiceName = 'spTokens';
    utilityModule.factory(tokenServiceName, ['$document', tokenService]);

    /**
     * AppToken service exposes the following tokens from host app web URL.
     *      appPageUrl: string
     *      logging: string, possible values are: error, warn, info, debug and trace
     * See http://stackoverflow.com/questions/7839565/logging-levels-logback-rule-of-thumb-to-assign-log-levels
     * Default logging level is set to info
     */
    var appTokenService = function () {
        var tokens = {
            pageUrl: '',
            logging: 'info'
        };

        // if app part page URL exists; otherwise use immersive page query string, works for mock page as well
        checkParams(document.referrer);
        // if logging is specified in page url, it takes precedence
        checkParams(document.URL);

        function checkParams(url) { 
            if (url && url.length > 0) {
                var pageParams = url.split("?");
                if (pageParams.length > 0) {
                    if (pageParams.length > 1) {
                        pageParams = pageParams[1].split("#")[0].split("&");
                        for (var i = 0; i < pageParams.length; i = i + 1) {
                            var singleParam = pageParams[i].split("=");
                            if (singleParam[0] && (singleParam[0].toLowerCase() === 'logging')) {
                                tokens.logging = decodeURIComponent(singleParam[1]).toLowerCase();
                            }
                        }
                    }
                }
            }
        }
        return tokens;
    };
    var appTokenServiceName = 'appTokens';
    utilityModule.factory(appTokenServiceName, [appTokenService]);

});