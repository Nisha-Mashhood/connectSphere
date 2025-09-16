import winston from "winston";
import Transport from "winston-transport";
import { Logform } from "winston";

// send error logs to backend API
class BrowserServerTransport extends Transport {
  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
  }

  log(info: Logform.TransformableInfo, callback: () => void): void {
    if (info.level === "error") {
      const logEntry = `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
      fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log: logEntry }),
      }).catch((error) => {
        console.error("Failed to send log to server:", error);
      });
    }

    callback();
  }
}


// Winston logger 
const logger = winston.createLogger({
  level: import.meta.env.ENV_MODE === "development" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      level: import.meta.env.ENV_MODE === "development" ? "debug" : "info",
    }),
    new BrowserServerTransport({ level: "error" }),
  ],
});

export interface Logger {
  info: (message: string, ...meta: unknown[]) => void;
  error: (message: string, ...meta: unknown[]) => void;
  warn: (message: string, ...meta: unknown[]) => void;
  debug: (message: string, ...meta: unknown[]) => void;
}

export default logger as Logger;
