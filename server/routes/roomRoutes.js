const router = require('express').Router();
const { getAllRooms, createRoom, updateRoom, deleteRoom, restoreDefaults } = require('../controllers/roomController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', getAllRooms);
router.post('/restore-defaults', verifyAdmin, restoreDefaults);
router.post('/', verifyAdmin, createRoom);
router.put('/:id', verifyAdmin, updateRoom);
router.delete('/:id', verifyAdmin, deleteRoom);

module.exports = router;
