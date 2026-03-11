const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Driver = require('../models/Driver');
const AdminUser = require('../models/AdminUser');
const DriverWallet = require('../models/DriverWallet');
const { sendOTP, verifyOTP } = require('../services/otpService');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
};

// ── User Auth ──

exports.userSendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });

    const result = await sendOTP(phone, 'LOGIN');
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.userVerifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required' });

    await verifyOTP(phone, otp);

    let user = await User.findOne({ phone });
    let isNewUser = false;
    if (!user) {
      user = await User.create({ phone });
      isNewUser = true;
    }

    const token = generateToken(user._id, 'user');
    res.json({ success: true, token, user, isNewUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Driver Auth ──

exports.driverSendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });

    const result = await sendOTP(phone, 'LOGIN');
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.driverVerifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required' });

    await verifyOTP(phone, otp);

    let driver = await Driver.findOne({ phone });
    let isNewDriver = false;
    if (!driver) {
      if (!name) return res.status(400).json({ success: false, message: 'Name is required for new drivers' });
      driver = await Driver.create({ phone, name });
      await DriverWallet.create({ driver_id: driver._id });
      isNewDriver = true;
    }

    const token = generateToken(driver._id, 'driver');
    res.json({ success: true, token, driver, isNewDriver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Admin Auth ──

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const admin = await AdminUser.findOne({ email });
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(admin._id, 'admin');
    res.json({ success: true, token, admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields are required' });

    const exists = await AdminUser.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const admin = await AdminUser.create({ name, email, password_hash, role });

    res.status(201).json({ success: true, admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
