const path = require("path");
const pkg = require("./package");
const winston = require("winston");
// const logger = winston.createLogger({
//   format: winston.format.combine(
//     winston.format.splat(),
//     winston.format.simple(),
//     winston.format.timestamp(),
//     winston.format.colorize(),
//     winston.format.printf(
//       (info) => `${pkg.name}: ${info.timestamp} ${info.level}: ${info.message}`
//     )
//   ),
//   transports: [new winston.transports.Console()],
// });

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

export const logger = winston.createLogger(options);

const loggerWrapper = (absoluteFilePath) => {
  const file = path.relative(__dirname, absoluteFilePath);
  // Because this file is in the source code root folder, the above will make all paths relative to it: just the info needed for the log.

  return {
    info: (message, meta) => logger.info(`[${file}] ${message}`, { meta }),
    warn: (message) => logger.warn(`[${file}] ${message}`),
    error: (message, error) =>
      logger.error(
        `[${file}] ${message}${
          error && error.stack ? error.stack : error || ""
        }`,
        { error }
      ),
    stopLogging: () => {
      logger.silent = true;
    },
  };
};

module.exports = loggerWrapper;
