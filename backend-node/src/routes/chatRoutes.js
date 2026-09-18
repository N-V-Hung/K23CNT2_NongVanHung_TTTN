import { Router } from 'express';
import { body } from 'express-validator';
import * as chatController from '../controllers/chatController.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  [body('message').trim().isLength({ min: 1, max: 5000 }).withMessage('Tin nhắn phải từ 1-5000 ký tự')],
  validate,
  chatController.sendMessage
);

router.get('/history', chatController.getHistory);
router.delete('/history', chatController.clearHistory);

export default router;