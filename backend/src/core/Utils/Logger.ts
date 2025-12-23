import winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import config from "../../config/env-config";

//Logtail client
const logtail = new Logtail(process.env.BETTERSTACK_LOG_TOKEN!, {
  endpoint: process.env.BETTERSTACK_LOG_ENDPOINT,
});

const logger = winston.createLogger({
  level: config.logLevel || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),

    //Better Stack (cloud logs)
    new LogtailTransport(logtail),
  ],
});

export default logger;
