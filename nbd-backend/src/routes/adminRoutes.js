const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/block', adminController.blockUser);

// Drivers
router.get('/drivers', adminController.getAllDrivers);
router.get('/drivers/:id', adminController.getDriverById);
router.put('/drivers/:id', adminController.updateDriver);
router.put('/drivers/:id/suspend', adminController.suspendDriver);

// KYC
router.get('/kyc/pending', adminController.getPendingKYC);
router.put('/kyc/:kycId/verify', adminController.verifyKYC);

// Rides
router.get('/rides', adminController.getAllRides);
router.get('/rides/:id', adminController.getRideById);

// Pricing
router.get('/pricing', adminController.getAllPricing);
router.post('/pricing', authorizeRoles('SUPER_ADMIN', 'ADMIN'), adminController.upsertPricing);

// Cities
router.get('/cities', adminController.getAllCities);
router.post('/cities', adminController.createCity);
router.put('/cities/:id', adminController.updateCity);
router.delete('/cities/:id', authorizeRoles('SUPER_ADMIN'), adminController.deleteCity);

// Support Tickets
router.get('/support-tickets', adminController.getAllTickets);
router.put('/support-tickets/:id', adminController.updateTicketStatus);

// Payments
router.get('/payments', adminController.getAllPayments);

// Audit Logs
router.get('/audit-logs', authorizeRoles('SUPER_ADMIN'), adminController.getAuditLogs);

module.exports = router;
