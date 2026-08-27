import React from 'react';
import VideoTile from './video tile.jsx';

export default function VideoGrid({ 
  localStream, 
  localUser, 
  remoteUsers, 
  audioEnabled, 
  videoEnabled,
  isLocalHandRaised,
  isLocalScreenSharing,
  virtualBackground = 'none'
}) {
  const isSomeoneSharing = isLocalScreenSharing || remoteUsers.some(u => u.isScreenSharing);
  const totalParticipants = 1 + remoteUsers.length;

  const getGridLayout = () => {
    if (isSomeoneSharing) {
      return "grid-cols-1 max-w-6xl";
    }
    if (totalParticipants === 1) return "grid-cols-1 max-w-2xl";
    if (totalParticipants === 2) return "grid-cols-1 md:grid-cols-2 max-w-5xl";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl";
  };

  return (
    <div className={`grid gap-4 w-full h-full items-center justify-center transition-all duration-300 ${getGridLayout()}`}>
      
      {/* 1. Local User (You) */}
      <VideoTile
        username={`${localUser?.fullName || 'Guest'} (You)`}
        stream={localStream}
        isLocal={true}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        isHandRaised={isLocalHandRaised}
        isScreenSharing={isLocalScreenSharing}
        virtualBackground={virtualBackground}
      />

      {/* 2. Remote Users */}
      {remoteUsers.map((user) => (
        <VideoTile
          key={user.socketId}
          username={user.username || user.userName || 'Participant'}
          stream={user.stream}
          isLocal={false}
          audioEnabled={user.audioEnabled}
          videoEnabled={user.videoEnabled}
          isHandRaised={user.isHandRaised}
          isScreenSharing={user.isScreenSharing}
        />
      ))}
    </div>
  );
}