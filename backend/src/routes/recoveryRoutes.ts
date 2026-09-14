import { Router } from 'express';
import { getDeletedRecords, restoreRecord, hardDeleteRecord } from '../controllers/recoveryController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Protect all recovery routes to Super Admin only
router.use(authenticateToken, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN));

router.get('/', getDeletedRecords);
router.put('/:id/restore', restoreRecord);
router.delete('/:id', hardDeleteRecord);

export default router;
