import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';

export default function ParticipantsList({
  isOpen,
  onClose,
  localUser,
  localAudio,
  localVideo,
  remoteUsers,
  meetingHostID
}) {
  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900 h-full flex flex-col shrink-0 transition-all duration-300 z-30">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-200">Participants ({1 + remoteUsers.length})</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Participants Container */}
      <div className="grow overflow-y-auto p-4 space-y-3">
        
        {/* 1. Local Participant (You) */}
        <div className="flex items-center justify-between p-2.5 bg-slate-850 rounded-xl border border-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400">
              {localUser?.fullName ? localUser.fullName[0].toUpperCase() : "G"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 flex items-center gap-1">
                {localUser?.fullName || 'Guest'}
                <Crown className="w-3 h-3 text-amber-500" />
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Host (You)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {localAudio ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-rose-500" />}
            {localVideo ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5 text-rose-500" />}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800 my-2"></div>

        {/* 2. Remote Participants (Others) */}
        {remoteUsers.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-[11px]">
            Waiting for others to join...
          </div>
        ) : (
          remoteUsers.map((p) => {
            const isHost = p.socketId === meetingHostID;
            return (
              <div key={p.socketId} className="flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-850 rounded-xl transition-all border border-transparent hover:border-slate-800/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/40 flex items-center justify-center font-bold text-xs text-slate-400">
                    {(p.userName || p.username) ? (p.userName || p.username)[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      {p.userName || p.username || 'Guest'}
                      {isHost && <Crown className="w-3 h-3 text-amber-500" />}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium">Guest User</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  {p.audioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-rose-500" />}
                  {p.videoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5 text-rose-500" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}