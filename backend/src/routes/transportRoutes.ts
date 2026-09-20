import { Router } from 'express';
import { getVehicles, createVehicle, deleteVehicle, allocateStudent, removeStudent, notifyBusStatus, getTransportLogs } from '../controllers/transportController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getVehicles);
router.get('/logs', getTransportLogs);
router.post('/', createVehicle);
router.post('/:id/notify-status', notifyBusStatus);
router.delete('/:id', deleteVehicle);
router.post('/:id/allocate', allocateStudent);
router.delete('/:id/remove/:studentId', removeStudent);

export default router;

