import pool from '../config/db.js';

export const handleSocketConnections = (io) => {
  // Active participants per room: { roomID: [{ socketId, userId, userName, audioEnabled, videoEnabled, isHandRaised, isScreenSharing, isHost }] }
  const roomParticipants = {};

  // Host settings per room: { roomID: { isLocked: boolean, isWaitingRoomEnabled: boolean, hostSocketId: string, waitingUsers: [{ socketId, userId, userName }] } }
  const roomSettings = {};

  // Shared meeting notes per room: { roomID: string }
  const roomNotes = {};

  io.on('connection', (socket) => {
    console.log(`User connected to Socket.io: ${socket.id}`);

    // ==========================================
    // 1. ROOM JOIN WITH LOCK & WAITING ROOM CHECK
    // ==========================================
    socket.on('join-room', ({ roomId, roomID, user, userID, username, audioEnabled = true, videoEnabled = true, isHost = false }) => {
      const activeRoomId = roomId || roomID;
      const activeUserId = user?.id || userID || 'guest_user';
      const activeUserName = user?.fullName || user?.name || username || 'Participant';

      if (!activeRoomId) return;

      if (!roomSettings[activeRoomId]) {
        roomSettings[activeRoomId] = {
          isLocked: false,
          isWaitingRoomEnabled: false,
          hostSocketId: isHost ? socket.id : null,
          waitingUsers: []
        };
      }

      const settings = roomSettings[activeRoomId];
      if (isHost) {
        settings.hostSocketId = socket.id;
      }

      // Check Locked
      if (settings.isLocked && !isHost && settings.hostSocketId !== socket.id) {
        socket.emit('meeting-locked', {
          message: "This meeting is locked by the host. New participants cannot join."
        });
        return;
      }

      // Check Waiting Room
      if (settings.isWaitingRoomEnabled && !isHost && settings.hostSocketId !== socket.id) {
        const waitingUser = {
          socketId: socket.id,
          userId: activeUserId,
          userName: activeUserName,
          audioEnabled,
          videoEnabled
        };

        settings.waitingUsers = settings.waitingUsers.filter(w => w.socketId !== socket.id);
        settings.waitingUsers.push(waitingUser);

        socket.emit('waiting-in-lobby', {
          roomId: activeRoomId,
          message: "Please wait, the meeting host will let you in soon."
        });

        if (settings.hostSocketId) {
          io.to(settings.hostSocketId).emit('waiting-users-updated', settings.waitingUsers);
        }
        return;
      }

      socket.join(activeRoomId);

      const newParticipant = {
        socketId: socket.id,
        userId: activeUserId,
        userName: activeUserName,
        username: activeUserName,
        audioEnabled,
        videoEnabled,
        isHandRaised: false,
        isScreenSharing: false,
        isHost: isHost || (settings.hostSocketId === socket.id)
      };

      if (!roomParticipants[activeRoomId]) {
        roomParticipants[activeRoomId] = [];
      }

      roomParticipants[activeRoomId] = roomParticipants[activeRoomId].filter(p => p.socketId !== socket.id);
      roomParticipants[activeRoomId].push(newParticipant);

      socket.to(activeRoomId).emit('user-joined', newParticipant);

      const existingPeers = roomParticipants[activeRoomId].filter(p => p.socketId !== socket.id);
      socket.emit('all-users', existingPeers);
      socket.emit('get-active-peers', existingPeers);

      socket.emit('room-settings-sync', {
        isLocked: settings.isLocked,
        isWaitingRoomEnabled: settings.isWaitingRoomEnabled,
        waitingUsers: settings.waitingUsers
      });

      // Send initial shared notes
      if (roomNotes[activeRoomId]) {
        socket.emit('notes-updated', { content: roomNotes[activeRoomId], updatedBy: 'System' });
      }
    });

    // ==========================================
    // 2. WAITING ROOM ADMIT & DENY
    // ==========================================
    socket.on('admit-user', ({ roomId, roomID, targetSocketId }) => {
      const activeRoomId = roomId || roomID;
      const settings = roomSettings[activeRoomId];
      if (!settings) return;

      const userIndex = settings.waitingUsers.findIndex(u => u.socketId === targetSocketId);
      if (userIndex === -1) return;

      const admittedUser = settings.waitingUsers.splice(userIndex, 1)[0];

      if (settings.hostSocketId) {
        io.to(settings.hostSocketId).emit('waiting-users-updated', settings.waitingUsers);
      }

      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.join(activeRoomId);

        const newParticipant = {
          socketId: admittedUser.socketId,
          userId: admittedUser.userId,
          userName: admittedUser.userName,
          username: admittedUser.userName,
          audioEnabled: admittedUser.audioEnabled,
          videoEnabled: admittedUser.videoEnabled,
          isHandRaised: false,
          isScreenSharing: false,
          isHost: false
        };

        if (!roomParticipants[activeRoomId]) {
          roomParticipants[activeRoomId] = [];
        }
        roomParticipants[activeRoomId].push(newParticipant);

        targetSocket.emit('user-admitted', {
          roomId: activeRoomId,
          existingUsers: roomParticipants[activeRoomId].filter(p => p.socketId !== targetSocketId)
        });

        targetSocket.to(activeRoomId).emit('user-joined', newParticipant);
      }
    });

    socket.on('deny-user', ({ roomId, roomID, targetSocketId }) => {
      const activeRoomId = roomId || roomID;
      const settings = roomSettings[activeRoomId];
      if (!settings) return;

      settings.waitingUsers = settings.waitingUsers.filter(u => u.socketId !== targetSocketId);

      if (settings.hostSocketId) {
        io.to(settings.hostSocketId).emit('waiting-users-updated', settings.waitingUsers);
      }

      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit('user-denied', {
          message: "The host has denied your request to join this meeting."
        });
      }
    });

    // ==========================================
    // 3. HOST MODERATION (Mute / Kick / Lock / Lobby)
    // ==========================================
    socket.on('mute-user', ({ roomId, roomID, targetSocketId }) => {
      io.to(targetSocketId).emit('force-muted', {
        message: "You have been muted by the host."
      });
    });

    socket.on('mute-all', ({ roomId, roomID }) => {
      const activeRoomId = roomId || roomID;
      socket.to(activeRoomId).emit('force-muted', {
        message: "The host has muted everyone in the meeting."
      });
    });

    socket.on('kick-user', ({ roomId, roomID, targetSocketId }) => {
      const activeRoomId = roomId || roomID;
      io.to(targetSocketId).emit('user-kicked', {
        message: "You have been removed from the meeting by the host."
      });

      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.leave(activeRoomId);
      }

      if (roomParticipants[activeRoomId]) {
        const idx = roomParticipants[activeRoomId].findIndex(p => p.socketId === targetSocketId);
        if (idx !== -1) {
          const removed = roomParticipants[activeRoomId].splice(idx, 1)[0];
          io.to(activeRoomId).emit('user-left', {
            socketId: targetSocketId,
            user: removed,
            username: removed.userName || removed.username
          });
        }
      }
    });

    socket.on('toggle-lock-meeting', ({ roomId, roomID, isLocked }) => {
      const activeRoomId = roomId || roomID;
      if (!roomSettings[activeRoomId]) {
        roomSettings[activeRoomId] = { isLocked: false, isWaitingRoomEnabled: false, hostSocketId: socket.id, waitingUsers: [] };
      }
      roomSettings[activeRoomId].isLocked = isLocked;
      io.to(activeRoomId).emit('room-lock-changed', { isLocked });
    });

    socket.on('toggle-waiting-room', ({ roomId, roomID, isWaitingRoomEnabled }) => {
      const activeRoomId = roomId || roomID;
      if (!roomSettings[activeRoomId]) {
        roomSettings[activeRoomId] = { isLocked: false, isWaitingRoomEnabled: false, hostSocketId: socket.id, waitingUsers: [] };
      }
      roomSettings[activeRoomId].isWaitingRoomEnabled = isWaitingRoomEnabled;
      io.to(activeRoomId).emit('waiting-room-changed', { isWaitingRoomEnabled });
    });

    // ==========================================
    // 4. COLLABORATIVE WHITEBOARD
    // ==========================================
    socket.on('draw-line', ({ roomId, roomID, prevPoint, currentPoint, color, width, mode }) => {
      const activeRoomId = roomId || roomID;
      socket.to(activeRoomId).emit('draw-line', { prevPoint, currentPoint, color, width, mode });
    });

    socket.on('clear-whiteboard', ({ roomId, roomID }) => {
      const activeRoomId = roomId || roomID;
      socket.to(activeRoomId).emit('whiteboard-cleared');
    });

    // ==========================================
    // 5. LIVE SHARED MEETING NOTES
    // ==========================================
    socket.on('notes-update', ({ roomId, roomID, content, updatedBy }) => {
      const activeRoomId = roomId || roomID;
      roomNotes[activeRoomId] = content;
      socket.to(activeRoomId).emit('notes-updated', { content, updatedBy });
    });

    // ==========================================
    // 6. WEBRTC SIGNALING
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

    // ==========================================
    // 7. MEDIA STATUS TOGGLES
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

    // Screen sharing
    socket.on('toggle-screen-share', ({ roomId, roomID, isSharing }) => {
      const activeRoomId = roomId || roomID;
      if (roomParticipants[activeRoomId]) {
        const p = roomParticipants[activeRoomId].find(u => u.socketId === socket.id);
        if (p) p.isScreenSharing = isSharing;
      }
      socket.to(activeRoomId).emit('user-screen-share-toggled', { 
        socketId: socket.id, 
        isSharing 
      });
    });

    // Raise hand
    socket.on('raise-hand', ({ roomId, roomID, isHandRaised, userName, userId }) => {
      const activeRoomId = roomId || roomID;
      if (roomParticipants[activeRoomId]) {
        const p = roomParticipants[activeRoomId].find(u => u.socketId === socket.id);
        if (p) p.isHandRaised = isHandRaised;
      }
      socket.to(activeRoomId).emit('user-raised-hand', {
        socketId: socket.id,
        userId,
        userName,
        isHandRaised
      });
    });

    // Reactions
    socket.on('send-reaction', ({ roomId, roomID, emoji, userName }) => {
      const activeRoomId = roomId || roomID;
      io.to(activeRoomId).emit('receive-reaction', {
        id: `react_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        socketId: socket.id,
        userName: userName || 'Someone',
        emoji,
        timestamp: Date.now()
      });
    });

    // ==========================================
    // 8. LIVE CHAT & FILE ATTACHMENTS
    // ==========================================
    socket.on('send-message', async ({ roomID, roomId, message }) => {
      const activeRoomId = roomID || roomId;
      const { senderId, senderName, text, file } = message;

      try {
        const saveText = file ? `[Attachment: ${file.name}] ${text || ''}` : text;
        await pool.query(
          "INSERT INTO messages (meeting_id, sender_id, sender_name, text) VALUES ($1, $2, $3, $4)",
          [activeRoomId, senderId, senderName, saveText]
        );
      } catch (err) {
        console.error("Database chat message persistence failed:", err.message);
      }

      io.to(activeRoomId).emit('receive-message', message);
    });

    // ==========================================
    // 9. END MEETING
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
      delete roomSettings[activeRoomId];
      delete roomNotes[activeRoomId];
    });

    // ==========================================
    // 10. DISCONNECTION & CLEANUP
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

      for (const rId in roomSettings) {
        if (roomSettings[rId]?.waitingUsers) {
          const prevLen = roomSettings[rId].waitingUsers.length;
          roomSettings[rId].waitingUsers = roomSettings[rId].waitingUsers.filter(w => w.socketId !== socket.id);
          if (roomSettings[rId].waitingUsers.length !== prevLen && roomSettings[rId].hostSocketId) {
            io.to(roomSettings[rId].hostSocketId).emit('waiting-users-updated', roomSettings[rId].waitingUsers);
          }
        }
      }
    };

    socket.on('leave-room', handleDisconnect);
    socket.on('disconnect', handleDisconnect);
  });
};

export default handleSocketConnections;