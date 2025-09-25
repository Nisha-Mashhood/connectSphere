import webPush from "web-push";
import dotenv from "dotenv";
import config from '../../config/env-config';

dotenv.config();

if (!config.vapidEmail || !config.vapidPublicKey || !config.vapidPrivateKey) {
    throw new Error("❌ Missing VAPID keys! Check your .env file.");
  }

webPush.setVapidDetails(
    `mailto:${config.vapidEmail}`,
    config.vapidPublicKey,
    config.vapidPrivateKey,
  );

export default webPush;



