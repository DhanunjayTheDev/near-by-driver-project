const Payment = require('../models/Payment');
const DriverWallet = require('../models/DriverWallet');
const DriverTransaction = require('../models/DriverTransaction');
const PricingConfig = require('../models/PricingConfig');
const Ride = require('../models/Ride');

const calculateFare = async (rideType, distanceKm, durationMinutes, waitingMinutes = 0) => {
  const pricing = await PricingConfig.findOne({ ride_type: rideType }).lean();
  if (!pricing) throw new Error('Pricing config not found for ride type: ' + rideType);

  const base_fare = pricing.base_fare;
  const distance_fare = parseFloat((distanceKm * pricing.per_km_charge).toFixed(2));
  const time_fare = parseFloat((durationMinutes * pricing.per_minute_charge).toFixed(2));

  const freeWaiting = pricing.free_waiting_minutes || 3;
  const billableWaiting = Math.max(0, waitingMinutes - freeWaiting);
  const waiting_charge = parseFloat((billableWaiting * pricing.waiting_charge_per_minute).toFixed(2));

  const total_fare = parseFloat((base_fare + distance_fare + time_fare + waiting_charge).toFixed(2));

  return { base_fare, distance_fare, time_fare, waiting_charge, total_fare, commission_percentage: pricing.commission_percentage };
};

const processPayment = async ({ ride_id, user_id, amount, payment_method, transaction_id = null }) => {
  const payment = await Payment.create({
    ride_id,
    user_id,
    amount,
    payment_method,
    payment_gateway: payment_method === 'CASH' ? null : 'RAZORPAY',
    transaction_id,
    payment_status: payment_method === 'CASH' ? 'COMPLETED' : 'PENDING',
  });

  if (payment.payment_status === 'COMPLETED') {
    await creditDriverWallet(ride_id, amount);
  }

  return payment;
};

const creditDriverWallet = async (rideId, totalAmount) => {
  const ride = await Ride.findById(rideId).populate('driver_id').lean();
  if (!ride || !ride.driver_id) return;

  const Vehicle = require('../models/Vehicle');
  const vehicle = await Vehicle.findById(ride.driver_id.vehicle_id).lean();
  const pricing = await PricingConfig.findOne({ ride_type: vehicle?.vehicle_type || 'SEDAN' }).lean();
  const commissionPct = pricing?.commission_percentage || 20;

  const commission = parseFloat(((totalAmount * commissionPct) / 100).toFixed(2));
  const driverAmount = parseFloat((totalAmount - commission).toFixed(2));

  await DriverWallet.findOneAndUpdate(
    { driver_id: ride.driver_id._id },
    { $inc: { wallet_balance: driverAmount }, updated_at: new Date() },
    { upsert: true }
  );

  await DriverTransaction.create({
    driver_id: ride.driver_id._id,
    ride_id: rideId,
    amount: driverAmount,
    commission,
    type: 'CREDIT',
  });
};

module.exports = { calculateFare, processPayment, creditDriverWallet };
