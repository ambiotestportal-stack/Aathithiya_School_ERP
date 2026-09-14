import { Router } from 'express';
import { getStudents, createStudent, deleteStudent, getMyProfile, getMyChildren, updateStudent, addOrUpdateParent, bulkImportStudents } from '../controllers/studentController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/me', getMyProfile);
router.get('/children', getMyChildren);
router.get('/', getStudents);
router.post('/', createStudent);
router.post('/import', bulkImportStudents);
router.put('/:id', updateStudent);
router.post('/:id/parent', addOrUpdateParent);
router.delete('/:id', deleteStudent);

export default router;
