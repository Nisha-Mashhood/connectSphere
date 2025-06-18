import express from 'express';
import { AuthController } from '../Controllers/AuthController.js';
import { verifyToken, checkBlockedStatus, verifyRefreshTokenMiddleware, authorize } from '../../../middlewares/auth.middleware.js';
import { apiLimiter, authLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../utils/multer.utils.js';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register/signup', authLimiter, authController.signup.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));
router.post('/register/forgot-password', authLimiter, authController.handleForgotPassword.bind(authController));
router.post('/register/verify-otp', authLimiter, authController.handleVerifyOTP.bind(authController));
router.post('/register/reset-password', authLimiter, authController.handleResetPassword.bind(authController));
router.post('/google-signup', authLimiter, authController.googleSignup.bind(authController));
router.post('/google-login', authLimiter, authController.googleLogin.bind(authController));
router.post('/github-signup', authLimiter, authController.githubSignup.bind(authController));
router.post('/github-login', authLimiter, authController.githubLogin.bind(authController));

// Protected routes
router.post('/verify-admin-passkey', [authLimiter, verifyToken, authorize('admin')], authController.verifyPasskey.bind(authController));
router.post('/refresh-token', [apiLimiter, verifyRefreshTokenMiddleware], authController.refreshToken.bind(authController));
router.post('/logout', [apiLimiter, verifyToken], authController.logout.bind(authController));

// Protected user routes
router.get('/check-profile/:id', [apiLimiter, verifyToken, checkBlockedStatus], authController.checkProfile.bind(authController));
router.get('/profiledetails/:id', [apiLimiter, verifyToken, checkBlockedStatus], authController.getProfileDetails.bind(authController));
router.put(
  '/updateUserDetails/:id',
  [apiLimiter, verifyToken, checkBlockedStatus, upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPic', maxCount: 1 }])],
  authController.updateUserDetails.bind(authController)
);
router.get('/users', [apiLimiter, verifyToken], authController.getAllUsers.bind(authController));
router.get('/users/:id', [apiLimiter, verifyToken], authController.getUserById.bind(authController));
router.put(
  '/users/:id',
  [apiLimiter, verifyToken, checkBlockedStatus, upload.fields([{ name: 'profilePhoto', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }])],
  authController.updateUserDetails.bind(authController)
);
router.put('/users/block/:id', [apiLimiter, verifyToken, authorize('admin')], authController.blockUser.bind(authController));
router.put('/users/unblock/:id', [apiLimiter, verifyToken, authorize('admin')], authController.unblockUser.bind(authController));
router.put('/users/role/:id', [apiLimiter, verifyToken, authorize('admin')], authController.changeRole.bind(authController));

export default router;