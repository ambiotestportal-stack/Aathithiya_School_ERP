import { Router } from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/calendarController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

import { UserRole } from '../models/User';

const router = Router();

// Public route for landing page
router.get('/', getEvents);

// Protected routes for admin
router.post('/', authenticateToken, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN), createEvent);
router.put('/:id', authenticateToken, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN), updateEvent);
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN), deleteEvent);

export default router;
