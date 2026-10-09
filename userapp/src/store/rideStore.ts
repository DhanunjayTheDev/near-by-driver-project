import {create} from 'zustand';

export interface Location {
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface DriverInfo {
  _id: string;
  name: string;
  phone: string;
  profile_image: string;
  rating: number;
  vehicle: {
    vehicle_type: string;
    brand: string;
    model: string;
    vehicle_number: string;
    vehicle_color: string;
  };
}

export interface DriverLocation {
  longitude: number;
  latitude: number;
  heading: number;
  speed: number;
}

export interface FareBreakdown {
  base_fare: number;
  distance_fare: number;
  time_fare: number;
  waiting_charge: number;
  total_fare: number;
}

export interface Ride {
  _id: string;
  ride_code: string;
  ride_status: string;
  pickup_location: Location;
  drop_location: Location;
  ride_otp: string;
  estimated_distance: number;
  estimated_duration: number;
  actual_distance: number;
  actual_duration: number;
  base_fare: number;
  distance_fare: number;
  waiting_charge: number;
  total_fare: number;
  waiting_time_minutes: number;
  driver_arrived_time: string;
  ride_start_time: string;
  ride_end_time: string;
  driver_id: string;
  payment_status: string;
}

interface RideState {
  currentRide: Ride | null;
  rideStatus: string | null;
  driverInfo: DriverInfo | null;
  driverLocation: DriverLocation | null;
  pickup: Location | null;
  drop: Location | null;
  selectedVehicleType: string | null;
  fareEstimate: FareBreakdown | null;
  rideOtp: string | null;
  waitingTimer: number; // seconds
  nearbyDrivers: any[];

  setPickup: (location: Location) => void;
  setDrop: (location: Location) => void;
  setSelectedVehicleType: (type: string) => void;
  setFareEstimate: (fare: FareBreakdown) => void;
  setCurrentRide: (ride: Ride) => void;
  setRideStatus: (status: string) => void;
  setDriverInfo: (driver: DriverInfo) => void;
  setDriverLocation: (location: DriverLocation) => void;
  setRideOtp: (otp: string) => void;
  setWaitingTimer: (seconds: number) => void;
  setNearbyDrivers: (drivers: any[]) => void;
  resetRide: () => void;
}

export const useRideStore = create<RideState>(set => ({
  currentRide: null,
  rideStatus: null,
  driverInfo: null,
  driverLocation: null,
  pickup: null,
  drop: null,
  selectedVehicleType: null,
  fareEstimate: null,
  rideOtp: null,
  waitingTimer: 0,
  nearbyDrivers: [],

  setPickup: (location: Location) => set({pickup: location}),
  setDrop: (location: Location) => set({drop: location}),
  setSelectedVehicleType: (type: string) => set({selectedVehicleType: type}),
  setFareEstimate: (fare: FareBreakdown) => set({fareEstimate: fare}),
  setCurrentRide: (ride: Ride) =>
    set({currentRide: ride, rideStatus: ride.ride_status}),
  setRideStatus: (status: string) => set({rideStatus: status}),
  setDriverInfo: (driver: DriverInfo) => set({driverInfo: driver}),
  setDriverLocation: (location: DriverLocation) =>
    set({driverLocation: location}),
  setRideOtp: (otp: string) => set({rideOtp: otp}),
  setWaitingTimer: (seconds: number) => set({waitingTimer: seconds}),
  setNearbyDrivers: (drivers: any[]) => set({nearbyDrivers: drivers}),
  resetRide: () =>
    set({
      currentRide: null,
      rideStatus: null,
      driverInfo: null,
      driverLocation: null,
      pickup: null,
      drop: null,
      selectedVehicleType: null,
      fareEstimate: null,
      rideOtp: null,
      waitingTimer: 0,
      nearbyDrivers: [],
    }),
}));
