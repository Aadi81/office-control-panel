// backend/utils/socket.js
const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Employee login event
    socket.on('employee-login', (data) => {
      console.log('👤 Employee logged in:', data.employeeId);
      socket.join(`employee-${data.employeeId}`);
      // Broadcast to master panel
      io.emit('employee-status-change', {
        employeeId: data.employeeId,
        status: 'active'
      });
    });

    // Employee logout event
    socket.on('employee-logout', (data) => {
      console.log('👋 Employee logged out:', data.employeeId);
      socket.leave(`employee-${data.employeeId}`);
      // Broadcast to master panel
      io.emit('employee-status-change', {
        employeeId: data.employeeId,
        status: 'offline'
      });
    });

    // Master login event
    socket.on('master-login', () => {
      console.log('👑 Master logged in');
      socket.join('master-panel');
    });

    // Broadcast data changes
    socket.on('data-change', (data) => {
      io.emit('sync-data', data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  // Real-time sync function
  setInterval(() => {
    io.emit('heartbeat', { timestamp: Date.now() });
  }, 5000);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit events helper functions
const emitToMaster = (event, data) => {
  if (io) {
    io.to('master-panel').emit(event, data);
  }
};

const emitToEmployee = (employeeId, event, data) => {
  if (io) {
    io.to(`employee-${employeeId}`).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToMaster,
  emitToEmployee,
  emitToAll
};