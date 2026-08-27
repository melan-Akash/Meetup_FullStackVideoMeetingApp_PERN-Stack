import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, MessageSquare, 
  Users, Copy, Check, PhoneOff, Monitor, Hand, Smile 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const REACTION_EMOJIS = ['🎉', '❤️', '👍', '😂', '👏', '🔥', '🚀', '💯'];

export default function ControlBar({
  roomID,
  audioEnabled,
  videoEnabled,
  isScreenSharing,
  isHandRaised,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRaiseHand,
  onSendReaction,
  onToggleChat,
  onToggleParticipants,
  isChatOpen,
  isParticipantsOpen,
  unreadCount,
  participantsCount,
  isHost,
  onLeave,
  onEndMeeting
}) {
  const [copied, setCopied] = useState(false);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const reactionPickerRef = useRef(null);

  // Close reaction picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(e.target)) {
        setIsReactionPickerOpen(false);
      }
    };
    if (isReactionPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isReactionPickerOpen]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Meeting link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmojiClick = (emoji) => {
    if (onSendReaction) {
      onSendReaction(emoji);
    }
    setIsReactionPickerOpen(false);
  };

  return (
    <div className="bg-white border-t border-slate-200/90 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0 shadow-xs z-40 relative">
      
      {/* Left section: ID + Copy Link */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-500">
          Id: <span className="font-semibold text-slate-700">{roomID}</span>
        </span>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-medium border border-slate-200/70 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Middle section: Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
        
        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-3 rounded-full transition-all border cursor-pointer ${
            audioEnabled
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-500 shadow-xs'
          }`}
          title={audioEnabled ? "Mute Mic" : "Unmute Mic"}
        >
          {audioEnabled ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-full transition-all border cursor-pointer ${
            videoEnabled
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-500 shadow-xs'
          }`}
          title={videoEnabled ? "Turn Camera Off" : "Turn Camera On"}
        >
          {videoEnabled ? <Video className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3 rounded-full transition-all border cursor-pointer ${
            isScreenSharing
              ? 'bg-[#0055ff] border-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
        >
          <Monitor className="w-4.5 h-4.5" />
        </button>

        {/* Raise Hand Toggle */}
        <button
          onClick={onToggleRaiseHand}
          className={`p-3 rounded-full transition-all border cursor-pointer ${
            isHandRaised
              ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title={isHandRaised ? "Lower Hand" : "Raise Hand"}
        >
          <Hand className="w-4.5 h-4.5" />
        </button>

        {/* Live Emoji Reactions Button & Popover */}
        <div className="relative" ref={reactionPickerRef}>
          <button
            onClick={() => setIsReactionPickerOpen(!isReactionPickerOpen)}
            className={`p-3 rounded-full transition-all border cursor-pointer ${
              isReactionPickerOpen
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title="Reactions"
          >
            <Smile className="w-4.5 h-4.5" />
          </button>

          {/* Emoji Popover */}
          {isReactionPickerOpen && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-2 shadow-xl flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-xl hover:scale-125 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Drawer Toggle */}
        <button
          onClick={onToggleChat}
          className={`p-3 rounded-full border transition-all relative cursor-pointer ${
            isChatOpen
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Toggle Chat"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Participants Panel Toggle */}
        <button
          onClick={onToggleParticipants}
          className={`p-3 rounded-full border transition-all relative cursor-pointer ${
            isParticipantsOpen
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Toggle Participants"
        >
          <Users className="w-4.5 h-4.5" />
          <span className="absolute -top-1 -right-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {participantsCount}
          </span>
        </button>

        {/* End / Leave Meeting Button */}
        <button
          onClick={isHost ? onEndMeeting : onLeave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#dc2626] hover:bg-red-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer ml-1"
        >
          <PhoneOff className="w-4 h-4" />
          <span>{isHost ? 'End Meeting' : 'Leave'}</span>
        </button>
      </div>

      {/* Right section: MeetUp Room tag */}
      <div className="hidden sm:flex items-center text-xs text-slate-400 font-medium">
        MeetUp Room
      </div>

    </div>
  );
}