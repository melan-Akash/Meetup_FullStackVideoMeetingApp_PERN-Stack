import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, ArrowLeft } from 'lucide-react';

export default function WaitingLobby({ roomID, hostName = 'Host' }) {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative selection:bg-blue-500/20"
      style={{ backgroundImage: `url('/login_bg.png')` }}
    >
      {/* Frosted Glass Waiting Card */}
      <div className="relative w-full max-w-md glass-card p-8 sm:p-10 rounded-4xl shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Animated Pulse Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-[#0055ff] relative">
          <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#0055ff]"></span>
          </span>
        </div>

        {/* Title & Status */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Waiting for Host to Admit You
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            Please wait, the meeting host will let you in soon.
          </p>
        </div>

        {/* Room Details Card */}
        <div className="p-4 rounded-2xl bg-white/70 border border-white/80 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Meeting ID:</span>
            <span className="font-mono font-bold text-slate-800">{roomID}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Host:</span>
            <span className="font-medium text-slate-800">{hostName}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 px-4 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200/70 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Leave Waiting Room</span>
        </button>

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Secured Meeting Waiting Lobby</span>
        </div>

      </div>
    </div>
  );
}
