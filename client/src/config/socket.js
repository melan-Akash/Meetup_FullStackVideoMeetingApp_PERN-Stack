import { io } from 'socket.io-client';

const getSocketUrl = () => {
  // If running locally, connect directly to local Node.js server
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
};

const SERVER_URL = getSocketUrl();

export const socket = io(SERVER_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

export default socket;
