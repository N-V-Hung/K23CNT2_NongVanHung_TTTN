import { Router } from 'express';
import { body } from 'express-validator';
import * as twoFactorController from '../controllers/twoFactorController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/status', twoFactorController.getStatus);
router.post('/setup', twoFactorController.setup2FA);

router.post(
  '/verify',
  [body('token').isLength({ min: 6, max: 6 }).withMessage('Mã phải 6 chữ số')],
  validate,
  twoFactorController.verify2FA
);

router.post(
  '/disable',
  [body('password').notEmpty().withMessage('Nhập mật khẩu')],
  validate,
  twoFactorController.disable2FA
);

export default router;