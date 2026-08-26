 import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes සහ Socket handlers ආනයනය (Import) කිරීම
import authRoutes from './routes/authRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import { handleSocketConnections } from './socket/socketHandler.js';

// Environment variables සක්‍රීය කිරීම
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Frontend URL එක ලබා ගැනීම (Default: Vite port 5173)
const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS Middleware එක සැකසීම (Frontend එකට API requests එවීමට අවසර දීම)
app.use(cors({
  origin: clientURL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Server එක වැඩදැයි බැලීමට සරල Health Check API එකක්
app.get('/', (req, res) => {
  res.status(200).json({ status: "MeetUp Server Online", time: new Date() });
});

// ප්‍රධාන API Routes සම්බන්ධ කිරීම
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

// Socket.io සේවාව සක්‍රීය කිරීම (Live Chat සහ WebRTC signaling සඳහා)
const io = new Server(httpServer, {
  cors: {
    origin: clientURL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io සම්බන්ධතා කළමනාකරණය
handleSocketConnections(io);

// Server එක Listen කරන Port එක සැකසීම (Default: 5000)
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`MeetUp Server successfully listening on port ${PORT}`);
});