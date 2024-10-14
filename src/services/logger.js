const winston = require('winston');

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

let transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({
    filename: 'logs/server.log',
  }),
];

if (process.env.TRACE_DEBUG_LOG) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/debug.log',
      level: 'debug',
    })
  );
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
    winston.format.align(),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
      let logMessage = `${info.level}: ${[info.timestamp]}: ${info.message}`;

      if (info.stack) {
        logMessage += `: ${info.stack}`;
      }

      return logMessage;
    })
  ),
  level: level(),
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  transports,
});

const debug = (message) => {
  logger.log('debug', message);
};

module.exports = {
  logger,
  debug,
};
