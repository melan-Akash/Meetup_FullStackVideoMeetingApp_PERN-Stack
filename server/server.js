import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Ensure IPv4 first on Node.js to prevent IPv6 timeout issues
dns.setDefaultResultOrder('ipv4first');

// Load environment variables
dotenv.config();

// Import database initialization
import { initDB } from './config/db.js';

// Import Routes and Socket handlers
import authRoutes from './routes/authRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { handleSocketConnections } from './socket/socketHandler.js';

const app = express();
const httpServer = createServer(app);

// Connect to Neon & Initialize Tables
initDB();

// Allowed Origins List
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://meetup-ten-lemon.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Server health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "MeetUp Server Online", 
    environment: process.env.NODE_ENV || 'development',
    time: new Date() 
  });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

// Configure Socket.io server for WebRTC signaling and Live Chat
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Manage Socket.io connections
handleSocketConnections(io);

// Start server on configured port in standalone Node.js environments
const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  httpServer.listen(PORT, () => {
    console.log(`MeetUp Server successfully listening on port ${PORT}`);
  });
}

// Export app and server for Vercel Serverless Function deployment
export default app;
export { httpServer, io };