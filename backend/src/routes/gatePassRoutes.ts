import { Router } from 'express';
import { getGatePasses, createGatePass, updateGatePass, deleteGatePass } from '../controllers/gatePassController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getGatePasses);
router.post('/', createGatePass);
router.put('/:id', updateGatePass);
router.delete('/:id', deleteGatePass);

export default router;
