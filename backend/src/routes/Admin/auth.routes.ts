import express from 'express';
import passport from "passport";
import {
  signup,
  login,
  handleForgotPassword,
  handleVerifyOTP,
  handleResetPassword,
  logout,
  refreshToken,
  googleAuthRedirect,
  githubAuthRedirect,
} from '../../controllers/Admin/auth.controller.js';

const router = express.Router();

router.post('/register/signup', signup);
router.post('/register/forgot-password', handleForgotPassword);
router.post('/register/verify-otp', handleVerifyOTP);
router.post('/register/reset-password', handleResetPassword);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
// Google Authentication Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleAuthRedirect
);

// GitHub Authentication Routes
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  githubAuthRedirect
);

router.post('/logout', logout);

export default router;