import { Router } from 'express';
import { getBooks, createBook, deleteBook, getIssuedBooks, issueBook, returnBook } from '../controllers/libraryController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/issues', getIssuedBooks);
router.post('/issues', issueBook);
router.put('/issues/:issueId/return', returnBook);

router.get('/', getBooks);
router.post('/', createBook);
router.delete('/:id', deleteBook);

export default router;
