import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username phải từ 3-50 ký tự'),
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username không được để trống'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
  ],
  validate,
  authController.login
);

router.get('/me', requireAuth, authController.getMe);

export default router;