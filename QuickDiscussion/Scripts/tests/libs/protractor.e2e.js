var protractor = require('protractor');
var ptor = protractor.getInstance();
var driver = ptor.driver;

var getConfiguration = function () {
    var protractor = require('protractor');
    var ptor = protractor.getInstance();

    if (!ptor.params.hostWebUrl) {
        throw new Error('Protractor e2e test requires hostWebUrl parameter being set');
    }
    var hostWebUrlMatch = /^(http(?:s?):\/\/)([^/?]+)(.+?)\/?$/i.exec(ptor.params.hostWebUrl);
    if (!hostWebUrlMatch) {
        throw new Error('Protractor e2e test parameter hostWebUrl is invalid.');
    }

    return ptor.params;
}

var prepareApp = function () {
    var findById = function (id) {
        return driver.findElement(protractor.By.id(id));
    };

    var config = ptor.params;
    driver.get(config.hostWebUrl);

    // if we are getting sign into 365 page, let's sign in first
    var userInput = findById('cred_userid_inputtext');
    var passInput = findById('cred_password_inputtext');
    var submit = findById('cred_sign_in_button');
    // if we are getting sign into 365 page, let's sign in first
    driver.getTitle().then(function (title) {
        if ("Sign in to Office 365" === title) {
            findById("cred_userid_inputtext").sendKeys(config.login.user);
            findById("cred_password_inputtext").sendKeys(config.login.password);
            findById("cred_sign_in_button").click();
            // click on Sign In span element alone did not do the trick so we send the return key in addition to click on Sign in
            findById('cred_password_inputtext').then(function (element) {
                element.sendKeys(protractor.Key.RETURN);
            });
        }
    });
}

// Login takes some time, so wait until it's done.
// For the test app's login, we know it's done when it redirects to
// index.html.
var waitTillLoaded = function () {
    ptor.wait(function () {
        return ptor.driver.getCurrentUrl().then(function (url) {
            var config = ptor.params;
            var patt = new RegExp(config.hostHomeUrl);
            console.log('wait=' + patt.test(url));
            return patt.test(url);
        });
    });

    var link = findLinkByTitle("Quick Discussion");
};

var findLinkByTitle = function (title) {
    var links = driver.findElements(By.tagName('a'));
    console.log('process links=' + links.length);
    return protractor.promise.filter(links, function (link) {
        var deferred = protractor.promise.defer();
        link.getAttribute('title').then(function (linkTitle) {
            if (linkTitle === title) {
                console.log('find link=' + linkTitle);
                link.getAttribute('href').then(function (href) {
                    var config = ptor.params;
                    config.hostContentUrl = href;
                    console.log('update link=' + config.hostContentUrl);
                });
                deferred.fullfill(true);
            }
        });
        return deferred.promise;
    }).then(function (foundLinks) {
        console.log('count=' + foundLinks.length);
        return foundLinks[0];
    });
}

module.exports.getConfiguration = getConfiguration;
module.exports.prepareApp = prepareApp;
module.exports.waitTillLoaded = waitTillLoaded;