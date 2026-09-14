import { Router } from 'express';
import { getRooms, createRoom, deleteRoom, allocateStudent, removeStudent } from '../controllers/hostelController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getRooms);
router.post('/', createRoom);
router.delete('/:id', deleteRoom);
router.post('/:id/allocate', allocateStudent);
router.delete('/:id/remove/:studentId', removeStudent);

export default router;
