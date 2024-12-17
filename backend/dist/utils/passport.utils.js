import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { findUserById } from "../repositories/user.repositry.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils.js";
import config from '../config/env.config.js';
import { findOrCreateUserforPassport } from "../services/auth.service.js";
const configurePassport = () => {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: config.googleclientid,
        clientSecret: config.githubclientsecret,
        callbackURL: config.googlecallbackurl,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const user = await findOrCreateUserforPassport(profile, "google");
            const jwtAccessToken = generateAccessToken({ id: user._id });
            const jwtRefreshToken = generateRefreshToken({ id: user._id });
            // Attach JWT tokens for use in the controller
            user.accessToken = jwtAccessToken;
            user.refreshToken = jwtRefreshToken;
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, undefined);
        }
    }));
    // GitHub Strategy
    passport.use(new GitHubStrategy({
        clientID: config.githubclientid,
        clientSecret: config.githubclientsecret,
        callbackURL: config.githubcallbackurl,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const user = await findOrCreateUserforPassport(profile, "github");
            const jwtAccessToken = generateAccessToken({ id: user._id });
            const jwtRefreshToken = generateRefreshToken({ id: user._id });
            user.accessToken = jwtAccessToken;
            user.refreshToken = jwtRefreshToken;
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        }
        catch (error) {
            return done(error, undefined);
        }
    }));
    // Serialize user to session
    passport.serializeUser((user, done) => {
        done(null, user._id); // Save only the user ID in the session
    });
    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await findUserById(id);
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    });
};
export default configurePassport;
//# sourceMappingURL=passport.utils.js.map