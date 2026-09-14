import { Router } from 'express';
import { getStudyMaterials, createStudyMaterial, deleteStudyMaterial } from '../controllers/studyMaterialController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getStudyMaterials);
router.post('/', createStudyMaterial);
router.delete('/:id', deleteStudyMaterial);

export default router;
