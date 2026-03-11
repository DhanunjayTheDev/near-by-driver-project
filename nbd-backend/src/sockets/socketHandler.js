const jwt = require('jsonwebtoken');
const DriverLocation = require('../models/DriverLocation');
const Driver = require('../models/Driver');

const setupSocket = (io) => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.userId} (${socket.userRole})`);

    // Join role-based room
    if (socket.userRole === 'user') {
      socket.join(`user_${socket.userId}`);
    } else if (socket.userRole === 'driver') {
      socket.join(`driver_${socket.userId}`);
    }

    // ── Driver Location Update ──
    socket.on('driver-location-update', async (data) => {
      if (socket.userRole !== 'driver') return;

      try {
        const { longitude, latitude, heading, speed } = data;
        if (longitude == null || latitude == null) return;

        await DriverLocation.findOneAndUpdate(
          { driver_id: socket.userId },
          {
            location: { type: 'Point', coordinates: [longitude, latitude] },
            heading: heading || 0,
            speed: speed || 0,
            updated_at: new Date(),
          },
          { upsert: true }
        );

        await Driver.findByIdAndUpdate(socket.userId, {
          current_location: { type: 'Point', coordinates: [longitude, latitude] },
        });

        // Broadcast to ride-tracking room if driver is on a ride
        socket.to(`tracking_driver_${socket.userId}`).emit('driver-location', {
          driver_id: socket.userId,
          location: { longitude, latitude },
          heading,
          speed,
        });
      } catch (error) {
        console.error('[Socket] Location update error:', error.message);
      }
    });

    // ── User: Track Driver ──
    socket.on('track-driver', (data) => {
      if (socket.userRole !== 'user') return;
      const { driver_id } = data;
      if (driver_id) socket.join(`tracking_driver_${driver_id}`);
    });

    socket.on('stop-tracking', (data) => {
      const { driver_id } = data;
      if (driver_id) socket.leave(`tracking_driver_${driver_id}`);
    });

    // ── Disconnect ──
    socket.on('disconnect', async () => {
      console.log(`[Socket] Disconnected: ${socket.userId}`);
      if (socket.userRole === 'driver') {
        await Driver.findByIdAndUpdate(socket.userId, { driver_status: 'OFFLINE' });
      }
    });
  });
};

module.exports = setupSocket;
