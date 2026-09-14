import { Router } from 'express';
import { getHomework, createHomework, deleteHomework } from '../controllers/homeworkController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getHomework);
router.post('/', createHomework);
router.delete('/:id', deleteHomework);

export default router;
