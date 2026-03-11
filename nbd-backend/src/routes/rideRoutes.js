const router = require('express').Router();
const rideController = require('../controllers/rideController');
const { authenticateUser, authenticateDriver } = require('../middlewares/authMiddleware');

// ── User Routes ──
router.post('/request', authenticateUser, rideController.requestRide);
router.post('/:rideId/pay', authenticateUser, rideController.payForRide);
router.post('/:rideId/rate', authenticateUser, rideController.rateRide);
router.post('/:rideId/cancel', authenticateUser, rideController.cancelRide);
router.get('/user/history', authenticateUser, rideController.getUserRides);
router.get('/nearby-drivers', authenticateUser, rideController.getNearbyDrivers);
router.get('/fare-estimate', authenticateUser, rideController.getFareEstimate);

// ── Driver Routes ──
router.post('/:rideId/accept', authenticateDriver, rideController.acceptRide);
router.post('/:rideId/arrived', authenticateDriver, rideController.driverArrived);
router.post('/:rideId/start', authenticateDriver, rideController.startRide);
router.post('/:rideId/complete', authenticateDriver, rideController.completeRide);
router.post('/:rideId/driver-cancel', authenticateDriver, rideController.cancelRide);
router.get('/driver/history', authenticateDriver, rideController.getDriverRides);

// ── Common ──
router.get('/:rideId', rideController.getRide);
router.get('/:rideId/logs', rideController.getRideStatusLogs);

module.exports = router;
