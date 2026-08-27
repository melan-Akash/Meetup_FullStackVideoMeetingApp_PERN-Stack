import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Pin, Monitor } from 'lucide-react';

export default function VideoTile({ 
  username, 
  stream, 
  isLocal, 
  audioEnabled, 
  videoEnabled, 
  avatarUrl,
  isHandRaised,
  isScreenSharing
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative bg-[#eceff1] rounded-3xl overflow-hidden border ${isHandRaised ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-300/80'} aspect-video flex items-center justify-center shadow-xs group transition-all duration-200`}>
      
      {/* Active Video / Screen Feed */}
      {videoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full ${isScreenSharing ? 'object-contain bg-slate-950 scale-x-100' : 'object-cover ' + (isLocal ? 'scale-x-[-1]' : 'scale-x-100')}`}
        />
      ) : (
        /* Camera Off Avatar Screen */
        <div className="flex flex-col items-center justify-center select-none">
          {avatarUrl ? (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md ring-4 ring-white/80">
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-md ring-4 ring-white/80">
              {getInitials(username)}
            </div>
          )}
        </div>
      )}

      {/* Top Left: Raised Hand Badge / Screen Share Badge */}
      <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
        {isHandRaised && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md animate-bounce">
            <span>✋</span>
            <span>Hand Raised</span>
          </div>
        )}

        {isScreenSharing && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-semibold shadow-xs">
            <Monitor className="w-3.5 h-3.5" />
            <span>Screen</span>
          </div>
        )}
      </div>

      {/* Top Right Overlay Actions (Pin button) */}
      <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 shadow-xs border border-white cursor-pointer">
          <Pin className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Name & Audio Status Tag */}
      <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium shadow-xs z-10">
        <span className="truncate max-w-40">
          {username}
        </span>
        {audioEnabled ? (
          <Mic className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <MicOff className="w-3.5 h-3.5 text-rose-400" />
        )}
      </div>
    </div>
  );
}