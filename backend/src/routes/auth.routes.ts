import express from 'express';
import {
  registerPersonalDetails,
  registerAccountDetails,
  registerProfessionalDetails,
  registerReasonAndRole,
  login,
  handleForgotPassword,
  handleVerifyOTP,
  handleResetPassword,
  logout,
  refreshToken,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register/personal', registerPersonalDetails);
router.post('/register/account', registerAccountDetails);
router.post('/register/professional', registerProfessionalDetails);
router.post('/register/reason-role', registerReasonAndRole);
router.post('/register/forgot-password', handleForgotPassword);
router.post('/register/verify-otp', handleVerifyOTP);
router.post('/register/reset-password', handleResetPassword);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router;
