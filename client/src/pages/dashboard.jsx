import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Keyboard, ArrowRight, Shield } from 'lucide-react';
import { useMockAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useMockAuth();
  const navigate = useNavigate();
  const [meetingID, setMeetingID] = useState('');
  const [time, setTime] = useState(new Date());

  // Real-time live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const generateMeetingID = () => {
    const part = () => Math.random().toString(36).substring(2, 5);
    return `${part()}-${part()}-${part()}`;
  };

  const handleCreateMeeting = () => {
    const id = generateMeetingID();
    toast.success("Creating meeting room...");
    navigate(`/meeting/${id}`);
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (!meetingID.trim()) return;
    const cleanID = meetingID.trim().replace(/\s+/g, '');
    toast.success("Joining meeting room...");
    navigate(`/meeting/${cleanID}`);
  };

  // Date formatted: "Tuesday, Aug 25, 2026"
  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Time formatted: "04:13 PM"
  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const displayName = user?.fullName || 'Great Stack';
  const displayEmail = user?.email || 'user.greatstack@gmail.com';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-8 lg:py-16">
      
      {/* LEFT COLUMN: Hero Copy & Actions */}
      <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
        
        {/* Top Badge */}
        <div className="w-fit flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[11px] font-medium text-slate-600 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>Secure Peer-to-Peer Encryption</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-slate-900 tracking-tight leading-[1.15]">
            High quality video calls.
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#0055ff] tracking-tight leading-[1.15]">
            Built for everyone.
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed font-normal">
          Connect, collaborate, and celebrate from anywhere with ultra-low latency video, screen sharing, and real-time chat.
        </p>

        {/* Action Controls Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
          
          {/* Blue + New Meeting Button */}
          <button
            onClick={handleCreateMeeting}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0055ff] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Meeting</span>
          </button>

          {/* Join Meeting Input Pill */}
          <form 
            onSubmit={handleJoinMeeting}
            className="grow flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/90 rounded-full pl-3.5 pr-1.5 py-1.5 shadow-2xs"
          >
            <Keyboard className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Enter meeting code (e.g. abc-def-ghi)"
              value={meetingID}
              onChange={(e) => setMeetingID(e.target.value)}
              className="grow bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none px-1"
            />
            <button
              type="submit"
              disabled={!meetingID.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#64748b] hover:bg-slate-700 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
            >
              <span>Join</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

      {/* RIGHT COLUMN: Frosted Glass Clock Card */}
      <div className="lg:col-span-5 flex justify-center lg:justify-end">
        <div className="bg-white/65 backdrop-blur-xl border border-white/90 rounded-4xl p-8 sm:p-10 w-full max-w-md flex flex-col justify-between space-y-7 shadow-lg shadow-blue-900/5">
          
          {/* Greeting */}
          <h3 className="text-sm font-semibold text-slate-800">
            Hi, {displayName}
          </h3>

          {/* Large Clock Display */}
          <div className="text-center my-1">
            <h2 className="text-6xl sm:text-[64px] font-light text-slate-900 tracking-tight font-sans">
              {formattedTime}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {formattedDate}
            </p>
          </div>

          {/* Bottom Logged In & Stats Row */}
          <div className="space-y-3 pt-2">
            
            {/* User Logged in as + Badge */}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-600 px-1 font-normal">
              <span className="truncate">
                Logged in as: <span className="text-slate-800">{displayEmail}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#0055ff] text-white shrink-0">
                {user?.plan || 'PREMIUM'}
              </span>
            </div>

            {/* Monthly Meetings Stats Pill */}
            <div className="bg-white/60 border border-white/80 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-slate-600 font-normal shadow-2xs">
              <span>Monthly Meetings</span>
              <span className="text-slate-800 font-medium">3 Created (Unlimited)</span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}