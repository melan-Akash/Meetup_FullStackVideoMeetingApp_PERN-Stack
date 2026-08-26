import { useState, useEffect, useCallback } from 'react';
import { socket } from '../config/socket';

export const useChat = (roomID, user) => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initial welcome message and Socket.io message listener
  useEffect(() => {
    if (!roomID) return;

    // Welcome system greeting
    const welcomeMsg = {
      id: `welcome-${roomID}`,
      senderId: 'system',
      senderName: 'System Bot',
      text: `Welcome to meeting room: ${roomID}! Feel free to chat with participants.`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMsg]);

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for incoming live chat messages from peers
    const handleReceiveMessage = (incomingMsg) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some(m => m.id === incomingMsg.id)) return prev;
        return [...prev, incomingMsg];
      });

      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [roomID, isChatOpen]);

  // Dispatch outgoing message to backend socket & database
  const sendMessage = useCallback((text) => {
    if (!text || !text.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: user?.id || 'guest_user',
      senderName: user?.fullName || 'Guest',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    // Optimistic local state update
    setMessages((prev) => [...prev, newMsg]);

    // Broadcast to meeting room and persist in PostgreSQL via socketHandler.js
    if (socket.connected) {
      socket.emit('send-message', { roomID, message: newMsg });
    }
  }, [roomID, user]);

  // Reset unread count when opening chat drawer
  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setUnreadCount(0);
      }
      return nextState;
    });
  }, []);

  return {
    messages,
    sendMessage,
    unreadCount,
    isChatOpen,
    toggleChat
  };
};

export default useChat;