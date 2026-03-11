const redis = require('../config/redis');
const PricingConfig = require('../models/PricingConfig');

const startWaitingTimer = async (rideId) => {
  const now = Date.now();
  await redis.set(`waiting:${rideId}`, now.toString());
  return { started_at: new Date(now) };
};

const stopWaitingTimer = async (rideId, rideType = 'SEDAN') => {
  const startedAt = await redis.get(`waiting:${rideId}`);
  if (!startedAt) return { waiting_time_minutes: 0, waiting_charge: 0 };

  const elapsedMinutes = (Date.now() - parseInt(startedAt, 10)) / 60000;
  await redis.del(`waiting:${rideId}`);

  const pricing = await PricingConfig.findOne({ ride_type: rideType }).lean();
  const freeMinutes = pricing?.free_waiting_minutes || 3;
  const chargePerMin = pricing?.waiting_charge_per_minute || 2;

  const billableMinutes = Math.max(0, Math.ceil(elapsedMinutes) - freeMinutes);
  const waiting_charge = parseFloat((billableMinutes * chargePerMin).toFixed(2));

  return {
    waiting_time_minutes: parseFloat(elapsedMinutes.toFixed(2)),
    billable_minutes: billableMinutes,
    waiting_charge,
  };
};

module.exports = { startWaitingTimer, stopWaitingTimer };
