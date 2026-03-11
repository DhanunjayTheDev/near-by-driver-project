const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const RideStatusLog = require('../models/RideStatusLog');
const Rating = require('../models/Rating');
const { findNearbyDrivers } = require('../services/driverMatchingService');
const { calculateFare, processPayment } = require('../services/paymentService');
const { startWaitingTimer, stopWaitingTimer } = require('../services/waitingTimerService');
const { createNotification, sendPushNotification } = require('../services/notificationService');
const generateOTP = require('../utils/generateOTP');
const crypto = require('crypto');

const logStatusChange = async (rideId, status, updatedBy) => {
  await RideStatusLog.create({ ride_id: rideId, status, updated_by: updatedBy });
};

// ── User: Request Ride ──

exports.requestRide = async (req, res) => {
  try {
    const {
      pickup_location, drop_location, city_id,
      estimated_distance, estimated_duration, vehicle_type,
    } = req.body;

    if (!pickup_location?.coordinates || !drop_location?.coordinates) {
      return res.status(400).json({ success: false, message: 'Pickup and drop locations are required' });
    }

    const fareEstimate = await calculateFare(
      vehicle_type || 'SEDAN',
      estimated_distance || 0,
      estimated_duration || 0
    );

    const ride = await Ride.create({
      ride_code: 'RD' + crypto.randomInt(100000, 999999),
      user_id: req.user._id,
      city_id,
      pickup_location: { type: 'Point', coordinates: pickup_location.coordinates, address: pickup_location.address },
      drop_location: { type: 'Point', coordinates: drop_location.coordinates, address: drop_location.address },
      ride_otp: generateOTP(4),
      estimated_distance,
      estimated_duration,
      base_fare: fareEstimate.base_fare,
      distance_fare: fareEstimate.distance_fare,
      total_fare: fareEstimate.total_fare,
    });

    await logStatusChange(ride._id, 'REQUESTED', 'USER');

    // Find nearby drivers
    const nearbyDrivers = await findNearbyDrivers(
      pickup_location.coordinates[0],
      pickup_location.coordinates[1],
      vehicle_type
    );

    // Emit ride request to nearby drivers via socket
    const io = req.app.get('io');
    if (io) {
      nearbyDrivers.forEach((driver) => {
        io.to(`driver_${driver._id}`).emit('ride-request', {
          ride_id: ride._id,
          ride_code: ride.ride_code,
          pickup: ride.pickup_location,
          drop: ride.drop_location,
          estimated_fare: ride.total_fare,
        });
      });
    }

    res.status(201).json({ success: true, ride, nearby_drivers_count: nearbyDrivers.length });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Driver: Accept Ride ──

exports.acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.ride_status !== 'REQUESTED') return res.status(400).json({ success: false, message: 'Ride is no longer available' });

    ride.driver_id = req.driver._id;
    ride.ride_status = 'DRIVER_ASSIGNED';
    await ride.save();

    await Driver.findByIdAndUpdate(req.driver._id, { driver_status: 'ON_RIDE' });
    await logStatusChange(ride._id, 'DRIVER_ASSIGNED', 'DRIVER');

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.user_id}`).emit('ride-accepted', {
        ride_id: ride._id,
        driver_id: req.driver._id,
        driver_name: req.driver.name,
        driver_phone: req.driver.phone,
      });
    }

    await createNotification({
      user_id: ride.user_id,
      user_type: 'User',
      title: 'Driver Assigned',
      message: `${req.driver.name} is on the way to your pickup location`,
      type: 'RIDE',
    });

    res.json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Driver: Arrived ──

exports.driverArrived = async (req, res) => {
  try {
    const ride = await Ride.findOne({ _id: req.params.rideId, driver_id: req.driver._id });
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.ride_status !== 'DRIVER_ASSIGNED') return res.status(400).json({ success: false, message: 'Invalid ride status' });

    ride.ride_status = 'DRIVER_ARRIVED';
    ride.driver_arrived_time = new Date();
    await ride.save();

    await logStatusChange(ride._id, 'DRIVER_ARRIVED', 'DRIVER');
    await startWaitingTimer(ride._id.toString());

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.user_id}`).emit('driver-arrived', { ride_id: ride._id, ride_otp: ride.ride_otp });
    }

    await createNotification({
      user_id: ride.user_id,
      user_type: 'User',
      title: 'Driver Arrived',
      message: `Your driver has arrived. OTP: ${ride.ride_otp}`,
      type: 'RIDE',
    });

    res.json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Driver: Start Ride ──

exports.startRide = async (req, res) => {
  try {
    const { ride_otp } = req.body;
    const ride = await Ride.findOne({ _id: req.params.rideId, driver_id: req.driver._id });
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.ride_status !== 'DRIVER_ARRIVED' && ride.ride_status !== 'WAITING') {
      return res.status(400).json({ success: false, message: 'Invalid ride status' });
    }
    if (ride.ride_otp !== ride_otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    const waitingResult = await stopWaitingTimer(ride._id.toString());

    ride.ride_status = 'RIDE_STARTED';
    ride.ride_start_time = new Date();
    ride.waiting_time_minutes = waitingResult.waiting_time_minutes;
    ride.waiting_charge = waitingResult.waiting_charge;
    await ride.save();

    await logStatusChange(ride._id, 'RIDE_STARTED', 'DRIVER');

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.user_id}`).emit('ride-started', { ride_id: ride._id });
    }

    res.json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Driver: Complete Ride ──

exports.completeRide = async (req, res) => {
  try {
    const { actual_distance, actual_duration } = req.body;
    const ride = await Ride.findOne({ _id: req.params.rideId, driver_id: req.driver._id });
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.ride_status !== 'RIDE_STARTED') return res.status(400).json({ success: false, message: 'Ride not in progress' });

    const Vehicle = require('../models/Vehicle');
    const vehicle = await Vehicle.findById(req.driver.vehicle_id).lean();
    const fareResult = await calculateFare(
      vehicle?.vehicle_type || 'SEDAN',
      actual_distance || ride.estimated_distance,
      actual_duration || ride.estimated_duration,
      ride.waiting_time_minutes
    );

    ride.ride_status = 'RIDE_COMPLETED';
    ride.ride_end_time = new Date();
    ride.actual_distance = actual_distance || ride.estimated_distance;
    ride.actual_duration = actual_duration || ride.estimated_duration;
    ride.base_fare = fareResult.base_fare;
    ride.distance_fare = fareResult.distance_fare;
    ride.waiting_charge = fareResult.waiting_charge;
    ride.total_fare = fareResult.total_fare;
    await ride.save();

    await Driver.findByIdAndUpdate(req.driver._id, { driver_status: 'ONLINE', $inc: { total_rides: 1 } });
    await logStatusChange(ride._id, 'RIDE_COMPLETED', 'DRIVER');

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${ride.user_id}`).emit('ride-completed', {
        ride_id: ride._id,
        total_fare: ride.total_fare,
        actual_distance: ride.actual_distance,
        actual_duration: ride.actual_duration,
      });
    }

    await createNotification({
      user_id: ride.user_id,
      user_type: 'User',
      title: 'Ride Completed',
      message: `Your ride is complete. Total fare: ₹${ride.total_fare}`,
      type: 'RIDE',
    });

    res.json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Cancel Ride ──

exports.cancelRide = async (req, res) => {
  try {
    const { reason } = req.body;
    const cancelledBy = req.user ? 'USER' : 'DRIVER';
    const actorId = req.user?._id || req.driver?._id;

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    const cancellableStatuses = ['REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'WAITING'];
    if (!cancellableStatuses.includes(ride.ride_status)) {
      return res.status(400).json({ success: false, message: 'Ride cannot be cancelled at this stage' });
    }

    ride.ride_status = 'CANCELLED';
    ride.cancellation_reason = reason;
    ride.cancelled_by = cancelledBy;
    await ride.save();

    if (ride.driver_id) {
      await Driver.findByIdAndUpdate(ride.driver_id, { driver_status: 'ONLINE' });
    }

    await logStatusChange(ride._id, 'CANCELLED', cancelledBy);

    const io = req.app.get('io');
    if (io) {
      if (ride.driver_id) io.to(`driver_${ride.driver_id}`).emit('ride-cancelled', { ride_id: ride._id, cancelled_by: cancelledBy });
      io.to(`user_${ride.user_id}`).emit('ride-cancelled', { ride_id: ride._id, cancelled_by: cancelledBy });
    }

    res.json({ success: true, message: 'Ride cancelled', ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Payment ──

exports.payForRide = async (req, res) => {
  try {
    const { payment_method, transaction_id } = req.body;
    const ride = await Ride.findOne({ _id: req.params.rideId, user_id: req.user._id });
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.ride_status !== 'RIDE_COMPLETED') return res.status(400).json({ success: false, message: 'Ride must be completed first' });

    const payment = await processPayment({
      ride_id: ride._id,
      user_id: req.user._id,
      amount: ride.total_fare,
      payment_method: payment_method || 'CASH',
      transaction_id,
    });

    ride.ride_status = 'PAID';
    ride.payment_status = 'COMPLETED';
    await ride.save();

    await logStatusChange(ride._id, 'PAID', 'USER');

    res.json({ success: true, payment, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Rating ──

exports.rateRide = async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });

    const ride = await Ride.findOne({ _id: req.params.rideId, user_id: req.user._id });
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (!['RIDE_COMPLETED', 'PAID'].includes(ride.ride_status)) {
      return res.status(400).json({ success: false, message: 'Can only rate completed rides' });
    }

    const existing = await Rating.findOne({ ride_id: ride._id, user_id: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: 'Ride already rated' });

    const ratingDoc = await Rating.create({
      ride_id: ride._id,
      user_id: req.user._id,
      driver_id: ride.driver_id,
      rating,
      review,
    });

    // Update driver average rating
    const avgResult = await Rating.aggregate([
      { $match: { driver_id: ride.driver_id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    if (avgResult.length > 0) {
      await Driver.findByIdAndUpdate(ride.driver_id, { rating: parseFloat(avgResult[0].avgRating.toFixed(2)) });
    }

    res.status(201).json({ success: true, rating: ratingDoc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Get Ride Details ──

exports.getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('user_id', 'name phone profile_image')
      .populate('driver_id', 'name phone profile_image rating vehicle_id')
      .lean();
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get User Ride History ──

exports.getUserRides = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const rides = await Ride.find({ user_id: req.user._id })
      .populate('driver_id', 'name phone rating')
      .sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await Ride.countDocuments({ user_id: req.user._id });

    res.json({ success: true, rides, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Driver Ride History ──

exports.getDriverRides = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const rides = await Ride.find({ driver_id: req.driver._id })
      .populate('user_id', 'name phone')
      .sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await Ride.countDocuments({ driver_id: req.driver._id });

    res.json({ success: true, rides, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Ride Status Logs ──

exports.getRideStatusLogs = async (req, res) => {
  try {
    const logs = await RideStatusLog.find({ ride_id: req.params.rideId }).sort({ timestamp: 1 }).lean();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Nearby Drivers (User) ──

exports.getNearbyDrivers = async (req, res) => {
  try {
    const { longitude, latitude, vehicle_type } = req.query;
    if (!longitude || !latitude) return res.status(400).json({ success: false, message: 'Longitude and latitude are required' });

    const drivers = await findNearbyDrivers(parseFloat(longitude), parseFloat(latitude), vehicle_type);
    res.json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Fare Estimate ──

exports.getFareEstimate = async (req, res) => {
  try {
    const { vehicle_type, distance, duration } = req.query;
    if (!vehicle_type || !distance) return res.status(400).json({ success: false, message: 'Vehicle type and distance are required' });

    const fare = await calculateFare(vehicle_type, parseFloat(distance), parseFloat(duration) || 0);
    res.json({ success: true, fare });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
