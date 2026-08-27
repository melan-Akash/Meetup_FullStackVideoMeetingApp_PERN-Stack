import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockAuth } from '../context/AuthContext';
import { useWebRTC } from '../hooks/use web RTC.js';
import { useChat } from '../hooks/use chat.js';
import VideoGrid from '../components/meeting/video grid.jsx';
import ChatPanel from '../components/meeting/chat panel.jsx';
import ParticipantsList from '../components/meeting/participants list.jsx';
import ControlBar from '../components/meeting/controlbar.jsx';
import ReactionsOverlay from '../components/meeting/reactions overlay.jsx';
import WaitingLobby from '../components/meeting/waiting lobby.jsx';
import { toast } from 'react-hot-toast';

export default function MeetingRoom() {
  const { id: roomID } = useParams();
  const navigate = useNavigate();
  const { user } = useMockAuth();

  const handleMeetingEnded = useCallback((msg) => {
    toast.success(msg || "Meeting room closed.");
    navigate('/dashboard');
  }, [navigate]);

  const {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    isHandRaised,
    reactions,
    isWaitingInLobby,
    isRoomLocked,
    isWaitingRoomEnabled,
    waitingUsers,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleRaiseHand,
    sendReaction,
    muteParticipant,
    muteAll,
    kickParticipant,
    toggleLockMeeting,
    toggleWaitingRoom,
    admitUser,
    denyUser,
    endMeeting
  } = useWebRTC(roomID, user, handleMeetingEnded, true, true);

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

  // If user is currently waiting in the lobby for host approval
  if (isWaitingInLobby) {
    return <WaitingLobby roomID={roomID} hostName="Meeting Host" />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#f0f4f8] text-slate-900 overflow-hidden select-none relative">
      
      {/* Top Header */}
      <header className="px-6 sm:px-8 py-3.5 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-md border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>Meeting Room ({roomID})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </h2>

          {isRoomLocked && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              🔒 Locked
            </span>
          )}

          {isWaitingRoomEnabled && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 hidden sm:inline-block">
              🛡️ Waiting Room Active
            </span>
          )}
        </div>
      </header>

      {/* Central Interactive Video Stage */}
      <div className="grow flex relative overflow-hidden">
        
        {/* Floating Emoji Reactions Overlay */}
        <ReactionsOverlay reactions={reactions} />

        {/* Video Grid Feed */}
        <div className="grow flex items-center justify-center p-6 sm:p-8">
          <VideoGrid
            localStream={localStream}
            localUser={user}
            remoteUsers={remoteUsers}
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            isLocalHandRaised={isHandRaised}
            isLocalScreenSharing={isScreenSharing}
          />
        </div>

        {/* Live Chat Sliding Drawer */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={toggleChat}
          messages={messages}
          onSendMessage={sendMessage}
          currentUser={user}
        />

        {/* Participants List Sliding Drawer with Host Controls */}
        <ParticipantsList
          isOpen={isParticipantsOpen}
          onClose={toggleParticipants}
          localUser={user}
          localAudio={audioEnabled}
          localVideo={videoEnabled}
          localIsHandRaised={isHandRaised}
          localIsScreenSharing={isScreenSharing}
          remoteUsers={remoteUsers}
          isHost={true}
          isRoomLocked={isRoomLocked}
          isWaitingRoomEnabled={isWaitingRoomEnabled}
          waitingUsers={waitingUsers}
          onMuteAll={muteAll}
          onMuteParticipant={muteParticipant}
          onKickParticipant={kickParticipant}
          onToggleLockMeeting={toggleLockMeeting}
          onToggleWaitingRoom={toggleWaitingRoom}
          onAdmitUser={admitUser}
          onDenyUser={denyUser}
        />
      </div>

      {/* Meeting Toolbar Controls */}
      <ControlBar
        roomID={roomID}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleRaiseHand={toggleRaiseHand}
        onSendReaction={sendReaction}
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