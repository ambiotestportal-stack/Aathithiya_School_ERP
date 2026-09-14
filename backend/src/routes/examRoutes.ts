import { Router } from 'express';
import { getExams, createExam, updateExam, deleteExam, getExamResults, saveExamResults, getStudentResults } from '../controllers/examController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/student/:studentId', getStudentResults);

router.get('/', getExams);
router.post('/', createExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

router.get('/results', getExamResults);
router.post('/results', saveExamResults);

export default router;
