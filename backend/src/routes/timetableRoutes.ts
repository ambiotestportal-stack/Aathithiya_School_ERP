import { Router } from 'express';
import { getTimetable, saveTimetable, getTeacherTimetable, saveStaffTimetable } from '../controllers/timetableController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/teacher/:teacherId', getTeacherTimetable);
router.post('/staff', saveStaffTimetable);
router.get('/', getTimetable);
router.post('/', saveTimetable);

export default router;
