const router = require('express').Router();
const {
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  deleteUser,
} = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/users', verifyAdmin, getAllUsers);
router.put('/users/:id/role', verifyAdmin, updateUserRole);
router.put('/users/:id/toggle-active', verifyAdmin, toggleUserActive);
router.delete('/users/:id', verifyAdmin, deleteUser);

module.exports = router;
