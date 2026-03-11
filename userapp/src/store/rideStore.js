import { create } from 'zustand';
import {
  requestRide,
  cancelRide,
  payForRide,
  rateRide,
  getRideDetails,
  getFareEstimate,
} from '../services/apiService';
import socketService from '../services/socketService';

const useRideStore = create((set, get) => ({
  // Locations
  pickup: null,
  drop: null,
  pickupAddress: '',
  dropAddress: '',

  // Ride state
  currentRide: null,
  rideStatus: null,
  rideOtp: null,

  // Driver
  assignedDriver: null,
  driverLocation: null,

  // Fare
  fareEstimates: [],
  selectedVehicleType: null,

  // Waiting
  waitingTime: 0,
  waitingCharge: 0,
  freeWaitingOver: false,

  // UI
  isSearching: false,

  setPickup: (pickup, address) => set({ pickup, pickupAddress: address }),
  setDrop: (drop, address) => set({ drop, dropAddress: address }),
  setSelectedVehicleType: (type) => set({ selectedVehicleType: type }),

  fetchFareEstimates: async (distance, duration) => {
    const types = ['BIKE', 'AUTO', 'MINI', 'SEDAN', 'SUV'];
    const estimates = [];
    for (const type of types) {
      try {
        const data = await getFareEstimate(type, distance, duration);
        estimates.push({ vehicle_type: type, ...data.fare });
      } catch {
        // skip unavailable types
      }
    }
    set({ fareEstimates: estimates });
  },

  requestRide: async (cityId, distance, duration) => {
    const { pickup, drop, pickupAddress, dropAddress, selectedVehicleType } = get();
    if (!pickup || !drop || !selectedVehicleType) return;

    set({ isSearching: true });
    const data = await requestRide({
      pickup_location: {
        coordinates: [pickup.longitude, pickup.latitude],
        address: pickupAddress,
      },
      drop_location: {
        coordinates: [drop.longitude, drop.latitude],
        address: dropAddress,
      },
      city_id: cityId,
      estimated_distance: distance,
      estimated_duration: duration,
      vehicle_type: selectedVehicleType,
    });

    set({
      currentRide: data.ride,
      rideStatus: data.ride.ride_status,
      rideOtp: data.ride.ride_otp,
    });

    return data;
  },

  cancelCurrentRide: async (reason) => {
    const { currentRide } = get();
    if (!currentRide) return;
    await cancelRide(currentRide._id, reason);
    get().resetRide();
  },

  payForCurrentRide: async (paymentData) => {
    const { currentRide } = get();
    if (!currentRide) return;
    const data = await payForRide(currentRide._id, paymentData);
    set({ currentRide: { ...get().currentRide, ...data.ride }, rideStatus: 'PAID' });
    return data;
  },

  rateCurrentRide: async (rating, review) => {
    const { currentRide } = get();
    if (!currentRide) return;
    const data = await rateRide(currentRide._id, { rating, review });
    return data;
  },

  refreshRide: async () => {
    const { currentRide } = get();
    if (!currentRide) return;
    const data = await getRideDetails(currentRide._id);
    set({ currentRide: data.ride, rideStatus: data.ride.ride_status });
  },

  // Socket event handlers
  onRideAccepted: (data) => {
    set({
      rideStatus: 'DRIVER_ASSIGNED',
      assignedDriver: {
        id: data.driver_id,
        name: data.driver_name,
        phone: data.driver_phone,
      },
      isSearching: false,
    });
    socketService.trackDriver(data.driver_id);
  },

  onDriverArrived: (data) => {
    set({ rideStatus: 'DRIVER_ARRIVED', rideOtp: data.ride_otp });
  },

  onRideStarted: () => {
    set({ rideStatus: 'RIDE_STARTED' });
  },

  onRideCompleted: (data) => {
    set({
      rideStatus: 'RIDE_COMPLETED',
      currentRide: {
        ...get().currentRide,
        total_fare: data.total_fare,
        actual_distance: data.actual_distance,
        actual_duration: data.actual_duration,
      },
    });
    if (get().assignedDriver?.id) {
      socketService.stopTracking(get().assignedDriver.id);
    }
  },

  onRideCancelled: () => {
    if (get().assignedDriver?.id) {
      socketService.stopTracking(get().assignedDriver.id);
    }
    get().resetRide();
  },

  onDriverLocation: (data) => {
    set({
      driverLocation: {
        latitude: data.location?.latitude || data.location?.coordinates?.[1],
        longitude: data.location?.longitude || data.location?.coordinates?.[0],
        heading: data.heading,
        speed: data.speed,
      },
    });
  },

  updateWaitingTimer: (seconds, charge, freeOver) => {
    set({ waitingTime: seconds, waitingCharge: charge, freeWaitingOver: freeOver });
  },

  resetRide: () =>
    set({
      currentRide: null,
      rideStatus: null,
      rideOtp: null,
      assignedDriver: null,
      driverLocation: null,
      fareEstimates: [],
      selectedVehicleType: null,
      waitingTime: 0,
      waitingCharge: 0,
      freeWaitingOver: false,
      isSearching: false,
      pickup: null,
      drop: null,
      pickupAddress: '',
      dropAddress: '',
    }),
}));

export default useRideStore;
