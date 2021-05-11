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
    isHeadless,
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

  let browser = await chromium.puppeteer.launch({
    args: [
      "--autoplay-policy=user-gesture-required",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-client-side-phishing-detection",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-dev-shm-usage",
      "--disable-domain-reliability",
      // "--disable-extensions",
      // "--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process",
      "--disable-hang-monitor",
      // "--disable-ipc-flooding-protection",
      "--disable-offer-store-unmasked-wallet-cards",
      "--disable-popup-blocking",
      "--disable-print-preview",
      "--disable-prompt-on-repost",
      "--disable-renderer-backgrounding",
      "--disable-setuid-sandbox",
      "--disable-speech-api",
      "--disable-sync",
      // "--disable-web-security",
      "--disk-cache-size=33554432",
      // "--hide-scrollbars",
      // "--ignore-gpu-blocklist",
      "--metrics-recording-only",
      "--mute-audio",
      "--no-default-browser-check",
      "--no-first-run",
      "--no-pings",
      "--no-sandbox",
      "--no-zygote",
      "--password-store=basic",
      "--use-gl=swiftshader",
      "--use-mock-keychain",
      // "--window-size=1920,1080",
    ],
    // args: ["--no-sandbox"],
    // defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

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
