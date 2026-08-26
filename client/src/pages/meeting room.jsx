import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockAuth } from '../context/AuthContext';
import { useWebRTC } from '../hooks/use web RTC.js';
import { useChat } from '../hooks/use chat.js';
import VideoGrid from '../components/meeting/video grid.jsx';
import ChatPanel from '../components/meeting/chat panel.jsx';
import ParticipantsList from '../components/meeting/participants list.jsx';
import ControlBar from '../components/meeting/controlbar.jsx';
import { toast } from 'react-hot-toast';

export default function MeetingRoom() {
  const { id: roomID } = useParams();
  const navigate = useNavigate();
  const { user } = useMockAuth();

  const handleMeetingEnded = useCallback(() => {
    toast.success("Meeting room closed.");
    navigate('/dashboard');
  }, [navigate]);

  const {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting
  } = useWebRTC(roomID, user, handleMeetingEnded);

  const {
    messages,
    sendMessage,
    unreadCount,
    isChatOpen,
    toggleChat
  } = useChat(roomID, user);

  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const toggleParticipants = useCallback(() => {
    setIsParticipantsOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#f0f4f8] text-slate-900 overflow-hidden select-none">
      
      {/* Top Header */}
      <header className="px-8 py-3.5 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-md border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>Instant Meeting ({roomID})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </h2>
        </div>
      </header>

      {/* Central Interactive Grid */}
      <div className="grow flex relative overflow-hidden">
        <div className="grow flex items-center justify-center p-6 sm:p-8">
          <VideoGrid
            localStream={localStream}
            localUser={user}
            remoteUsers={remoteUsers}
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
          />
        </div>

        {/* Dynamic sliding panels */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={toggleChat}
          messages={messages}
          onSendMessage={sendMessage}
          currentUser={user}
        />

        <ParticipantsList
          isOpen={isParticipantsOpen}
          onClose={toggleParticipants}
          localUser={user}
          localAudio={audioEnabled}
          localVideo={videoEnabled}
          remoteUsers={remoteUsers}
          meetingHostID={user?.id}
        />
      </div>

      {/* Floating Toolbar control */}
      <ControlBar
        roomID={roomID}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onToggleParticipants={toggleParticipants}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadCount={unreadCount}
        participantsCount={1 + remoteUsers.length}
        isHost={true}
        onLeave={() => navigate('/dashboard')}
        onEndMeeting={endMeeting}
      />
    </div>
  );
}