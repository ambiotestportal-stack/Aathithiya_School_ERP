import { Router } from 'express';
import { getBatches, createBatch, deleteBatch } from '../controllers/batchController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getBatches);
router.post('/', createBatch);
router.delete('/:id', deleteBatch);

export default router;
