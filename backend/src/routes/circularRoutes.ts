import { Router } from 'express';
import { getCirculars, createCircular, updateCircular, deleteCircular } from '../controllers/circularController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getCirculars);
router.post('/', createCircular);
router.put('/:id', updateCircular);
router.delete('/:id', deleteCircular);

export default router;
