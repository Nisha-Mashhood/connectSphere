import Redis, { Redis as RedisClient } from "ioredis";
import config from "./env-config";

const redisUrl: string | undefined = config.redisclienturl;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

export const redisClient: RedisClient = new Redis(redisUrl);

redisClient.on("connect", () => {
  console.log("✅ Redis Cloud connected");
});

redisClient.on("ready", () => {
  console.log("✅ Redis Cloud ready");
});

redisClient.on("error", (err: Error) => {
  console.error("❌ Redis error:", err.message);
});
