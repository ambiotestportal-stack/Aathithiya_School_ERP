import { Router } from 'express';
import { getStaff, createStaff, deleteStaff, updateStaff, bulkImportStaff } from '../controllers/staffController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getStaff);
router.post('/', createStaff);
router.post('/import', bulkImportStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
