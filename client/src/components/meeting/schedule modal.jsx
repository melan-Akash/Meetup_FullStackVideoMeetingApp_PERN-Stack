import React, { useState } from 'react';
import { 
  X, Calendar, Clock, Sparkles, Copy, Check, 
  Share2, ArrowRight, Video, MessageCircle, Mail 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../config/api';

export default function ScheduleModal({ isOpen, onClose, user, onScheduledSuccess }) {
  const [title, setTitle] = useState('');
  // Default to tomorrow at 10:00 AM
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    // Format YYYY-MM-DDTHH:mm for datetime-local input
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [scheduledAt, setScheduledAt] = useState(getDefaultDateTime);
  const [duration, setDuration] = useState(30); // in minutes
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Result state after scheduling
  const [scheduledResult, setScheduledResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  if (!isOpen) return null;

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error("Please select a date and time");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/meetings/schedule', {
        title: title.trim() || `${user?.fullName || 'Great Stack'}'s Meeting`,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration,
        description: description.trim(),
        hostID: user?.id || 'user_mock_001'
      });

      if (res.data && res.data.success) {
        setScheduledResult(res.data);
        toast.success("Meeting scheduled & invite link generated!");
        if (onScheduledSuccess) {
          onScheduledSuccess(res.data.meeting);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to schedule meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!scheduledResult?.meetingLink) return;
    navigator.clipboard.writeText(scheduledResult.meetingLink);
    setCopiedLink(true);
    toast.success("Meeting link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyInvitation = () => {
    if (!scheduledResult?.invitationText) return;
    navigator.clipboard.writeText(scheduledResult.invitationText);
    setCopiedInvite(true);
    toast.success("Full invitation text copied!");
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!scheduledResult?.invitationText) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(scheduledResult.invitationText)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    if (!scheduledResult?.meeting) return;
    const subject = encodeURIComponent(`Invitation: ${scheduledResult.meeting.title}`);
    const body = encodeURIComponent(scheduledResult.invitationText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleResetAndClose = () => {
    setScheduledResult(null);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Card */}
      <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-4xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {scheduledResult ? "Meeting Invitation Ready" : "Schedule a Meeting"}
              </h3>
              <p className="text-xs text-slate-500">
                {scheduledResult ? "Share this link with your participants" : "Set date, time, and generate invitation link"}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* ================= SCREEN 1: SCHEDULE FORM ================= */}
          {!scheduledResult ? (
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              
              {/* Meeting Topic */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Meeting Topic / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g. ${user?.fullName || 'Weekly'} Strategy Sync`}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
                />
              </div>

              {/* Date & Time Picker */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Date & Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-900 outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Duration Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Estimated Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        duration === mins
                          ? 'bg-[#0055ff] border-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {mins < 60 ? `${mins} min` : '1 hour'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description / Agenda */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Agenda / Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add meeting agenda, discussion topics, or preparation notes..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-medium resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-5 bg-[#0055ff] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? "Scheduling Meeting..." : "Schedule Meeting & Get Link"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            /* ================= SCREEN 2: INVITATION READY ================= */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Scheduled Summary Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    Scheduled Conference
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                    {scheduledResult.meeting?.duration || 30} mins
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {scheduledResult.meeting?.title}
                </h4>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {new Date(scheduledResult.meeting?.scheduled_at).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </p>
              </div>

              {/* Shareable Link Box */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Meeting Invitation Link
                </label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-xs font-mono text-slate-700 px-2 truncate grow">
                    {scheduledResult.meetingLink}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Full Invitation & Sharing */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyInvitation}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200/70 transition-colors cursor-pointer"
                >
                  {copiedInvite ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
                  <span>{copiedInvite ? "Invitation Copied!" : "Copy Full Invitation Details"}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200/60 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareEmail}
                    className="py-2.5 px-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-200/60 transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Invite</span>
                  </button>
                </div>
              </div>

              {/* Launch Meeting Now Option */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Done
                </button>
                <a
                  href={`/meeting/${scheduledResult.meeting?.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0055ff] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Call Now</span>
                </a>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
