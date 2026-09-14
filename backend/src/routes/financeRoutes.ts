import { Router } from 'express';
import { getFees, createFee, markFeePaid, deleteFee } from '../controllers/financeController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/fees', getFees);
router.post('/fees', createFee);
router.put('/fees/:id/pay', markFeePaid);
router.delete('/fees/:id', deleteFee);

export default router;
