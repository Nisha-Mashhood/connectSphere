import dotenv from 'dotenv';
dotenv.config();
const config = {
    port: process.env.PORT || 3000,
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_key',
    emailService: process.env.EMAIL_SERVICE,
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASS
};
export default config;
//# sourceMappingURL=env.config.js.map