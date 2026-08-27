import React, { useState } from 'react';
import { 
  X, Sparkles, Copy, Check, Mail, 
  Loader2, RefreshCw, FileText 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../config/api';

export default function AISummaryModal({ 
  isOpen, 
  onClose, 
  meetingTitle, 
  messages = [], 
  notes = '', 
  participants = [], 
  user 
}) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/ai/summary', {
        title: meetingTitle || 'Live Meeting',
        messages,
        notes,
        participants
      });

      if (res.data && res.data.summary) {
        setSummary(res.data.summary);
        toast.success("AI Meeting Summary & Action Items generated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate AI summary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailSummary = async () => {
    if (!summary) return;
    const recipientEmail = user?.email || 'melonakash2002@gmail.com';

    setIsEmailing(true);
    try {
      await api.post('/ai/email-summary', {
        recipientEmail,
        title: meetingTitle || 'Meeting Session',
        summary,
        hostName: user?.fullName || 'Host'
      });
      toast.success(`Summary & Action Items emailed to ${recipientEmail}! ✉️`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to email summary");
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="bg-white rounded-4xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0055ff] text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span>AI Meeting Summary & Notes</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0055ff]">
                  Powered by OpenRouter
                </span>
              </h3>
              <p className="text-xs text-slate-500">Executive summary, key decisions, and action items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto grow space-y-4">
          {!summary && !isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-blue-50 text-[#0055ff] flex items-center justify-center shadow-xs">
                <FileText className="w-7 h-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="font-bold text-sm text-slate-800">Generate Instant Executive Summary</h4>
                <p className="text-xs text-slate-500">
                  AI will analyze the live chat transcript, shared notes, and participants to automatically draft Key Takeaways, Decisions, and Action Items.
                </p>
              </div>
              <button
                onClick={handleGenerateSummary}
                className="mt-2 py-3 px-6 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Summary</span>
              </button>
            </div>
          ) : isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#0055ff] animate-spin" />
              <p className="text-xs font-semibold text-slate-700">
                Analyzing meeting transcript & generating executive summary...
              </p>
              <p className="text-[11px] text-slate-400">Processing key decisions and action items</p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap selection:bg-blue-100">
              {summary}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {summary && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={handleGenerateSummary}
              disabled={isLoading}
              className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Markdown"}</span>
              </button>

              <button
                onClick={handleEmailSummary}
                disabled={isEmailing}
                className="py-2.5 px-4 rounded-xl bg-[#0055ff] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isEmailing ? "Sending..." : "Email to Host"}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
