const router = require('express').Router();
const driverController = require('../controllers/driverController');
const { authenticateDriver } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.use(authenticateDriver);

// Profile
router.get('/profile', driverController.getProfile);
router.put('/profile', upload.single('profile_image'), driverController.updateProfile);
router.put('/fcm-token', driverController.updateFCMToken);

// Status
router.put('/go-online', driverController.goOnline);
router.put('/go-offline', driverController.goOffline);

// Location
router.put('/location', driverController.updateLocation);

// Vehicle
router.post('/vehicle', driverController.addVehicle);
router.put('/vehicle', driverController.updateVehicle);
router.get('/vehicle', driverController.getVehicle);

// KYC
router.post('/kyc', upload.fields([
  { name: 'aadhaar_front', maxCount: 1 },
  { name: 'aadhaar_back', maxCount: 1 },
  { name: 'driving_license', maxCount: 1 },
  { name: 'rc', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]), driverController.submitKYC);
router.get('/kyc', driverController.getKYCStatus);

// Wallet & Transactions
router.get('/wallet', driverController.getWallet);
router.get('/transactions', driverController.getTransactions);

// Ratings
router.get('/ratings', driverController.getRatings);

module.exports = router;
