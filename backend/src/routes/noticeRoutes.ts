import { Router } from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotices);
router.post('/', createNotice);
router.delete('/:id', deleteNotice);

export default router;
