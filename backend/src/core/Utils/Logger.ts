import config from '../../config/env-config';
import winston from 'winston';

// Winston logger 
const logger = winston.createLogger({
  // Set log level 
  level: config.logLevel || 'info',
  // log format 
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  // Log to console and log file
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

export default logger;