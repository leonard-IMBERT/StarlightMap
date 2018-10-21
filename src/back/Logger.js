const { createLogger, format, transports } = require('winston');

const { printf, combine, timestamp } = format;

const level = process.env.Level || 'info';

const Logger = createLogger({
  level,
  format: combine(
    timestamp(),
    printf(info => `${info.timestamp} - [${info.level}]: ${info.message}`),
  ),
  transports: [
    new transports.Console(),
  ],
});

module.exports = Logger;
