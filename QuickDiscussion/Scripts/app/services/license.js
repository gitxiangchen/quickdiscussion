define(['app/app'], function (app) {
    'use strict';

    var licenseServiceName = 'licenseService';
    var LicenseService = (function () {

        function LicenseService($q, common, localize) {
            this.qService = $q;
            this.localize = localize;
            this.clientContext = SP.ClientContext.get_current();
            this.logger = common.logger.getLogger(licenseServiceName);

            this.verifyTokenUrl = 'https://verificationservice.officeapps.live.com/ova/verificationagent.svc/rest/verify?token=';
        }

        LicenseService.prototype.verify = function (spLicenseToken) {
            var deferred = this.$q.defer();

            try {
                var request = new SP.WebRequestInfo();
                request.set_url(this.verifyTokenUrl + encodeURIComponent(spLicenseToken));
                request.set_method('GET');

                var self = this;
                var response = SP.WebProxy.invoke(this.clientContext, request);
                this.clientContext.executeQueryAsync(function (sender, args) {
                    var verificationResponse = response.get_body() || '';
                    var statusCode = response.get_statusCode();

                    if (statusCode === 200) {
                        try {
                            var xmlLicenseInfo = $($.parseXML(verificationResponse));
                            var licenseInfo = {
                                assetId: xmlLicenseInfo.find('AssetId').text(),
                                deploymentId: xmlLicenseInfo.find('DeploymentId').text(),
                                entitlementAcquisitionDate: new Date(xmlLicenseInfo.find('EntitlementAcquisitionDate').text()),
                                entitlementType: xmlLicenseInfo.find('EntitlementType').text(),
                                isEntitlementExpired: AppLicenseService.stringToBoolean(xmlLicenseInfo.find('IsEntitlementExpired').text()),
                                isExpired: AppLicenseService.stringToBoolean(xmlLicenseInfo.find('IsExpired').text()),
                                isSiteLicense: AppLicenseService.stringToBoolean(xmlLicenseInfo.find('IsSiteLicense').text()),
                                isTest: AppLicenseService.stringToBoolean(xmlLicenseInfo.find('IsTest').text()),
                                isValid: AppLicenseService.stringToBoolean(xmlLicenseInfo.find('IsValid').text()),
                                productId: xmlLicenseInfo.find('ProductId').text(),
                                seats: parseInt(xmlLicenseInfo.find('Seats').text()),
                                signInDate: new Date(xmlLicenseInfo.find('SignInDate').text()),
                                subscriptionState: xmlLicenseInfo.find('SubscriptionState').text(),
                                tokenExpiryDate: new Date(xmlLicenseInfo.find('TokenExpiryDate').text())
                            };

                            var entitlementExpiryDate = xmlLicenseInfo.find('EntitlementExpiryDate').text();
                            if (entitlementExpiryDate) {
                                licenseInfo.entitlementExpiryDate = new Date(entitlementExpiryDate);
                            }

                            this.logger.debug({ message: 'obtain license:' + JSON.stringify(licenseInfo) });

                            deferred.resolve(licenseInfo);
                        } catch (error) {
                            this.logger.debug({ message: 'failed to obtain license: ' + error });
                            deferred.reject(self.localizationResources.getString('appStrings.licenseStrings.invalidResponseFromService'));
                        }
                    } else {
                        var message = '';
                        if (statusCode) {
                            message += statusCode.toString() + ' - ';
                        }
                        message += verificationResponse;
                        this.logger.debug({ message: 'failed to obtain license token: ' + message });
                        deferred.reject(self.localizationResources.getString('appStrings.licenseStrings.verifyLicenseQueryError', { error: message }));
                    }
                }, function (sender, args) {
                    this.logger.debug({ message: 'failed to obtain license token: ' + args.get_message() });
                    deferred.reject(self.localizationResources.getString('appStrings.licenseStrings.verifyLicenseQueryError', { error: args.get_message() }));
                });
            } catch (error) {
                this.logger.debug({ message: 'failed to obtain license token: ' + error });
                deferred.reject(self.localizationResources.getString('appStrings.licenseStrings.unexpectedError'));
            }

            return deferred.promise;
        }

        LicenseService.prototype.getLicenseTokens = function () {
            var deferred = this.$q.defer();

            try {
                var self = this;
                var appLicenses = SP.Utilities.Utility.getAppLicenseInformation(this.clientContext, new SP.Guid(exports.productId));
                this.clientContext.executeQueryAsync(function (sender, args) {
                    try {
                        var licenseCount = appLicenses.get_count();
                        var licenses = new Array(licenseCount);

                        for (var i = 0; i < licenseCount; i++) {
                            licenses[i] = appLicenses.get_item(i).get_rawXMLLicenseToken();
                        }

                        deferred.resolve(licenses);
                    } catch (error) {
                        deferred.reject(self.localizationResources.getString('appStrings.licenseStrings.unexpectedError'));
                    }
                }, function (sender, args) {
                    deferred.reject(self.localizationResources.getString('appStrings.licenseStrings.spLicenseQueryError', { error: args.get_message() }));
                });
            } catch (error) {
                deferred.reject(self.localizationResources.getString('appStrings.licenseStrings.unexpectedError'));
            }

            return deferred.promise;
        };

        LicenseService.prototype.getLicenseInfo = function () {
            if (!this.licenseInfo) {
                var licenseService = this;

                this.licenseInfo = this.getLicenseTokens().then(function (tokens) {
                    var deferred = licenseService.$q.defer();
                    var queriedLicenseInfo = [];
                    var ix = 0;

                    // We need to process the tokens one at a time. If we try to query them all in parallel,
                    // the query terminates with an error indicating that we've exceeded our query limit.
                    function processNextToken(verifiedLicenseInfo) {
                        if (verifiedLicenseInfo) {
                            queriedLicenseInfo.push(verifiedLicenseInfo);
                        }

                        if (tokens.length > ix) {
                            var currentToken = tokens[ix++];
                            licenseService.verifyLicense(currentToken).then(processNextToken, function (reason) {
                                deferred.reject(reason);
                            });
                        } else {
                            // We are finished and there are no more license tokens to verify.
                            deferred.resolve(queriedLicenseInfo);
                        }
                    }

                    processNextToken();

                    return deferred.promise;
                });
            }

            return this.licenseInfo;
        };

        LicenseService.prototype.findValidLicense = function (includeExpiredLicense) {
            if (!this.validLicense) {
                var self = this;
                this.validLicense = this.getLicenseTokens().then(function (tokens) {
                    var deferred = self.$q.defer();
                    var ix = 0;
                    var expiredLicense = null;

                    // We need to process the tokens one at a time. If we try to query them all in parallel,
                    // the query terminates with an error indicating that we've exceeded our query limit.
                    function processNextToken(verifiedLicenseInfo) {
                        if (verifiedLicenseInfo) {
                            if ((verifiedLicenseInfo.isValid || verifiedLicenseInfo.isTest) && !verifiedLicenseInfo.isExpired) {
                                if (verifiedLicenseInfo.isEntitlementExpired) {
                                    // The trial period for this license has expired.
                                    expiredLicense = verifiedLicenseInfo;
                                } else {
                                    deferred.resolve(verifiedLicenseInfo);

                                    // We've found a valid license. We are done.
                                    return;
                                }
                            }
                        }

                        if (tokens.length > ix) {
                            var currentToken = tokens[ix++];
                            self.verifyLicense(currentToken).then(processNextToken, function (reason) {
                                deferred.reject(reason);
                            });
                        } else {
                            // We are finished and there are no more license tokens to verify.
                            if (includeExpiredLicense) {
                                deferred.resolve(expiredLicense);
                            } else {
                                // Return nothing. There are no valid licenses.
                                deferred.resolve(null);
                            }
                        }
                    }

                    processNextToken();

                    return deferred.promise;
                });
            }

            return this.validLicense;
        };

        return LicenseService;

    })();

    app.service(licenseServiceName, ['$q', 'common', 'localize', LicenseService]);
})