import { Router } from 'express';
import { getUsers, createUser, deleteUser, updateUser } from '../controllers/userController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles(UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
