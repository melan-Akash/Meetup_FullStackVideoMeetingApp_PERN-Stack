import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SERVER_URL || 'https://meetup-backend-gbhg.onrender.com';

export const socket = io(SERVER_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000
});

export default socket;
