// Protractor end 2 end test configuration file.
exports.config = {
  // The location of the selenium standalone server .jar file, relative
  // to the location of this config. If no other method of starting selenium
  // is found, this will default to
  // node_modules/protractor/selenium/selenium-server...
  //seleniumServerJar: '../../../node_modules/protractor/selenium/selenium-server-standalone-2.40.0.jar',
  // The port to start the selenium server on, or null if the server should
  // find its own unused port.
  //seleniumPort: 4444,
  // Chromedriver location is used to help the selenium standalone server
  // find chromedriver. This will be passed to the selenium jar as
  // the system property webdriver.chrome.driver. If null, selenium will
  // attempt to find chromedriver using PATH.
  chromeDriver: '../../../node_modules/protractor/selenium/chromedriver',
  // If true, only chromedriver will be started, not a standalone selenium.
  // Tests for browsers other than chrome will not run.
  chromeOnly: false,
 
  // The address of a running selenium server. If specified, Protractor will
  // connect to an already running instance of selenium. This usually looks like
  // seleniumAddress: 'http://localhost:4444/wd/hub'
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // Spec patterns are relative to the location of this config.
  specs: [
    './tests/e2e/**/*.test.js'
  ],

  // Patterns to exclude.
  exclude: [],

  // ----- Capabilities to be passed to the webdriver instance ----
  //
  // For a full list of available capabilities, see
  // https://code.google.com/p/selenium/wiki/DesiredCapabilities
  // and
  // https://code.google.com/p/selenium/source/browse/javascript/webdriver/capabilities.js
  capabilities: {
    'browserName': 'chrome'
  },

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  //baseUrl: null,

  // The params object will be passed directly to the protractor instance,
  // and can be accessed from your test. It is an arbitrary object and can
  // contain anything you may need in your test.
  // This can be changed via the command line as:
  //   --params.login.user 'Joe'
  params: {
    login: {
      user: 'xchen@dellapps.onmicrosoft.com',
      password: 'Money4us'
    },
    appName: 'Quick Discussion', // The name of the app installed on the site
    appTitle: 'Quick Discussion App', // The page title displayed when app is loaded in immersive page
    hostWebUrl: 'https://dellapps.sharepoint.com',  // The url of the site hosting the app
    hostContentUrl: 'https://dellapps.sharepoint.com/_layouts/15/appredirect.aspx?instance_id={C2EC262A-A710-444A-8166-6738FA83086A}&quick_launch=1' // The url of the host site content page
  },

  // ----- The test framework -----
  //
  // Jasmine and Cucumber are fully supported as a test and assertion framework.
  // Mocha has limited beta support. You will need to include your own
  // assertion framework if working with mocha.
  framework: 'jasmine',
  
  // ----- Options to be passed to minijasminenode -----
  //
  // See the full list at https://github.com/juliemr/minijasminenode
  jasmineNodeOpts: {
    // onComplete will be called just before the driver quits.
    onComplete: null,
    // If true, display spec names.
    isVerbose: false,
    // If true, print colors to the terminal.
    showColors: true,
    // If true, include stack traces in failures.
    includeStackTrace: true,
    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 30000
  },

  // https://github.com/angular/protractor/blob/master/spec/withLoginConf.js
  onPrepare: function () {
      browser.driver.get(browser.params.hostWebUrl);

      browser.driver.findElement(by.id('cred_userid_inputtext')).sendKeys(browser.params.login.user);
      browser.driver.findElement(by.id('cred_password_inputtext')).sendKeys(browser.params.login.password);
      browser.driver.findElement(by.id('cred_sign_in_button')).click();
      // the following line does not work
      //browser.driver.findElement(by.id('cred_password_inputtext')).sendKeys(protractor.Key.RETURN);
      // click on Sign In span element alone did not do the trick so we send the return key in addition to click on Sign in
      browser.driver.findElement(by.id('cred_password_inputtext')).then(function (element) {
          element.sendKeys(protractor.Key.RETURN);
      });

      // login takes some time, so wait until it's done, we know it succeeded when the url pattern matches
      browser.driver.wait(function () {
          return browser.driver.getCurrentUrl().then(function (url) {
              var pattern = new RegExp("start.aspx");
              //return /https:\/\/dellapps.sharepoint.com\/_layouts\/15\/start.aspx/.test(url);
              return pattern.test(url);
          });
      });

      // locate the app link on the page
      //browser.driver.findElement(By.xpath("//a[@title='Quick Discussion']")).then(function (link) {
      browser.driver.findElement(By.linkText(browser.params.appName)).then(function (link) {
          return link.getAttribute('href').then(function (href) {
              browser.params.hostContentUrl = href;
              console.log('updated app url=' + browser.params.hostContentUrl);
              return true;
          })
      });
  },

  // ----- The cleanup step -----
  //
  // A callback function called once the tests have finished running and
  // the webdriver instance has been shut down. It is passed the exit code
  // (0 if the tests passed or 1 if not).
  onCleanUp: function() {}
};
