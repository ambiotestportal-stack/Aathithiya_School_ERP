import { Router } from 'express';
import { getLeaveRequests, createLeaveRequest, updateLeaveStatus } from '../controllers/leaveController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getLeaveRequests);
router.post('/', createLeaveRequest);
router.put('/:id/status', updateLeaveStatus);

export default router;
