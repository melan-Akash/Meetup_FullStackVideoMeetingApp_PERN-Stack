import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, Crown, Monitor } from 'lucide-react';

export default function ParticipantsList({
  isOpen,
  onClose,
  localUser,
  localAudio,
  localVideo,
  localIsHandRaised,
  localIsScreenSharing,
  remoteUsers,
  meetingHostID
}) {
  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-slate-200/90 bg-white/95 backdrop-blur-xl h-full flex flex-col shrink-0 shadow-lg z-30 transition-all duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-900">
          Participants ({1 + remoteUsers.length})
        </h3>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Participants Container */}
      <div className="grow overflow-y-auto p-4 space-y-2.5">
        
        {/* 1. Local Participant (You) */}
        <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {localUser?.fullName ? localUser.fullName[0].toUpperCase() : "G"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>{localUser?.fullName || 'Guest'}</span>
                <Crown className="w-3 h-3 text-amber-500" />
                {localIsHandRaised && <span className="text-sm">✋</span>}
                {localIsScreenSharing && <Monitor className="w-3 h-3 text-blue-600" />}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Host (You)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {localAudio ? (
              <Mic className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <MicOff className="w-3.5 h-3.5 text-rose-500" />
            )}
            {localVideo ? (
              <Video className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <VideoOff className="w-3.5 h-3.5 text-rose-500" />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-2"></div>

        {/* 2. Remote Participants (Others) */}
        {remoteUsers.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Waiting for others to join...
          </div>
        ) : (
          remoteUsers.map((p) => {
            const isHost = p.socketId === meetingHostID;
            const initial = (p.userName || p.username) ? (p.userName || p.username)[0].toUpperCase() : "?";
            return (
              <div 
                key={p.socketId} 
                className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {initial}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>{p.userName || p.username || 'Participant'}</span>
                      {isHost && <Crown className="w-3 h-3 text-amber-500" />}
                      {p.isHandRaised && <span className="text-sm animate-bounce">✋</span>}
                      {p.isScreenSharing && <Monitor className="w-3 h-3 text-blue-600" />}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium">Participant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  {p.audioEnabled ? (
                    <Mic className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <MicOff className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  {p.videoEnabled ? (
                    <Video className="w-3.5 h-3.5 text-slate-600" />
                  ) : (
                    <VideoOff className="w-3.5 h-3.5 text-rose-500" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}