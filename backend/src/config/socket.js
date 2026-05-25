import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env.js';

export function initSocket(httpServer, app) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, env.jwt.secret);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.on('join:branch', (branchId) => {
      socket.join(`branch:${branchId}`);
    });
  });

  app.set('io', io);
  return io;
}
