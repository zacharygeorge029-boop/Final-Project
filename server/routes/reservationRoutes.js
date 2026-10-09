const router = require('express').Router();
const { getReservations, createReservation, cancelReservation } = require('../controllers/reservationController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getReservations);
router.post('/', verifyToken, createReservation);
router.put('/:id/cancel', verifyToken, cancelReservation);

module.exports = router;