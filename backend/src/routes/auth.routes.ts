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
import {
  verifyToken,
  checkBlockedStatus,
  verifyRefreshTokenMiddleware,
  authorize,
} from "../middlewares/auth.middleware.js";
import {
  apiLimiter,
  authLimiter,
} from "../middlewares/ratelimit.middleware.js";
import { upload } from "../utils/multer.utils.js";

const router = express.Router();

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
  [authLimiter, verifyToken, authorize("admin")],
  verifyPasskey
);
router.post(
  "/refresh-token",
  [apiLimiter, verifyRefreshTokenMiddleware],
  refreshToken
);
router.post("/logout", [apiLimiter, verifyToken], logout);

// Protected user routes
router.get(
  "/check-profile/:id",
  [apiLimiter, verifyToken, checkBlockedStatus],
  checkProfile
);
router.get(
  "/profiledetails/:id",
  [apiLimiter, verifyToken, checkBlockedStatus],
  getprofileDetails
);
router.put(
  "/updateUserDetails/:Id",
  [
    apiLimiter,
    verifyToken,
    checkBlockedStatus,
    upload.fields([
      { name: "profilePic", maxCount: 1 },
      { name: "coverPic", maxCount: 1 },
    ]),
  ],
  updateUserDetails
);

export default router;
