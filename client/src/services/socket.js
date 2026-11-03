import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to real-time seat server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from real-time server');
    });
  }
  return socket;
};

export const joinShowtimeRoom = (showtimeId) => {
  const s = getSocket();
  if (s && showtimeId) {
    s.emit('join_showtime', showtimeId);
  }
};

export const leaveShowtimeRoom = (showtimeId) => {
  const s = getSocket();
  if (s && showtimeId) {
    s.emit('leave_showtime', showtimeId);
  }
};

export default getSocket;
