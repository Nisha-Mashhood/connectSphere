import express from 'express';
import { AuthController } from '../Controllers/AuthController.js';
import { AuthMiddleware } from '../../../middlewares/auth.middleware.js';
import { apiLimiter, authLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { upload } from '../../../core/Utils/Multer.js';
const router = express.Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();
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
router.post('/verify-admin-passkey', [authLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.verifyPasskey.bind(authController));
router.post('/refresh-token', [apiLimiter, authMiddleware.verifyRefreshToken], authController.refreshToken.bind(authController));
router.post('/logout', [apiLimiter, authMiddleware.verifyToken], authController.logout.bind(authController));
// Protected user routes
router.get('/check-profile/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], authController.checkProfile.bind(authController));
router.get('/profiledetails/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], authController.getProfileDetails.bind(authController));
router.put('/updateUserDetails/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPic', maxCount: 1 }])], authController.updateUserDetails.bind(authController));
router.get('/users', [apiLimiter, authMiddleware.verifyToken], authController.getAllUsers.bind(authController));
router.get('/users/:id', [apiLimiter, authMiddleware.verifyToken], authController.getUserById.bind(authController));
router.put('/users/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.fields([{ name: 'profilePhoto', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }])], authController.updateUserDetails.bind(authController));
router.put('/users/block/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.blockUser.bind(authController));
router.put('/users/unblock/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.unblockUser.bind(authController));
router.put('/users/role/:id', [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.changeRole.bind(authController));
export default router;
//# sourceMappingURL=AuthRoutes.js.map