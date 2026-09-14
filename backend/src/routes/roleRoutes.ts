import { Router } from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/roleController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeRoles(UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN), getRoles);
router.post('/', authorizeRoles(UserRole.SUPER_ADMIN), createRole);
router.put('/:id', authorizeRoles(UserRole.SUPER_ADMIN), updateRole);
router.delete('/:id', authorizeRoles(UserRole.SUPER_ADMIN), deleteRole);

export default router;
