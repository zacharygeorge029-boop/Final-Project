const router = require('express').Router();
const {
  createInquiry,
  getAllInquiries,
  getMyInquiries,
  getInquiriesByUser,
  markAsRead,
  replyToInquiry,
  deleteInquiry,
} = require('../controllers/inquiryController');
const { protect, verifyAdmin } = require('../middleware/auth');

router.post('/', createInquiry);
router.get('/my-inquiries', protect, getMyInquiries);
router.get('/user/:userId', getInquiriesByUser);
router.get('/', verifyAdmin, getAllInquiries);
router.patch('/:id/read', verifyAdmin, markAsRead);
router.post('/:id/reply', verifyAdmin, replyToInquiry);
router.delete('/:id', verifyAdmin, deleteInquiry);

module.exports = router;
