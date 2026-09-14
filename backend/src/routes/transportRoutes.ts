import { Router } from 'express';
import { getVehicles, createVehicle, deleteVehicle, allocateStudent, removeStudent } from '../controllers/transportController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getVehicles);
router.post('/', createVehicle);
router.delete('/:id', deleteVehicle);
router.post('/:id/allocate', allocateStudent);
router.delete('/:id/remove/:studentId', removeStudent);

export default router;
