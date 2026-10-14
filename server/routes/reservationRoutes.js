const router = require('express').Router();
const { getReservations, createReservation, cancelReservation, processRefund } = require('../controllers/reservationController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/my-reservations', verifyToken, getReservations);
router.get('/', verifyToken, getReservations);
router.post('/', verifyToken, createReservation);
router.put('/:id/cancel', verifyToken, cancelReservation);
router.patch('/:id/refund', verifyAdmin, processRefund);

module.exports = router;