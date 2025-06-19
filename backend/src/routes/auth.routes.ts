import express from "express";
import {
  signup,
  login,
  handleForgotPassword,
  handleVerifyOTP,
  handleResetPassword,
  logout,
  refreshToken,
  verifyPasskey,
  checkProfile,
  getprofileDetails,
  updateUserDetails,
  googleSignup,
  googleLogin,
  githubLogin,
  githubSignup
} from "../controllers/auth.controller.js";
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import {
  apiLimiter,
  authLimiter,
} from "../middlewares/ratelimit.middleware.js";
import { upload } from "../core/Utils/Multer.js";

const router = express.Router();
const authMiddleware = new AuthMiddleware();

// Public routes
router.post("/register/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/register/forgot-password", authLimiter, handleForgotPassword);
router.post("/register/verify-otp", authLimiter, handleVerifyOTP);
router.post("/register/reset-password", authLimiter, handleResetPassword);
router.post("/google-signup", authLimiter, googleSignup);
router.post("/google-login", authLimiter, googleLogin);
router.post('/github-signup',authLimiter,githubSignup);
router.post('/github-login',authLimiter,githubLogin);
// Protected routes
router.post(
  "/verify-admin-passkey",
  [authLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')],
  verifyPasskey
);
router.post(
  "/refresh-token",
  [apiLimiter, authMiddleware.verifyRefreshToken],
  refreshToken
);
router.post("/logout", [apiLimiter, authMiddleware.verifyToken], logout);

// Protected user routes
router.get(
  "/check-profile/:id",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  checkProfile
);
router.get(
  "/profiledetails/:id",
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus],
  getprofileDetails
);

router.put(
  "/updateUserDetails/:Id",
  [
    apiLimiter,
    authMiddleware.verifyToken,
    authMiddleware.checkBlockedStatus,
    upload.fields([
      { name: "profilePic", maxCount: 1 },
      { name: "coverPic", maxCount: 1 },
    ]),
  ],
  updateUserDetails
);

export default router;
