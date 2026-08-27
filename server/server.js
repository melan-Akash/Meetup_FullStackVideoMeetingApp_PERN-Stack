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
import { handleSocketConnections } from './socket/socketHandler.js';

const app = express();
const httpServer = createServer(app);

// Connect to Neon & Initialize Tables
initDB();

// Frontend client URL (Default: Vite port 5173)
const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';

// Configure CORS middleware
app.use(cors({
  origin: clientURL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Server health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: "MeetUp Server Online", time: new Date() });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/ai', aiRoutes);

// Configure Socket.io server for WebRTC signaling and Live Chat
const io = new Server(httpServer, {
  cors: {
    origin: clientURL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Manage Socket.io connections
handleSocketConnections(io);

// Start server on configured port
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`MeetUp Server successfully listening on port ${PORT}`);
});