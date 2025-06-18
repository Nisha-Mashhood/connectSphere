import { Router } from 'express';
import { MentorController } from '../Controllers/Mentorcontroller.js';
import { apiLimiter } from '../../../middlewares/ratelimit.middleware.js';
import { authorize, checkBlockedStatus, verifyToken } from '../../../middlewares/auth.middleware.js';
import { upload } from '../../../utils/multer.utils.js';

const router = Router();
const mentorController = new MentorController();

router.post('/mentors', [apiLimiter, verifyToken, checkBlockedStatus, upload.array('certificates', 2)], mentorController.createMentor);
router.get('/mentors/check/:id', [apiLimiter, verifyToken, checkBlockedStatus], mentorController.checkMentorStatus);
router.get('/mentors/requests', [apiLimiter, verifyToken, authorize('admin')], mentorController.getAllMentorRequests);
router.put('/mentors/approve/:id', [apiLimiter, verifyToken, authorize('admin')], mentorController.approveMentorRequest);
router.put('/mentors/reject/:id', [apiLimiter, verifyToken, authorize('admin')], mentorController.rejectMentorRequest);
router.put('/mentors/cancel/:mentorId', [apiLimiter, verifyToken, authorize('admin')], mentorController.cancelMentorship);
router.get('/mentors/:mentorId', [apiLimiter, verifyToken, checkBlockedStatus], mentorController.getMentorDetails);
router.put('/mentors/:mentorId', [apiLimiter, verifyToken, checkBlockedStatus], mentorController.updateMentorProfile);
router.get('/mentors', [apiLimiter, verifyToken, checkBlockedStatus], mentorController.getAllMentors);
router.get('/mentors/user/:userId', [apiLimiter, verifyToken, checkBlockedStatus], mentorController.getMentorByUserId);

export default router;