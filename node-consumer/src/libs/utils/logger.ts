import winston from 'winston';
import config from '../../config';

const Logger = winston.createLogger({
  level: config.logs.level,
  levels: winston.config.npm.levels,
  format: winston.format.combine(winston.format.colorize(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.cli(),
    }),
  ],
});

export default Logger;
