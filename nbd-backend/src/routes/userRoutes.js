const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.use(authenticateUser);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', upload.single('profile_image'), userController.updateProfile);
router.put('/fcm-token', userController.updateFCMToken);

// Notifications
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:id/read', userController.markNotificationRead);
router.put('/notifications/read-all', userController.markAllNotificationsRead);

// Support Tickets
router.post('/support-tickets', userController.createSupportTicket);
router.get('/support-tickets', userController.getUserTickets);

module.exports = router;
