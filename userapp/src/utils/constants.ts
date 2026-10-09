export const API_BASE_URL = 'http://localhost:5000/api';
export const SOCKET_URL = 'http://localhost:5000';

export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

export const COLORS = {
  primary: '#2563EB',
  secondary: '#0EA5E9',
  accent: '#22C55E',
  background: '#F8FAFC',
  text: '#111827',
  white: '#FFFFFF',
  gray: '#9CA3AF',
  lightGray: '#F3F4F6',
  error: '#EF4444',
} as const;

export const VEHICLE_TYPES = [
  {id: 'BIKE', label: 'Bike', icon: '🏍️', seats: 1},
  {id: 'AUTO', label: 'Auto', icon: '🛺', seats: 3},
  {id: 'MINI', label: 'Mini', icon: '🚗', seats: 4},
  {id: 'SEDAN', label: 'Sedan', icon: '🚘', seats: 4},
  {id: 'SUV', label: 'SUV', icon: '🚙', seats: 6},
] as const;

export const RIDE_STATUS = {
  REQUESTED: 'REQUESTED',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  WAITING: 'WAITING',
  RIDE_STARTED: 'RIDE_STARTED',
  RIDE_COMPLETED: 'RIDE_COMPLETED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;
