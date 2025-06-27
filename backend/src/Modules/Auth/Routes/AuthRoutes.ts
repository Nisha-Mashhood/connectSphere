import express from 'express';
import { AuthController } from '../Controllers/AuthController';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { apiLimiter, authLimiter } from '../../../middlewares/ratelimit.middleware';
import { upload } from '../../../core/Utils/Multer';
import { AUTH_ROUTES } from '../Constant/auth.routes';

const router = express.Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// Public routes
router.post(AUTH_ROUTES.Register, authLimiter, authController.signup.bind(authController));
router.post(AUTH_ROUTES.Login, authLimiter, authController.login.bind(authController));
router.post(AUTH_ROUTES.ForgotPassword, authLimiter, authController.handleForgotPassword.bind(authController));
router.post(AUTH_ROUTES.VerifyOTP, authLimiter, authController.handleVerifyOTP.bind(authController));
router.post(AUTH_ROUTES.ResetPassword, authLimiter, authController.handleResetPassword.bind(authController));
router.post(AUTH_ROUTES.GoogleSignup, authLimiter, authController.googleSignup.bind(authController));
router.post(AUTH_ROUTES.GoogleLogin, authLimiter, authController.googleLogin.bind(authController));
router.post(AUTH_ROUTES.GithubSignup, authLimiter, authController.githubSignup.bind(authController));
router.post(AUTH_ROUTES.GithubLogin, authLimiter, authController.githubLogin.bind(authController));

// Protected routes
router.post(AUTH_ROUTES.VerifyAdminPasskey, [authLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.verifyPasskey.bind(authController));
router.post(AUTH_ROUTES.RefreshToken, [apiLimiter, authMiddleware.verifyRefreshToken], authController.refreshToken.bind(authController));
router.post(AUTH_ROUTES.Logout, [apiLimiter], authController.logout.bind(authController));

// Protected user routes
router.get(AUTH_ROUTES.CheckProfile, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], authController.checkProfile.bind(authController));
router.get(AUTH_ROUTES.ProfileDetails, [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], authController.getProfileDetails.bind(authController));
router.put(
  AUTH_ROUTES.UpdateUserDetails,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPic', maxCount: 1 }])],
  authController.updateUserDetails.bind(authController)
);
router.get(AUTH_ROUTES.GetAllUsers, [apiLimiter, authMiddleware.verifyToken], authController.getAllUsers.bind(authController));
router.get(AUTH_ROUTES.GetUser, [apiLimiter, authMiddleware.verifyToken], authController.getUserById.bind(authController));
router.put(
  AUTH_ROUTES.UpdateUser,
  [apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, upload.fields([{ name: 'profilePhoto', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }])],
  authController.updateUserDetails.bind(authController)
);
router.put(AUTH_ROUTES.BlockUser, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.blockUser.bind(authController));
router.put(AUTH_ROUTES.UnblockUser, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.unblockUser.bind(authController));
router.put(AUTH_ROUTES.ChangeRole, [apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.changeRole.bind(authController));

export default router;