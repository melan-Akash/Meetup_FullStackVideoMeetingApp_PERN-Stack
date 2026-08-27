import React, { useState } from 'react';
import { Calendar, Users, MessageSquare, Copy, Check, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SessionCard({ session, onViewDetails, onRejoin }) {
  const [copied, setCopied] = useState(false);
  const isActive = session.status === 'active';
  const isScheduled = session.status === 'scheduled';
  const meetingID = session.meetingID || session.meetingId || session.id || '';

  const displayDate = session.scheduledAt || session.scheduled_at || session.createdAt || session.created_at;
  const dateString = session.formattedDate || (displayDate ? new Date(displayDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : '');

  const participantsCount = session.participants?.length || 0;
  const messagesCount = session.messages?.length || 0;

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/meeting/${meetingID}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Meeting link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/90 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      
      {/* Top Row: Meeting ID & Status Badge */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-500">
            ID: {meetingID}
          </span>

          {isActive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>• Active</span>
            </span>
          )}

          {isScheduled && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/50">
              <Clock className="w-3 h-3" />
              <span>• Scheduled</span>
            </span>
          )}

          {!isActive && !isScheduled && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-slate-500 bg-slate-100/80 border border-slate-200/50">
              <span>• Ended</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mt-3 leading-snug">
          {session.title || "Great Stack's Meeting"}
        </h3>

        {/* Created / Scheduled Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dateString}</span>
        </div>
      </div>

      {/* Metrics Row: Participants & Messages */}
      <div className="bg-slate-50/70 border border-slate-100/80 rounded-2xl px-4 py-3 my-5 flex items-center justify-between text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{participantsCount} Participants</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>{messagesCount} Messages</span>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div>
        {isActive && (
          <div className="flex items-center gap-3">
            <button
              onClick={onViewDetails}
              className="grow py-2.5 px-4 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs text-center transition-colors cursor-pointer"
            >
              View Details
            </button>
            <button
              onClick={onRejoin}
              className="grow py-2.5 px-6 rounded-full bg-[#0055ff] hover:bg-blue-700 text-white font-semibold text-xs text-center shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
            >
              Re-join
            </button>
          </div>
        )}

        {isScheduled && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="grow py-2.5 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>
            <button
              onClick={onRejoin}
              className="grow py-2.5 px-6 rounded-full bg-[#0055ff] hover:bg-blue-700 text-white font-semibold text-xs text-center shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
            >
              Start Call
            </button>
          </div>
        )}

        {!isActive && !isScheduled && (
          <button
            onClick={onViewDetails}
            className="w-full py-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs text-center transition-colors cursor-pointer"
          >
            View Details
          </button>
        )}
      </div>

    </div>
  );
}