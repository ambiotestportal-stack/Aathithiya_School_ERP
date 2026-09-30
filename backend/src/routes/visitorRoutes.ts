import { Router } from 'express';
import { getVisitors, createVisitor, updateVisitor, deleteVisitor } from '../controllers/visitorController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getVisitors);
router.post('/', createVisitor);
router.put('/:id', updateVisitor);
router.delete('/:id', deleteVisitor);

export default router;
