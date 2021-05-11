const chromium = require("chrome-aws-lambda");
const puppeteerCore = require("puppeteer-core");
const login = require("./login");
const profile = require("./profile/profile");
const company = require("./company/company");
const logger = require("./logger")(__filename);

module.exports = async (
  {
    cookies,
    email,
    password,
    // isHeadless,
    hasToLog,
    hasToGetContactInfo,
    puppeteerArgs,
    puppeteerAuthenticate,
    endpoint,
  } = { hasToLog: false }
) => {
  if (!hasToLog) {
    logger.stopLogging();
  }
  logger.info("initializing");

  const args = Object.assign(
    { headless: isHeadless, args: ["--no-sandbox"] },
    puppeteerArgs
  );

  let browser = await chromium.puppeteer.launch(args);

  if (cookies) {
    logger.info("using cookies, login will be bypassed");
  } else if (email && password) {
    logger.info("email and password was provided, we're going to login...");

    try {
      await login(browser, email, password, logger);
    } catch (e) {
      if (!endpoint) {
        await browser.close();
      }
      throw e;
    }
  } else {
    logger.warn(
      "email/password and cookies wasn't provided, only public data will be collected"
    );
  }

  return (url, waitMs) =>
    url.includes("/school/") || url.includes("/company/")
      ? company(
          browser,
          cookies,
          url,
          waitMs,
          hasToGetContactInfo,
          puppeteerAuthenticate
        )
      : profile(
          browser,
          cookies,
          url,
          waitMs,
          hasToGetContactInfo,
          puppeteerAuthenticate
        );
};
