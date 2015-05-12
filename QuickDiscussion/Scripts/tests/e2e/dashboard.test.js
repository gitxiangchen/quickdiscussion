var protractor = require('protractor');
var e2e = require('../libs/protractor.e2e');

describe('Open app default dashboard page', function () {
    var protractor = require('protractor');
    var ptor = protractor.getInstance();
    var config = e2e.getConfiguration();

    beforeEach(function () {
    });

    // first sharepoint login page is non-AngularJS page, use webdriver instead of protractor wrapper
    it('Should be able to access from SharePoint online', function () {
        console.log('load page: ' + config.hostContentUrl);
        ptor.get(config.hostContentUrl);

        // wait till angularjs is loaded as we bootstrap it manually without using ng-App
        //browser.wait(function () {
            browser.driver.getTitle().then(function (title) {
                return config.appTitle === title;
            });
        //});

        // Find the element with binding matching 'discussionCount' in dashboard
        var count = element(by.binding('discussionCount'));
        expect(count.getText()).toEqual('28');
    });

    afterEach(function () {
    });
});
