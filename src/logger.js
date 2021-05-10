// const path = require('path')
// const pkg = require('./package')
// const winston = require('winston')
// const logger = winston.createLogger({
//   format: winston.format.combine(
//     winston.format.splat(),
//     winston.format.simple(),
//     winston.format.timestamp(),
//     winston.format.colorize(),
//     winston.format.printf(info => `${pkg.name}: ${info.timestamp} ${info.level}: ${info.message}`)
//   ),
//   transports: [new winston.transports.Console()]
// })

// const loggerWrapper = (absoluteFilePath) => {
//   const file = path.relative(__dirname, absoluteFilePath)
//   // Because this file is in the source code root folder, the above will make all paths relative to it: just the info needed for the log.

//   return {
//     info: (message) => logger.info(`[${file}] ${message}`),
//     warn: (message) => logger.warn(`[${file}] ${message}`),
//     error: (message, error) => logger.error(`[${file}] ${message}${error && error.stack ? error.stack : (error || '')}`),
//     stopLogging: () => {
//       logger.silent = true
//     }
//   }
// }

// module.exports = loggerWrapper

const winston = require("winston");

const defaultNodeEnv = "production";
const nodeEnv = process.env.NODE_ENV ?? defaultNodeEnv;

const logLevels = {
  development: "debug",
  production: "error",
};

const options = {
  transports: [
    new winston.transports.Console({
      level: logLevels[nodeEnv],
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
};

const logger = winston.createLogger(options);

if (process.env.NODE_ENV !== "production") {
  logger.log({
    level: `${logLevels[nodeEnv]}`,
    message: `Logging initialized at ${logLevels[nodeEnv]} level, NODE_ENV=${process.env.NODE_ENV}`,
  });
}

const loggerWrapper = (absoluteFilePath) => {
  const file = path.relative(__dirname, absoluteFilePath);
  // Because this file is in the source code root folder, the above will make all paths relative to it: just the info needed for the log.

  return {
    info: (message) => logger.info(`[${file}] ${message}`),
    warn: (message) => logger.warn(`[${file}] ${message}`),
    error: (message, error) =>
      logger.error(
        `[${file}] ${message}${
          error && error.stack ? error.stack : error || ""
        }`
      ),
    stopLogging: () => {
      logger.silent = true;
    },
  };
};

module.exports = loggerWrapper;
