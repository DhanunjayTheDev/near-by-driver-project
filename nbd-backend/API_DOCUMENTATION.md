# NBD Car Ride - API Documentation

**Base URL:** `http://localhost:5000/api`

**Authentication:** Bearer token in `Authorization` header
```
Authorization: Bearer <token>
```

---

## Table of Contents

1. [Auth APIs](#1-auth-apis)
2. [User APIs](#2-user-apis)
3. [Driver APIs](#3-driver-apis)
4. [Ride APIs](#4-ride-apis)
5. [Admin APIs](#5-admin-apis)
6. [Socket.IO Events](#6-socketio-events)

---

## 1. Auth APIs

### 1.1 User Send OTP

```
POST /api/auth/user/send-otp
```

**Payload:**
```json
{
  "phone": "+919876543210"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### 1.2 User Verify OTP

```
POST /api/auth/user/verify-otp
```

**Payload:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "665a...",
    "phone": "+919876543210",
    "name": null,
    "email": null,
    "profile_image": null,
    "status": "ACTIVE",
    "default_payment_method": "CASH",
    "created_at": "2026-03-11T..."
  },
  "isNewUser": true
}
```

---

### 1.3 Driver Send OTP

```
POST /api/auth/driver/send-otp
```

**Payload:**
```json
{
  "phone": "+919876543210"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### 1.4 Driver Verify OTP

```
POST /api/auth/driver/verify-otp
```

**Payload:**
```json
{
  "phone": "+919876543210",
  "otp": "123456",
  "name": "Raju Kumar"
}
```

> `name` is required only for new driver registration.

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "driver": {
    "_id": "665b...",
    "name": "Raju Kumar",
    "phone": "+919876543210",
    "driver_status": "OFFLINE",
    "approval_status": "PENDING",
    "rating": 5.0,
    "total_rides": 0,
    "wallet_balance": 0
  },
  "isNewDriver": true
}
```

---

### 1.5 Admin Login

```
POST /api/auth/admin/login
```

**Payload:**
```json
{
  "email": "admin@nbd.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "_id": "665c...",
    "name": "Super Admin",
    "email": "admin@nbd.com",
    "role": "SUPER_ADMIN"
  }
}
```

---

### 1.6 Admin Register (Super Admin Only)

```
POST /api/auth/admin/register
```

**Headers:** `Authorization: Bearer <admin_token>`

**Payload:**
```json
{
  "name": "Support Agent",
  "email": "support@nbd.com",
  "password": "securepassword123",
  "role": "SUPPORT"
}
```

**Response (201):**
```json
{
  "success": true,
  "admin": {
    "_id": "665d...",
    "name": "Support Agent",
    "email": "support@nbd.com",
    "role": "SUPPORT"
  }
}
```

---

## 2. User APIs

> All User APIs require `Authorization: Bearer <user_token>`

### 2.1 Get Profile

```
GET /api/user/profile
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "665a...",
    "name": "John Doe",
    "phone": "+919876543210",
    "email": "john@example.com",
    "profile_image": "https://res.cloudinary.com/...",
    "status": "ACTIVE",
    "default_payment_method": "CASH"
  }
}
```

---

### 2.2 Update Profile

```
PUT /api/user/profile
```

**Content-Type:** `multipart/form-data`

**Payload:**
| Field | Type | Required |
|-------|------|----------|
| name | string | No |
| email | string | No |
| default_payment_method | string (CASH/UPI/CARD/WALLET) | No |
| profile_image | file (jpg/png/webp) | No |

**Response (200):**
```json
{
  "success": true,
  "user": { "...updated user object..." }
}
```

---

### 2.3 Update FCM Token

```
PUT /api/user/fcm-token
```

**Payload:**
```json
{
  "fcm_token": "firebase_cloud_messaging_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "FCM token updated"
}
```

---

### 2.4 Get Notifications

```
GET /api/user/notifications?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "665e...",
      "title": "Ride Completed",
      "message": "Your ride is complete. Total fare: ₹250",
      "type": "RIDE",
      "is_read": false,
      "created_at": "2026-03-11T..."
    }
  ],
  "total": 15,
  "page": 1,
  "pages": 1
}
```

---

### 2.5 Mark Notification as Read

```
PUT /api/user/notifications/:id/read
```

**Response (200):**
```json
{
  "success": true,
  "notification": { "...notification with is_read: true..." }
}
```

---

### 2.6 Mark All Notifications as Read

```
PUT /api/user/notifications/read-all
```

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 2.7 Create Support Ticket

```
POST /api/user/support-tickets
```

**Payload:**
```json
{
  "ride_id": "665f...",
  "issue_type": "PAYMENT",
  "description": "I was overcharged for the ride"
}
```

> `issue_type` enum: `PAYMENT`, `DRIVER`, `RIDE`, `APP`, `OTHER`

**Response (201):**
```json
{
  "success": true,
  "ticket": {
    "_id": "6660...",
    "user_id": "665a...",
    "ride_id": "665f...",
    "issue_type": "PAYMENT",
    "description": "I was overcharged for the ride",
    "status": "OPEN",
    "created_at": "2026-03-11T..."
  }
}
```

---

### 2.8 Get User Support Tickets

```
GET /api/user/support-tickets
```

**Response (200):**
```json
{
  "success": true,
  "tickets": [ "...array of ticket objects..." ]
}
```

---

## 3. Driver APIs

> All Driver APIs require `Authorization: Bearer <driver_token>`

### 3.1 Get Profile

```
GET /api/driver/profile
```

**Response (200):**
```json
{
  "success": true,
  "driver": {
    "_id": "665b...",
    "name": "Raju Kumar",
    "phone": "+919876543210",
    "profile_image": null,
    "driver_status": "OFFLINE",
    "approval_status": "APPROVED",
    "rating": 4.8,
    "total_rides": 150,
    "wallet_balance": 5000,
    "vehicle_id": {
      "_id": "6661...",
      "vehicle_type": "SEDAN",
      "brand": "Maruti",
      "model": "Swift Dzire",
      "vehicle_number": "TS09AB1234",
      "vehicle_color": "White"
    },
    "city_id": {
      "_id": "6662...",
      "city_name": "Hyderabad"
    }
  }
}
```

---

### 3.2 Update Profile

```
PUT /api/driver/profile
```

**Content-Type:** `multipart/form-data`

**Payload:**
| Field | Type | Required |
|-------|------|----------|
| name | string | No |
| city_id | string (ObjectId) | No |
| profile_image | file (jpg/png/webp) | No |

**Response (200):**
```json
{
  "success": true,
  "driver": { "...updated driver object..." }
}
```

---

### 3.3 Update FCM Token

```
PUT /api/driver/fcm-token
```

**Payload:**
```json
{
  "fcm_token": "firebase_cloud_messaging_token_here"
}
```

---

### 3.4 Go Online

```
PUT /api/driver/go-online
```

**Response (200):**
```json
{
  "success": true,
  "message": "Driver is now online",
  "driver_status": "ONLINE"
}
```

---

### 3.5 Go Offline

```
PUT /api/driver/go-offline
```

**Response (200):**
```json
{
  "success": true,
  "message": "Driver is now offline",
  "driver_status": "OFFLINE"
}
```

---

### 3.6 Update Location

```
PUT /api/driver/location
```

**Payload:**
```json
{
  "longitude": 78.4867,
  "latitude": 17.3850,
  "heading": 180,
  "speed": 45.5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated"
}
```

---

### 3.7 Add Vehicle

```
POST /api/driver/vehicle
```

**Payload:**
```json
{
  "vehicle_type": "SEDAN",
  "brand": "Maruti",
  "model": "Swift Dzire",
  "vehicle_number": "TS09AB1234",
  "vehicle_color": "White",
  "vehicle_year": 2023
}
```

> `vehicle_type` enum: `AUTO`, `MINI`, `SEDAN`, `SUV`, `BIKE`

**Response (201):**
```json
{
  "success": true,
  "vehicle": {
    "_id": "6661...",
    "driver_id": "665b...",
    "vehicle_type": "SEDAN",
    "brand": "Maruti",
    "model": "Swift Dzire",
    "vehicle_number": "TS09AB1234",
    "vehicle_color": "White",
    "vehicle_year": 2023
  }
}
```

---

### 3.8 Update Vehicle

```
PUT /api/driver/vehicle
```

**Payload:**
```json
{
  "vehicle_color": "Silver",
  "vehicle_year": 2024
}
```

---

### 3.9 Get Vehicle

```
GET /api/driver/vehicle
```

---

### 3.10 Submit KYC

```
POST /api/driver/kyc
```

**Content-Type:** `multipart/form-data`

**Payload:**
| Field | Type | Required |
|-------|------|----------|
| aadhaar_number | string | Yes |
| aadhaar_front | file | Yes |
| aadhaar_back | file | Yes |
| driving_license_number | string | Yes |
| driving_license | file | Yes |
| rc_number | string | Yes |
| rc | file | Yes |
| selfie | file | Yes |

**Response (201):**
```json
{
  "success": true,
  "kyc": {
    "_id": "6663...",
    "driver_id": "665b...",
    "aadhaar_number": "1234-5678-9012",
    "verification_status": "PENDING",
    "created_at": "2026-03-11T..."
  }
}
```

---

### 3.11 Get KYC Status

```
GET /api/driver/kyc
```

**Response (200):**
```json
{
  "success": true,
  "kyc": {
    "_id": "6663...",
    "verification_status": "VERIFIED",
    "verified_at": "2026-03-11T..."
  }
}
```

---

### 3.12 Get Wallet

```
GET /api/driver/wallet
```

**Response (200):**
```json
{
  "success": true,
  "wallet": {
    "_id": "6664...",
    "driver_id": "665b...",
    "wallet_balance": 5000,
    "updated_at": "2026-03-11T..."
  }
}
```

---

### 3.13 Get Transactions

```
GET /api/driver/transactions?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "6665...",
      "driver_id": "665b...",
      "ride_id": "665f...",
      "amount": 200,
      "commission": 50,
      "type": "CREDIT",
      "created_at": "2026-03-11T..."
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

---

### 3.14 Get Ratings

```
GET /api/driver/ratings?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "ratings": [
    {
      "_id": "6666...",
      "ride_id": "665f...",
      "user_id": { "_id": "665a...", "name": "John Doe" },
      "rating": 5,
      "review": "Great ride!",
      "created_at": "2026-03-11T..."
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

---

## 4. Ride APIs

### 4.1 Request Ride (User)

```
POST /api/ride/request
```

**Headers:** `Authorization: Bearer <user_token>`

**Payload:**
```json
{
  "pickup_location": {
    "coordinates": [78.4867, 17.3850],
    "address": "Hitech City, Hyderabad"
  },
  "drop_location": {
    "coordinates": [78.3740, 17.4399],
    "address": "Kukatpally, Hyderabad"
  },
  "city_id": "6662...",
  "estimated_distance": 12.5,
  "estimated_duration": 25,
  "vehicle_type": "SEDAN"
}
```

**Response (201):**
```json
{
  "success": true,
  "ride": {
    "_id": "665f...",
    "ride_code": "RD456789",
    "user_id": "665a...",
    "ride_status": "REQUESTED",
    "ride_otp": "4523",
    "pickup_location": { "coordinates": [78.4867, 17.3850], "address": "Hitech City, Hyderabad" },
    "drop_location": { "coordinates": [78.3740, 17.4399], "address": "Kukatpally, Hyderabad" },
    "estimated_distance": 12.5,
    "estimated_duration": 25,
    "base_fare": 50,
    "distance_fare": 150,
    "total_fare": 250,
    "payment_status": "PENDING"
  },
  "nearby_drivers_count": 3
}
```

---

### 4.2 Accept Ride (Driver)

```
POST /api/ride/:rideId/accept
```

**Headers:** `Authorization: Bearer <driver_token>`

**Response (200):**
```json
{
  "success": true,
  "ride": {
    "_id": "665f...",
    "ride_status": "DRIVER_ASSIGNED",
    "driver_id": "665b..."
  }
}
```

---

### 4.3 Driver Arrived

```
POST /api/ride/:rideId/arrived
```

**Headers:** `Authorization: Bearer <driver_token>`

**Response (200):**
```json
{
  "success": true,
  "ride": {
    "_id": "665f...",
    "ride_status": "DRIVER_ARRIVED",
    "driver_arrived_time": "2026-03-11T10:30:00.000Z"
  }
}
```

---

### 4.4 Start Ride (Driver)

```
POST /api/ride/:rideId/start
```

**Headers:** `Authorization: Bearer <driver_token>`

**Payload:**
```json
{
  "ride_otp": "4523"
}
```

**Response (200):**
```json
{
  "success": true,
  "ride": {
    "_id": "665f...",
    "ride_status": "RIDE_STARTED",
    "ride_start_time": "2026-03-11T10:35:00.000Z",
    "waiting_time_minutes": 5.2,
    "waiting_charge": 4.4
  }
}
```

---

### 4.5 Complete Ride (Driver)

```
POST /api/ride/:rideId/complete
```

**Headers:** `Authorization: Bearer <driver_token>`

**Payload:**
```json
{
  "actual_distance": 13.2,
  "actual_duration": 28
}
```

**Response (200):**
```json
{
  "success": true,
  "ride": {
    "_id": "665f...",
    "ride_status": "RIDE_COMPLETED",
    "ride_end_time": "2026-03-11T11:03:00.000Z",
    "actual_distance": 13.2,
    "actual_duration": 28,
    "base_fare": 50,
    "distance_fare": 158.4,
    "waiting_charge": 4.4,
    "total_fare": 262.8
  }
}
```

---

### 4.6 Cancel Ride (User)

```
POST /api/ride/:rideId/cancel
```

**Headers:** `Authorization: Bearer <user_token>`

**Payload:**
```json
{
  "reason": "Driver taking too long"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ride cancelled",
  "ride": {
    "_id": "665f...",
    "ride_status": "CANCELLED",
    "cancelled_by": "USER",
    "cancellation_reason": "Driver taking too long"
  }
}
```

---

### 4.7 Cancel Ride (Driver)

```
POST /api/ride/:rideId/driver-cancel
```

**Headers:** `Authorization: Bearer <driver_token>`

**Payload:**
```json
{
  "reason": "Customer not at pickup location"
}
```

---

### 4.8 Pay for Ride (User)

```
POST /api/ride/:rideId/pay
```

**Headers:** `Authorization: Bearer <user_token>`

**Payload:**
```json
{
  "payment_method": "CASH"
}
```

> For online payment:
```json
{
  "payment_method": "UPI",
  "transaction_id": "razorpay_txn_id_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "payment": {
    "_id": "6667...",
    "ride_id": "665f...",
    "amount": 262.8,
    "payment_method": "CASH",
    "payment_status": "COMPLETED"
  },
  "ride": {
    "ride_status": "PAID",
    "payment_status": "COMPLETED"
  }
}
```

---

### 4.9 Rate Ride (User)

```
POST /api/ride/:rideId/rate
```

**Headers:** `Authorization: Bearer <user_token>`

**Payload:**
```json
{
  "rating": 5,
  "review": "Great ride, very smooth!"
}
```

**Response (201):**
```json
{
  "success": true,
  "rating": {
    "_id": "6668...",
    "ride_id": "665f...",
    "user_id": "665a...",
    "driver_id": "665b...",
    "rating": 5,
    "review": "Great ride, very smooth!",
    "created_at": "2026-03-11T..."
  }
}
```

---

### 4.10 Get Ride Details

```
GET /api/ride/:rideId
```

**Response (200):**
```json
{
  "success": true,
  "ride": {
    "_id": "665f...",
    "ride_code": "RD456789",
    "user_id": { "_id": "665a...", "name": "John Doe", "phone": "+919876543210" },
    "driver_id": { "_id": "665b...", "name": "Raju Kumar", "phone": "+919876543211", "rating": 4.8 },
    "ride_status": "PAID",
    "total_fare": 262.8
  }
}
```

---

### 4.11 Get User Ride History

```
GET /api/ride/user/history?page=1&limit=20
```

**Headers:** `Authorization: Bearer <user_token>`

**Response (200):**
```json
{
  "success": true,
  "rides": [ "...array of ride objects..." ],
  "total": 25,
  "page": 1,
  "pages": 2
}
```

---

### 4.12 Get Driver Ride History

```
GET /api/ride/driver/history?page=1&limit=20
```

**Headers:** `Authorization: Bearer <driver_token>`

---

### 4.13 Get Ride Status Logs

```
GET /api/ride/:rideId/logs
```

**Response (200):**
```json
{
  "success": true,
  "logs": [
    { "status": "REQUESTED", "updated_by": "USER", "timestamp": "2026-03-11T10:00:00Z" },
    { "status": "DRIVER_ASSIGNED", "updated_by": "DRIVER", "timestamp": "2026-03-11T10:02:00Z" },
    { "status": "DRIVER_ARRIVED", "updated_by": "DRIVER", "timestamp": "2026-03-11T10:15:00Z" },
    { "status": "RIDE_STARTED", "updated_by": "DRIVER", "timestamp": "2026-03-11T10:18:00Z" },
    { "status": "RIDE_COMPLETED", "updated_by": "DRIVER", "timestamp": "2026-03-11T10:50:00Z" },
    { "status": "PAID", "updated_by": "USER", "timestamp": "2026-03-11T10:51:00Z" }
  ]
}
```

---

### 4.14 Get Nearby Drivers (User)

```
GET /api/ride/nearby-drivers?longitude=78.4867&latitude=17.3850&vehicle_type=SEDAN
```

**Headers:** `Authorization: Bearer <user_token>`

**Response (200):**
```json
{
  "success": true,
  "drivers": [
    {
      "_id": "665b...",
      "name": "Raju Kumar",
      "rating": 4.8,
      "total_rides": 150,
      "vehicle_id": {
        "vehicle_type": "SEDAN",
        "brand": "Maruti",
        "model": "Swift Dzire",
        "vehicle_number": "TS09AB1234"
      }
    }
  ]
}
```

---

### 4.15 Get Fare Estimate (User)

```
GET /api/ride/fare-estimate?vehicle_type=SEDAN&distance=12.5&duration=25
```

**Headers:** `Authorization: Bearer <user_token>`

**Response (200):**
```json
{
  "success": true,
  "fare": {
    "base_fare": 50,
    "distance_fare": 150,
    "time_fare": 25,
    "waiting_charge": 0,
    "total_fare": 225,
    "commission_percentage": 20
  }
}
```

---

## 5. Admin APIs

> All Admin APIs require `Authorization: Bearer <admin_token>`

### 5.1 Dashboard Stats

```
GET /api/admin/dashboard
```

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 5000,
    "totalDrivers": 800,
    "totalRides": 25000,
    "activeRides": 45,
    "totalRevenue": 2500000
  }
}
```

---

### 5.2 Get All Users

```
GET /api/admin/users?page=1&limit=20&status=ACTIVE&search=john
```

---

### 5.3 Get User by ID

```
GET /api/admin/users/:id
```

---

### 5.4 Update User

```
PUT /api/admin/users/:id
```

**Payload:**
```json
{
  "name": "Updated Name",
  "status": "ACTIVE"
}
```

---

### 5.5 Block User

```
PUT /api/admin/users/:id/block
```

---

### 5.6 Get All Drivers

```
GET /api/admin/drivers?page=1&limit=20&approval_status=PENDING&driver_status=ONLINE&search=raju
```

---

### 5.7 Get Driver by ID

```
GET /api/admin/drivers/:id
```

**Response (200):**
```json
{
  "success": true,
  "driver": { "...driver with vehicle and city populated..." },
  "kyc": { "...kyc document or null..." }
}
```

---

### 5.8 Update Driver

```
PUT /api/admin/drivers/:id
```

---

### 5.9 Suspend Driver

```
PUT /api/admin/drivers/:id/suspend
```

---

### 5.10 Get Pending KYC

```
GET /api/admin/kyc/pending?page=1&limit=20
```

---

### 5.11 Verify KYC

```
PUT /api/admin/kyc/:kycId/verify
```

**Payload:**
```json
{
  "status": "VERIFIED"
}
```

> `status` enum: `VERIFIED`, `REJECTED`

---

### 5.12 Get All Rides

```
GET /api/admin/rides?page=1&limit=20&ride_status=RIDE_STARTED
```

---

### 5.13 Get Ride by ID

```
GET /api/admin/rides/:id
```

---

### 5.14 Get All Pricing Configs

```
GET /api/admin/pricing
```

**Response (200):**
```json
{
  "success": true,
  "configs": [
    {
      "_id": "6669...",
      "ride_type": "SEDAN",
      "base_fare": 50,
      "per_km_charge": 12,
      "per_minute_charge": 1,
      "free_waiting_minutes": 3,
      "waiting_charge_per_minute": 2,
      "commission_percentage": 20
    }
  ]
}
```

---

### 5.15 Create/Update Pricing

```
POST /api/admin/pricing
```

**Payload:**
```json
{
  "ride_type": "SEDAN",
  "base_fare": 50,
  "per_km_charge": 12,
  "per_minute_charge": 1,
  "free_waiting_minutes": 3,
  "waiting_charge_per_minute": 2,
  "commission_percentage": 20
}
```

---

### 5.16 Get All Cities

```
GET /api/admin/cities
```

---

### 5.17 Create City

```
POST /api/admin/cities
```

**Payload:**
```json
{
  "city_name": "Hyderabad"
}
```

---

### 5.18 Update City

```
PUT /api/admin/cities/:id
```

**Payload:**
```json
{
  "city_name": "Hyderabad",
  "is_active": true
}
```

---

### 5.19 Delete City (Super Admin Only)

```
DELETE /api/admin/cities/:id
```

---

### 5.20 Get Support Tickets

```
GET /api/admin/support-tickets?page=1&limit=20&status=OPEN
```

---

### 5.21 Update Ticket Status

```
PUT /api/admin/support-tickets/:id
```

**Payload:**
```json
{
  "status": "RESOLVED"
}
```

> `status` enum: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

---

### 5.22 Get All Payments

```
GET /api/admin/payments?page=1&limit=20&payment_status=COMPLETED
```

---

### 5.23 Get Audit Logs (Super Admin Only)

```
GET /api/admin/audit-logs?page=1&limit=50
```

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "666a...",
      "admin_id": { "name": "Super Admin", "email": "admin@nbd.com" },
      "action": "KYC_VERIFIED",
      "target_id": "665b...",
      "timestamp": "2026-03-11T..."
    }
  ],
  "total": 200,
  "page": 1,
  "pages": 4
}
```

---

## 6. Socket.IO Events

### Connection

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token_here' }
});
```

### Client → Server Events

| Event | Role | Payload | Description |
|-------|------|---------|-------------|
| `driver-location-update` | Driver | `{ longitude, latitude, heading, speed }` | Update driver GPS position |
| `track-driver` | User | `{ driver_id }` | Start tracking a driver in real-time |
| `stop-tracking` | User | `{ driver_id }` | Stop tracking a driver |

### Server → Client Events

| Event | Recipient | Payload | Description |
|-------|-----------|---------|-------------|
| `ride-request` | Driver | `{ ride_id, ride_code, pickup, drop, estimated_fare }` | New ride request for nearby drivers |
| `ride-accepted` | User | `{ ride_id, driver_id, driver_name, driver_phone }` | Driver accepted the ride |
| `driver-arrived` | User | `{ ride_id, ride_otp }` | Driver arrived at pickup |
| `ride-started` | User | `{ ride_id }` | Ride has started |
| `ride-completed` | User | `{ ride_id, total_fare, actual_distance, actual_duration }` | Ride completed |
| `ride-cancelled` | User/Driver | `{ ride_id, cancelled_by }` | Ride was cancelled |
| `driver-location` | User (tracking) | `{ driver_id, location, heading, speed }` | Real-time driver location |

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal Server Error |

---

## Ride Flow

```
USER requests ride → REQUESTED
  ↓
DRIVER accepts → DRIVER_ASSIGNED
  ↓
DRIVER arrives → DRIVER_ARRIVED (waiting timer starts)
  ↓
DRIVER verifies OTP & starts → RIDE_STARTED (waiting timer stops)
  ↓
DRIVER completes → RIDE_COMPLETED (fare calculated)
  ↓
USER pays → PAID (driver wallet credited)
  ↓
USER rates → Rating saved
```

---

## Pagination

All list endpoints support pagination:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

Response includes:

```json
{
  "total": 100,
  "page": 1,
  "pages": 5
}
```
