const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const DriverKYC = require('../models/DriverKYC');
const Payment = require('../models/Payment');
const PricingConfig = require('../models/PricingConfig');
const City = require('../models/City');
const SupportTicket = require('../models/SupportTicket');
const AuditLog = require('../models/AuditLog');
const AdminUser = require('../models/AdminUser');
const { verifyKYC } = require('../services/kycService');

// ── Dashboard Stats ──

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalDrivers, totalRides, activeRides, totalRevenue] = await Promise.all([
      User.countDocuments(),
      Driver.countDocuments(),
      Ride.countDocuments(),
      Ride.countDocuments({ ride_status: { $in: ['REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'RIDE_STARTED'] } }),
      Payment.aggregate([{ $match: { payment_status: 'COMPLETED' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        totalRides,
        activeRides,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Users CRUD ──

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

    const users = await User.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await AuditLog.create({ admin_id: req.admin._id, action: 'UPDATE_USER', target_id: user._id });
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'BLOCKED' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await AuditLog.create({ admin_id: req.admin._id, action: 'BLOCK_USER', target_id: user._id });
    res.json({ success: true, message: 'User blocked', user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Drivers CRUD ──

exports.getAllDrivers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.approval_status) filter.approval_status = req.query.approval_status;
    if (req.query.driver_status) filter.driver_status = req.query.driver_status;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

    const drivers = await Driver.find(filter).populate('vehicle_id').populate('city_id')
      .sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await Driver.countDocuments(filter);
    res.json({ success: true, drivers, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('vehicle_id').populate('city_id');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    const kyc = await DriverKYC.findOne({ driver_id: driver._id });
    res.json({ success: true, driver, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    await AuditLog.create({ admin_id: req.admin._id, action: 'UPDATE_DRIVER', target_id: driver._id });
    res.json({ success: true, driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.suspendDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, { approval_status: 'SUSPENDED', driver_status: 'OFFLINE' }, { new: true });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    await AuditLog.create({ admin_id: req.admin._id, action: 'SUSPEND_DRIVER', target_id: driver._id });
    res.json({ success: true, message: 'Driver suspended', driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── KYC Verification ──

exports.getPendingKYC = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const kycs = await DriverKYC.find({ verification_status: 'PENDING' })
      .populate('driver_id', 'name phone').sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await DriverKYC.countDocuments({ verification_status: 'PENDING' });
    res.json({ success: true, kycs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyKYC = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be VERIFIED or REJECTED' });
    }
    const kyc = await verifyKYC(req.params.kycId, req.admin._id, status);
    res.json({ success: true, kyc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Rides ──

exports.getAllRides = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.ride_status) filter.ride_status = req.query.ride_status;

    const rides = await Ride.find(filter)
      .populate('user_id', 'name phone')
      .populate('driver_id', 'name phone')
      .sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await Ride.countDocuments(filter);
    res.json({ success: true, rides, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('user_id', 'name phone')
      .populate('driver_id', 'name phone rating');
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    const RideStatusLog = require('../models/RideStatusLog');
    const logs = await RideStatusLog.find({ ride_id: ride._id }).sort({ timestamp: 1 }).lean();
    res.json({ success: true, ride, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Pricing ──

exports.getAllPricing = async (req, res) => {
  try {
    const configs = await PricingConfig.find().lean();
    res.json({ success: true, configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.upsertPricing = async (req, res) => {
  try {
    const { ride_type, base_fare, per_km_charge, per_minute_charge, free_waiting_minutes, waiting_charge_per_minute, commission_percentage } = req.body;
    if (!ride_type) return res.status(400).json({ success: false, message: 'Ride type is required' });

    const config = await PricingConfig.findOneAndUpdate(
      { ride_type },
      { base_fare, per_km_charge, per_minute_charge, free_waiting_minutes, waiting_charge_per_minute, commission_percentage, updated_at: new Date() },
      { new: true, upsert: true, runValidators: true }
    );
    await AuditLog.create({ admin_id: req.admin._id, action: 'UPDATE_PRICING', target_id: config._id });
    res.json({ success: true, config });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Cities CRUD ──

exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ city_name: 1 }).lean();
    res.json({ success: true, cities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCity = async (req, res) => {
  try {
    const { city_name } = req.body;
    if (!city_name) return res.status(400).json({ success: false, message: 'City name is required' });
    const city = await City.create({ city_name });
    await AuditLog.create({ admin_id: req.admin._id, action: 'CREATE_CITY', target_id: city._id });
    res.status(201).json({ success: true, city });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'City already exists' });
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });
    await AuditLog.create({ admin_id: req.admin._id, action: 'UPDATE_CITY', target_id: city._id });
    res.json({ success: true, city });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });
    await AuditLog.create({ admin_id: req.admin._id, action: 'DELETE_CITY', target_id: city._id });
    res.json({ success: true, message: 'City deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Support Tickets ──

exports.getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const tickets = await SupportTicket.find(filter)
      .populate('user_id', 'name phone')
      .populate('ride_id', 'ride_code')
      .sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await SupportTicket.countDocuments(filter);
    res.json({ success: true, tickets, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    await AuditLog.create({ admin_id: req.admin._id, action: 'UPDATE_TICKET', target_id: ticket._id });
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Audit Logs ──

exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate('admin_id', 'name email')
      .sort({ timestamp: -1 }).skip(skip).limit(limit).lean();
    const total = await AuditLog.countDocuments();
    res.json({ success: true, logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Payments ──

exports.getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.payment_status) filter.payment_status = req.query.payment_status;

    const payments = await Payment.find(filter)
      .populate('user_id', 'name phone')
      .populate('ride_id', 'ride_code')
      .sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await Payment.countDocuments(filter);
    res.json({ success: true, payments, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
