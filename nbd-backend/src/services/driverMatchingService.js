const DriverLocation = require('../models/DriverLocation');
const Driver = require('../models/Driver');

const SEARCH_RADIUS_KM = 5;

const findNearbyDrivers = async (longitude, latitude, vehicleType = null, limit = 10) => {
  const query = {
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: SEARCH_RADIUS_KM * 1000,
      },
    },
  };

  const driverLocations = await DriverLocation.find(query).limit(limit * 2).lean();
  const driverIds = driverLocations.map((dl) => dl.driver_id);

  const driverFilter = {
    _id: { $in: driverIds },
    driver_status: 'ONLINE',
    approval_status: 'APPROVED',
  };

  if (vehicleType) {
    const Driver = require('../models/Driver');
    const Vehicle = require('../models/Vehicle');
    const vehicles = await Vehicle.find({ vehicle_type: vehicleType, driver_id: { $in: driverIds } }).select('driver_id').lean();
    driverFilter._id = { $in: vehicles.map((v) => v.driver_id) };
  }

  const availableDrivers = await Driver.find(driverFilter)
    .select('name phone rating total_rides current_location vehicle_id')
    .populate('vehicle_id', 'vehicle_type brand model vehicle_number vehicle_color')
    .limit(limit)
    .lean();

  return availableDrivers.map((driver) => {
    const loc = driverLocations.find((dl) => dl.driver_id.toString() === driver._id.toString());
    return {
      ...driver,
      distance_location: loc?.location,
    };
  });
};

module.exports = { findNearbyDrivers };
