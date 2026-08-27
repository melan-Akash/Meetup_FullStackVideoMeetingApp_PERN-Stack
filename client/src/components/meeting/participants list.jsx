import React from 'react';
import { 
  X, Mic, MicOff, Video, VideoOff, Crown, Monitor, 
  VolumeX, Lock, Unlock, Shield, UserX, Check, Mail 
} from 'lucide-react';

export default function ParticipantsList({
  isOpen,
  onClose,
  localUser,
  localAudio,
  localVideo,
  localIsHandRaised,
  localIsScreenSharing,
  remoteUsers,
  isHost,
  isRoomLocked,
  isWaitingRoomEnabled,
  waitingUsers = [],
  onMuteAll,
  onMuteParticipant,
  onKickParticipant,
  onToggleLockMeeting,
  onToggleWaitingRoom,
  onAdmitUser,
  onDenyUser,
  onOpenEmailInvite
}) {
  if (!isOpen) return null;

  return (
    <div className="w-80 md:w-88 border-l border-slate-200/90 bg-white/95 backdrop-blur-xl h-full flex flex-col shrink-0 shadow-lg z-30 transition-all duration-300">
      
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

      {/* Host Controls & Email Invite Bar */}
      <div className="p-3 bg-slate-50/80 border-b border-slate-100 space-y-2">
        {isHost && (
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            {/* Mute All Button */}
            <button
              onClick={onMuteAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Mute everyone in the meeting"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Mute All</span>
            </button>

            {/* Lock Meeting Toggle */}
            <button
              onClick={onToggleLockMeeting}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer ${
                isRoomLocked 
                  ? 'bg-amber-50 border-amber-300 text-amber-700' 
                  : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
              title={isRoomLocked ? "Unlock Meeting" : "Lock Meeting (Prevent new joins)"}
            >
              {isRoomLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isRoomLocked ? "Locked" : "Lock"}</span>
            </button>

            {/* Waiting Room Toggle */}
            <button
              onClick={onToggleWaitingRoom}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer ${
                isWaitingRoomEnabled 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
              title={isWaitingRoomEnabled ? "Disable Waiting Room" : "Enable Waiting Room (Admit guests manually)"}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isWaitingRoomEnabled ? "Lobby: ON" : "Lobby: OFF"}</span>
            </button>
          </div>
        )}

        {/* Email Invite Quick Button */}
        {onOpenEmailInvite && (
          <button
            onClick={onOpenEmailInvite}
            className="w-full py-2 px-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-blue-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Invite Friend via Email</span>
          </button>
        )}
      </div>

      {/* Participants Container */}
      <div className="grow overflow-y-auto p-4 space-y-3">
        
        {/* ================= WAITING ROOM QUEUE ================= */}
        {isHost && waitingUsers && waitingUsers.length > 0 && (
          <div className="space-y-2 p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-600" />
                Waiting Room ({waitingUsers.length})
              </span>
            </div>

            {waitingUsers.map((w) => (
              <div key={w.socketId} className="flex items-center justify-between p-2 bg-white/90 rounded-xl border border-amber-100 shadow-2xs">
                <div className="truncate pr-2">
                  <p className="text-xs font-bold text-slate-800 truncate">{w.userName}</p>
                  <p className="text-[9px] text-slate-400">Wants to join</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onAdmitUser(w.socketId)}
                    className="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-0.5"
                  >
                    <Check className="w-3 h-3" />
                    <span>Admit</span>
                  </button>
                  <button
                    onClick={() => onDenyUser(w.socketId)}
                    className="p-1 px-2 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 1. Local Participant (You) ================= */}
        <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0055ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {localUser?.fullName ? localUser.fullName[0].toUpperCase() : "G"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>{localUser?.fullName || 'Guest'}</span>
                {isHost && <Crown className="w-3 h-3 text-amber-500" />}
                {localIsHandRaised && <span className="text-sm">✋</span>}
                {localIsScreenSharing && <Monitor className="w-3 h-3 text-blue-600" />}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{isHost ? 'Host (You)' : 'Participant (You)'}</p>
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

        {/* ================= 2. Remote Participants (Others) ================= */}
        {remoteUsers.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Waiting for others to join...
          </div>
        ) : (
          remoteUsers.map((p) => {
            const initial = (p.userName || p.username) ? (p.userName || p.username)[0].toUpperCase() : "?";
            return (
              <div 
                key={p.socketId} 
                className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl transition-colors border border-slate-100 group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {initial}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1 truncate">
                      <span className="truncate">{p.userName || p.username || 'Participant'}</span>
                      {p.isHost && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                      {p.isHandRaised && <span className="text-sm animate-bounce shrink-0">✋</span>}
                      {p.isScreenSharing && <Monitor className="w-3 h-3 text-blue-600 shrink-0" />}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium">Participant</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
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

                  {/* Host Action Controls (Mute & Kick) */}
                  {isHost && (
                    <div className="flex items-center gap-1 pl-1 ml-1 border-l border-slate-200">
                      <button
                        onClick={() => onMuteParticipant(p.socketId)}
                        className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Mute Participant"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onKickParticipant(p.socketId)}
                        className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove from meeting"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
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