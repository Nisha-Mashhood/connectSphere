import * as dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const config = {
  port: process.env.PORT || 3000,
  adminEmail:process.env.ADMIN_EMAIL,
  defaultprofilepic: process.env.DEFAULT_PROFILE_PIC,
  defaultcoverpic: process.env.DEFAULT_COVER_PIC,
  node_env: process.env.NODE_ENV,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_key',
  emailService: process.env.EMAIL_SERVICE,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASS,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  googleclientid: process.env.GOOGLE_CLIENT_ID,
  googleclientsecret: process.env.GOOGLE_CLIENT_SECRET,
  githubclientid: process.env.GITHUB_CLIENT_ID,
  githubclientsecret: process.env.GITHUB_CLIENT_SECRET,
  githubcallbackurl: process.env.GITHUB_CALLBACK_URL,
  baseurl: process.env.BASE_URL,
  frontendurl:process.env.FRONTEND_URL,
  sessionsecret: process.env.SESSION_SECRET,
  adminpasscode: process.env.PASSKEY_ADMIN,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidEmail: process.env.VAPID_EMAIL,
  redisclienturl: process.env.REDIS_URL,
  logLevel: process.env.LOG_LEVEL,
};

export default config;