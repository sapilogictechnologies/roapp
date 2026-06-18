const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io = null;

const buildCorsOrigin = () => {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const defaults = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  const allowed = new Set([...configured, ...defaults]);

  return (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowed.has(origin)) return callback(null, true);
    if (
      process.env.NODE_ENV === 'development' &&
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Socket.IO CORS blocked: ${origin}`));
  };
};

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: buildCorsOrigin(),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .select('_id name email role isActive')
        .lean();

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket;
    const isAdmin = user.role === 'admin' || user.role === 'staff';

    if (isAdmin) {
      socket.join('admin');
    } else {
      socket.join(`user:${user._id}`);
    }

    socket.on('disconnect', () => {});
  });

  return io;
};

// Emit to a specific customer's room
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

// Emit to the shared admin room (all admins/staff receive it)
const emitToAdmin = (event, data) => {
  if (!io) return;
  io.to('admin').emit(event, data);
};

const getIO = () => io;

module.exports = { init, emitToUser, emitToAdmin, getIO };
