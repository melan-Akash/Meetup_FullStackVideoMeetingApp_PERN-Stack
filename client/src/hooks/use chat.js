import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export const useChat = (roomID, user) => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Backend එක සම්බන්ධ කිරීමට පෙර, වැඩ කරන ආකාරය පරීක්ෂා කිරීමට Mock Messages ඇතුළත් කිරීම
  useEffect(() => {
    if (!roomID) return;

    // කාමරයට ඇතුළු වූ පසු පෙන්වන System Message එක
    const welcomeTimer = setTimeout(() => {
      const welcomeMsg = {
        id: 'welcome-msg',
        senderId: 'system',
        senderName: 'System Bot',
        text: `Welcome to meeting room: ${roomID}! Feel free to invite others to connect.`,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, welcomeMsg]);
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }, 1500);

    // තත්පර 10කට පසු වෙනත් සාමාජිකයෙකු පණිවිඩයක් එවන ආකාරය අනුකරණය කිරීම (Simulate Peer Message)
    const peerTimer = setTimeout(() => {
      const peerMsg = {
        id: `msg_${Date.now()}`,
        senderId: 'mock_peer_1',
        senderName: 'Sarah Connor',
        text: "Hey everyone! Glad to join the call.",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, peerMsg]);
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }, 10000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(peerTimer);
    };
  }, [roomID, isChatOpen]);

  // පණිවිඩයක් පිටත් කිරීමේ ක්‍රියාවලිය
  const sendMessage = useCallback((text) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'guest_user',
      senderName: user?.fullName || 'Guest',
      text: text,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, newMsg]);

    /* 
       සැබෑ Backend එක සම්බන්ධ කළ පසු Socket.io මඟින් පණිවිඩය යැවීමට මෙම කේතය භාවිත කරයි:
       socket.emit('send-message', { roomID, message: newMsg });
    */
  }, [user]);

  // Chat Panel එක විවෘත කිරීමේදී unread count එක බින්දුව (0) කිරීම
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