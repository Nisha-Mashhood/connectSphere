import express from 'express';
import { registerPersonalDetails, registerAccountDetails, registerProfessionalDetails, registerReasonAndRole, login, } from '../controllers/authcontroller.js';
const router = express.Router();
router.post('/register/personal', registerPersonalDetails);
router.post('/register/account', registerAccountDetails);
router.post('/register/professional', registerProfessionalDetails);
router.post('/register/reason-role', registerReasonAndRole);
// Login Route
router.post('/login', login);
export default router;
//# sourceMappingURL=authRoutes.js.map