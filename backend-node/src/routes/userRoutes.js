import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', userController.listUsers);
router.patch('/:id/toggle-active', userController.toggleActive);
router.delete('/:id', userController.deleteUser);

export default router;