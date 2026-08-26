import pool from '../config/db.js';

export const handleSocketConnections = (io) => {
  // Active participants per room: { roomID: [{ socketId, userId, userName, audioEnabled, videoEnabled }] }
  const roomParticipants = {};

  io.on('connection', (socket) => {
    console.log(`User connected to Socket.io: ${socket.id}`);

    // ==========================================
    // 1. ROOM JOIN
    // ==========================================
    socket.on('join-room', ({ roomId, roomID, user, userID, username, audioEnabled = true, videoEnabled = true }) => {
      const activeRoomId = roomId || roomID;
      const activeUserId = user?.id || userID || 'guest_user';
      const activeUserName = user?.fullName || user?.name || username || 'Participant';

      if (!activeRoomId) return;

      socket.join(activeRoomId);

      const newParticipant = {
        socketId: socket.id,
        userId: activeUserId,
        userName: activeUserName,
        username: activeUserName,
        audioEnabled,
        videoEnabled
      };

      if (!roomParticipants[activeRoomId]) {
        roomParticipants[activeRoomId] = [];
      }

      // Filter out existing entries with same socketId
      roomParticipants[activeRoomId] = roomParticipants[activeRoomId].filter(p => p.socketId !== socket.id);
      roomParticipants[activeRoomId].push(newParticipant);

      // Notify other peers in room
      socket.to(activeRoomId).emit('user-joined', newParticipant);

      // Send existing peers list to the newcomer
      const existingPeers = roomParticipants[activeRoomId].filter(p => p.socketId !== socket.id);
      socket.emit('all-users', existingPeers);
      socket.emit('get-active-peers', existingPeers);
    });

    // ==========================================
    // 2. WEBRTC SIGNALING (Offers, Answers, ICE)
    // ==========================================
    socket.on('offer', ({ targetSocketId, callerSocketId, sdp, callerUser }) => {
      io.to(targetSocketId).emit('offer', {
        callerSocketId: callerSocketId || socket.id,
        sdp,
        callerUser
      });
    });

    socket.on('answer', ({ targetSocketId, responderSocketId, sdp }) => {
      io.to(targetSocketId).emit('answer', {
        responderSocketId: responderSocketId || socket.id,
        sdp
      });
    });

    socket.on('ice-candidate', ({ targetSocketId, senderSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', {
        senderSocketId: senderSocketId || socket.id,
        candidate
      });
    });

    // Simple-Peer compatibility handlers
    socket.on('sending-signal', ({ userToSignal, signal, callerId, callerName }) => {
      io.to(userToSignal).emit('user-joined-signal', { signal, callerId, callerName });
    });

    socket.on('returning-signal', ({ callerId, signal }) => {
      io.to(callerId).emit('receiving-returned-signal', { signal, id: socket.id });
    });

    // ==========================================
    // 3. MEDIA STATUS TOGGLES
    // ==========================================
    socket.on('toggle-audio', ({ roomId, roomID, audioEnabled }) => {
      const activeRoomId = roomId || roomID;
      if (roomParticipants[activeRoomId]) {
        const p = roomParticipants[activeRoomId].find(u => u.socketId === socket.id);
        if (p) p.audioEnabled = audioEnabled;
      }
      socket.to(activeRoomId).emit('user-toggled-audio', { socketId: socket.id, audioEnabled });
    });

    socket.on('toggle-video', ({ roomId, roomID, videoEnabled }) => {
      const activeRoomId = roomId || roomID;
      if (roomParticipants[activeRoomId]) {
        const p = roomParticipants[activeRoomId].find(u => u.socketId === socket.id);
        if (p) p.videoEnabled = videoEnabled;
      }
      socket.to(activeRoomId).emit('user-toggled-video', { socketId: socket.id, videoEnabled });
    });

    socket.on('toggle-media', ({ roomID, roomId, audioEnabled, videoEnabled }) => {
      const activeRoomId = roomID || roomId;
      if (roomParticipants[activeRoomId]) {
        const p = roomParticipants[activeRoomId].find(u => u.socketId === socket.id);
        if (p) {
          p.audioEnabled = audioEnabled;
          p.videoEnabled = videoEnabled;
        }
      }
      socket.to(activeRoomId).emit('peer-media-toggled', { socketId: socket.id, audioEnabled, videoEnabled });
    });

    // ==========================================
    // 4. PERSISTENT LIVE CHAT
    // ==========================================
    socket.on('send-message', async ({ roomID, roomId, message }) => {
      const activeRoomId = roomID || roomId;
      const { senderId, senderName, text } = message;

      try {
        await pool.query(
          "INSERT INTO messages (meeting_id, sender_id, sender_name, text) VALUES ($1, $2, $3, $4)",
          [activeRoomId, senderId, senderName, text]
        );
      } catch (err) {
        console.error("Database chat message persistence failed:", err.message);
      }

      io.to(activeRoomId).emit('receive-message', message);
    });

    // ==========================================
    // 5. END MEETING (HOST ACTION)
    // ==========================================
    socket.on('end-meeting', async ({ roomId, roomID }) => {
      const activeRoomId = roomId || roomID;
      try {
        await pool.query(
          "UPDATE meetings SET status = 'ended', ended_at = NOW() WHERE id = $1",
          [activeRoomId]
        );
      } catch (err) {
        console.warn("Meeting end status update failed:", err.message);
      }

      io.to(activeRoomId).emit('meeting-ended', {
        message: "The host has ended this meeting session."
      });
      delete roomParticipants[activeRoomId];
    });

    // ==========================================
    // 6. DISCONNECTION & CLEANUP
    // ==========================================
    const handleDisconnect = () => {
      for (const rId in roomParticipants) {
        const idx = roomParticipants[rId].findIndex(p => p.socketId === socket.id);
        if (idx !== -1) {
          const departingUser = roomParticipants[rId][idx];
          roomParticipants[rId].splice(idx, 1);

          socket.to(rId).emit('user-left', {
            socketId: socket.id,
            user: departingUser,
            username: departingUser.userName || departingUser.username
          });

          if (roomParticipants[rId].length === 0) {
            delete roomParticipants[rId];
          }
          break;
        }
      }
    };

    socket.on('leave-room', handleDisconnect);
    socket.on('disconnect', handleDisconnect);
  });
};

export default handleSocketConnections;