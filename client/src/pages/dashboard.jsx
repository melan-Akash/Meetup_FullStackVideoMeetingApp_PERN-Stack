import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Keyboard, ArrowRight, Shield, Clock, Copy, Check, Video } from 'lucide-react';
import { useMockAuth } from '../context/AuthContext';
import api from '../config/api';
import ScheduleModal from '../components/meeting/schedule modal.jsx';
import NewMeetingModal from '../components/meeting/new meeting modal.jsx';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useMockAuth();
  const navigate = useNavigate();
  const [meetingID, setMeetingID] = useState('');
  const [time, setTime] = useState(new Date());
  
  // Modals State
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [copiedMap, setCopiedMap] = useState({});

  // Real-time live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch upcoming scheduled meetings from backend
  const fetchUpcoming = async () => {
    const userID = user?.id || 'user_mock_001';
    try {
      const res = await api.get(`/meetings/upcoming/${userID}`);
      if (res.data && Array.isArray(res.data)) {
        setUpcomingMeetings(res.data);
      }
    } catch (err) {
      console.warn("Could not load upcoming meetings:", err.message);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, [user]);

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    const cleanId = meetingID.trim();
    if (!cleanId) {
      toast.error("Please enter a meeting code");
      return;
    }
    navigate(`/meeting/${cleanId}`);
  };

  const handleCopyLink = (mId) => {
    const link = `${window.location.origin}/meeting/${mId}`;
    navigator.clipboard.writeText(link);
    setCopiedMap((prev) => ({ ...prev, [mId]: true }));
    toast.success("Meeting link copied!");
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [mId]: false }));
    }, 2000);
  };

  // Format Time & Date for the clock card
  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200 py-4 max-w-7xl mx-auto">
      
      {/* Top Banner Section: Left Typography + Right Live Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left 7 Columns: Hero Brand Headings */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Subtle Security Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 border border-slate-200/80 text-slate-600 text-xs font-semibold shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Secure Peer-to-Peer Encryption</span>
          </div>

          {/* Main Hero Typography */}
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
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-2xl flex-wrap">
            
            {/* Blue + New Meeting Button (Opens NewMeetingModal for Title & Description) */}
            <button
              onClick={() => setIsNewMeetingOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0055ff] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Meeting</span>
            </button>

            {/* Schedule Meeting Button */}
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white/85 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 font-semibold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer shrink-0"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Schedule</span>
            </button>

            {/* Join Meeting Input Pill */}
            <form 
              onSubmit={handleJoinMeeting}
              className="grow flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/90 rounded-full pl-3.5 pr-1.5 py-1.5 shadow-2xs min-w-60"
            >
              <Keyboard className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Enter meeting code (e.g. abc-def-ghi)"
                value={meetingID}
                onChange={(e) => setMeetingID(e.target.value)}
                className="grow bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none px-1 font-medium"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-full transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Join</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>

          </div>

        </div>

        {/* Right 5 Columns: Modern Frosted Live Time & Status Card */}
        <div className="lg:col-span-5">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/90 rounded-4xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            
            {/* User Greeting */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Hi, {user?.fullName || 'Great Stack'}
              </span>
            </div>

            {/* Big Live Clock */}
            <div className="py-5 text-center sm:text-left">
              <div className="text-4xl sm:text-5xl font-mono font-bold text-slate-800 tracking-tight">
                {formattedTime}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {formattedDate}
              </p>
            </div>

            {/* Bottom Status Info Pill */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="truncate max-w-44">
                  Logged in as: <strong className="text-slate-700">{user?.email || 'kau@gmail.com'}</strong>
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                {user?.plan || 'Free'}
              </span>
            </div>

            {/* Monthly Meetings stats */}
            <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Monthly Meetings</span>
              <span className="font-semibold text-slate-700">Unlimited (Free Tier)</span>
            </div>

          </div>
        </div>

      </div>

      {/* ================= UPCOMING SCHEDULED MEETINGS SECTION ================= */}
      {upcomingMeetings.length > 0 && (
        <div className="space-y-4 pt-2">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Scheduled Meetings ({upcomingMeetings.length})</span>
            </h3>
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              + Schedule another
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMeetings.map((m) => {
              const isCopied = copiedMap[m.id];
              return (
                <div
                  key={m.id}
                  className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top: Scheduled Time & ID */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-blue-600 font-semibold bg-blue-50/80 px-2.5 py-0.5 rounded-full text-[11px]">
                        <Clock className="w-3 h-3" />
                        {new Date(m.scheduled_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        ID: {m.id}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-slate-900 text-sm mt-2.5 leading-snug">
                      {m.title || 'Scheduled Meeting'}
                    </h4>

                    {/* Description if present */}
                    {m.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {m.description}
                      </p>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleCopyLink(m.id)}
                      className="grow py-2 px-3 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{isCopied ? "Copied" : "Copy Link"}</span>
                    </button>
                    
                    <a
                      href={`/meeting/${m.id}`}
                      className="py-2 px-4 rounded-xl bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. New Meeting Title/Description Modal */}
      <NewMeetingModal
        isOpen={isNewMeetingOpen}
        onClose={() => setIsNewMeetingOpen(false)}
        user={user}
      />

      {/* 2. Schedule Meeting Modal */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        user={user}
        onScheduledSuccess={() => {
          fetchUpcoming();
        }}
      />

    </div>
  );
}