import pool from '../config/db.js';

export const handleSocketConnections = (io) => {
  // Keeps track of active participants connected in each live meeting room
  // Structure: { roomID: [{ socketId, userId, username, audioEnabled, videoEnabled }] }
  const roomParticipants = {};

  io.on('connection', (socket) => {
    console.log(`User connected to Socket.io: ${socket.id}`);

    // ==========================================
    // 1. ROOM ENTRY
    // ==========================================
    socket.on('join-room', ({ roomID, userID, username }) => {
      socket.join(roomID);

      const newParticipant = {
        socketId: socket.id,
        userId: userID,
        username,
        audioEnabled: true,
        videoEnabled: true
      };

      if (!roomParticipants[roomID]) {
        roomParticipants[roomID] = [];
      }
      roomParticipants[roomID].push(newParticipant);

      // Notify existing peers that a new user has joined the call
      socket.to(roomID).emit('user-joined', newParticipant);

      // Return current active peer list to the newcomer so they can initiate WebRTC streams
      const otherUsers = roomParticipants[roomID].filter(p => p.socketId !== socket.id);
      socket.emit('get-active-peers', otherUsers);
    });

    // ==========================================
    // 2. WEBRTC P2P SIGNALING HANDSHAKES
    // ==========================================
    
    // Forwards the connection offer/ICE candidate payload to the target peer
    socket.on('sending-signal', ({ userToSignal, signal, callerId, callerName }) => {
      io.to(userToSignal).emit('user-joined-signal', { 
        signal, 
        callerId, 
        callerName 
      });
    });

    // Returns the handshake answer back to the original caller
    socket.on('returning-signal', ({ callerId, signal }) => {
      io.to(callerId).emit('receiving-returned-signal', { 
        signal, 
        id: socket.id 
      });
    });

    // ==========================================
    // 3. HARDWARE MEDIA STATUS SYNC
    // ==========================================
    socket.on('toggle-media', ({ roomID, audioEnabled, videoEnabled }) => {
      if (roomParticipants[roomID]) {
        const user = roomParticipants[roomID].find(p => p.socketId === socket.id);
        if (user) {
          user.audioEnabled = audioEnabled;
          user.videoEnabled = videoEnabled;
          
          // Broadcast track changes to other room peers to update mic/camera icons
          socket.to(roomID).emit('peer-media-toggled', { 
            socketId: socket.id, 
            audioEnabled, 
            videoEnabled 
          });
        }
      }
    });

    // ==========================================
    // 4. PERSISTENT CHAT MESSAGING
    // ==========================================
    socket.on('send-message', async ({ roomID, message }) => {
      const { senderId, senderName, text } = message;
      try {
        // Save chat message directly into Neon PostgreSQL Database
        await pool.query(
          "INSERT INTO messages (meeting_id, sender_id, sender_name, text) VALUES ($1, $2, $3, $4)",
          [roomID, senderId, senderName, text]
        );
        
        // Broadcast the message instantly to everyone in the room
        io.to(roomID).emit('receive-message', message);
      } catch (err) {
        console.error("Database persistence failed inside socket messaging:", err);
      }
    });

    // ==========================================
    // 5. CALL TERMINATION & DISCONNECTS
    // ==========================================
    const handleDisconnect = () => {
      for (const roomID in roomParticipants) {
        const idx = roomParticipants[roomID].findIndex(p => p.socketId === socket.id);
        if (idx !== -1) {
          const departingUser = roomParticipants[roomID][idx];
          roomParticipants[roomID].splice(idx, 1);

          // Tell other peers in the room that this user left
          socket.to(roomID).emit('user-left', { 
            socketId: socket.id, 
            username: departingUser.username 
          });

          // Delete the room tracking reference if it is empty
          if (roomParticipants[roomID].length === 0) {
            delete roomParticipants[roomID];
          }
          break;
        }
      }
    };

    socket.on('leave-room', handleDisconnect);
    socket.on('disconnect', handleDisconnect);
  });
};