const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticateAdmin, authorizeRoles } = require('../middlewares/authMiddleware');

// User Auth
router.post('/user/send-otp', authController.userSendOTP);
router.post('/user/verify-otp', authController.userVerifyOTP);

// Driver Auth
router.post('/driver/send-otp', authController.driverSendOTP);
router.post('/driver/verify-otp', authController.driverVerifyOTP);

// Admin Auth
router.post('/admin/login', authController.adminLogin);
router.post('/admin/register', authenticateAdmin, authorizeRoles('SUPER_ADMIN'), authController.adminRegister);

module.exports = router;
