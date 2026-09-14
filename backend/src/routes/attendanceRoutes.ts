import { Router } from 'express';
import { getAttendance, markAttendance, getStudentAttendance } from '../controllers/attendanceController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/student/:studentId', getStudentAttendance);
router.get('/', getAttendance);
router.post('/', markAttendance);

export default router;
