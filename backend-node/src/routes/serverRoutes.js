import { Router } from 'express';
import { body } from 'express-validator';
import * as serverController from '../controllers/serverController.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

// ===== Ai cũng xem được =====
router.get('/count', serverController.getServerCounts);
router.get('/system', serverController.getSystemStats);
router.get('/', serverController.listServers);
router.get('/:id', serverController.getServer);

// ===== Chỉ admin =====
router.post(
  '/',
  requireAdmin,
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Tên server từ 2-50 ký tự'),
    body('ip').matches(/^(\d{1,3}\.){3}\d{1,3}$/).withMessage('IP không hợp lệ'),
    body('cpu').optional().isInt({ min: 0, max: 100 }),
    body('ram').optional().isInt({ min: 0, max: 100 }),
    body('status').optional().isIn(['online', 'warning', 'offline']),
  ],
  validate,
  serverController.createServer
);

router.put(
  '/:id',
  requireAdmin,
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('ip').optional().matches(/^(\d{1,3}\.){3}\d{1,3}$/),
    body('status').optional().isIn(['online', 'warning', 'offline']),
  ],
  validate,
  serverController.updateServer
);

router.delete('/:id', requireAdmin, serverController.deleteServer);
router.post('/:id/restart', requireAdmin, serverController.restartServer);

export default router;