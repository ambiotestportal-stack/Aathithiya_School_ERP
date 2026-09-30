import { Router } from 'express';
import { getStocks, createStock, updateStock, deleteStock } from '../controllers/stockController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getStocks);
router.post('/', createStock);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);

export default router;
