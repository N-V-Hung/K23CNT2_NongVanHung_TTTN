import { Router } from 'express';
import { body } from 'express-validator';
import * as profileController from '../controllers/profileController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { uploadAvatar } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(requireAuth);

router.put(
  '/',
  [
    body('email').optional().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('fullName').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  profileController.updateProfile
);

router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Nhập mật khẩu hiện tại'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'),
  ],
  validate,
  profileController.changePassword
);

router.post('/avatar', uploadAvatar, profileController.uploadAvatar);
router.delete('/avatar', profileController.deleteAvatar);

export default router;
