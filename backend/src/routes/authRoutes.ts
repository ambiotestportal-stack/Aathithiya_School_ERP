import { Router } from 'express';
import { login, seedSuperAdmin } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/seed', seedSuperAdmin);

export default router;
