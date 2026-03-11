const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const DriverLocation = require('../models/DriverLocation');
const DriverWallet = require('../models/DriverWallet');
const DriverTransaction = require('../models/DriverTransaction');
const Rating = require('../models/Rating');
const { submitKYC, getKYCByDriver } = require('../services/kycService');

// ── Profile ──

exports.getProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id).populate('vehicle_id').populate('city_id');
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'city_id'];
    const updates = {};
    allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    if (req.file) updates.profile_image = req.file.path;

    const driver = await Driver.findByIdAndUpdate(req.driver._id, updates, { new: true, runValidators: true });
    res.json({ success: true, driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateFCMToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    await Driver.findByIdAndUpdate(req.driver._id, { fcm_token });
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Status ──

exports.goOnline = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id);
    if (driver.approval_status !== 'APPROVED') {
      return res.status(403).json({ success: false, message: 'Driver not approved yet' });
    }
    driver.driver_status = 'ONLINE';
    await driver.save();
    res.json({ success: true, message: 'Driver is now online', driver_status: 'ONLINE' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.goOffline = async (req, res) => {
  try {
    await Driver.findByIdAndUpdate(req.driver._id, { driver_status: 'OFFLINE' });
    res.json({ success: true, message: 'Driver is now offline', driver_status: 'OFFLINE' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Location ──

exports.updateLocation = async (req, res) => {
  try {
    const { longitude, latitude, heading, speed } = req.body;
    if (longitude == null || latitude == null) {
      return res.status(400).json({ success: false, message: 'Longitude and latitude are required' });
    }

    await DriverLocation.findOneAndUpdate(
      { driver_id: req.driver._id },
      {
        location: { type: 'Point', coordinates: [longitude, latitude] },
        heading: heading || 0,
        speed: speed || 0,
        updated_at: new Date(),
      },
      { upsert: true }
    );

    await Driver.findByIdAndUpdate(req.driver._id, {
      current_location: { type: 'Point', coordinates: [longitude, latitude] },
    });

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Vehicle ──

exports.addVehicle = async (req, res) => {
  try {
    const { vehicle_type, brand, model, vehicle_number, vehicle_color, vehicle_year } = req.body;
    if (!vehicle_type || !brand || !model || !vehicle_number) {
      return res.status(400).json({ success: false, message: 'Vehicle type, brand, model, and number are required' });
    }

    const vehicle = await Vehicle.create({
      driver_id: req.driver._id, vehicle_type, brand, model, vehicle_number, vehicle_color, vehicle_year,
    });

    await Driver.findByIdAndUpdate(req.driver._id, { vehicle_id: vehicle._id });
    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Vehicle number already registered' });
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const allowed = ['vehicle_type', 'brand', 'model', 'vehicle_number', 'vehicle_color', 'vehicle_year'];
    const updates = {};
    allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const vehicle = await Vehicle.findOneAndUpdate(
      { driver_id: req.driver._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ driver_id: req.driver._id }).lean();
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── KYC ──

exports.submitKYC = async (req, res) => {
  try {
    const files = req.files || {};
    const kycData = {
      aadhaar_number: req.body.aadhaar_number,
      aadhaar_front_image: files.aadhaar_front?.[0]?.path,
      aadhaar_back_image: files.aadhaar_back?.[0]?.path,
      driving_license_number: req.body.driving_license_number,
      driving_license_image: files.driving_license?.[0]?.path,
      rc_number: req.body.rc_number,
      rc_image: files.rc?.[0]?.path,
      selfie_with_vehicle: files.selfie?.[0]?.path,
    };

    const kyc = await submitKYC(req.driver._id, kycData);
    res.status(201).json({ success: true, kyc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await getKYCByDriver(req.driver._id);
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC not submitted' });
    res.json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Wallet ──

exports.getWallet = async (req, res) => {
  try {
    let wallet = await DriverWallet.findOne({ driver_id: req.driver._id });
    if (!wallet) wallet = await DriverWallet.create({ driver_id: req.driver._id });
    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const transactions = await DriverTransaction.find({ driver_id: req.driver._id })
      .sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await DriverTransaction.countDocuments({ driver_id: req.driver._id });

    res.json({ success: true, transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Ratings ──

exports.getRatings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ driver_id: req.driver._id })
      .populate('user_id', 'name')
      .sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await Rating.countDocuments({ driver_id: req.driver._id });

    res.json({ success: true, ratings, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
