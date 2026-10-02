import express from 'express';
import {
  getUsers,
  deleteUser,
  updateUserRole,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.route('/').get(getUsers);
router.route('/:id').delete(deleteUser);
router.route('/:id/role').put(updateUserRole);

export default router;
