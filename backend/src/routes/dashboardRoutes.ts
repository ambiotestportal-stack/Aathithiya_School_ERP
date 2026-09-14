import { Router } from 'express';
import { getAdminStats } from '../controllers/dashboardController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/admin', getAdminStats);

export default router;
