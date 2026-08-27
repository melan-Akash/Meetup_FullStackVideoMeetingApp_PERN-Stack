import React, { useState } from 'react';
import { X, Mail, Send, Sparkles, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../config/api';

export default function InviteEmailModal({ isOpen, onClose, roomID, hostName = 'Host' }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/email/send-instant-invite', {
        recipientEmail: email.trim(),
        meetingId: roomID,
        hostName
      });

      setIsSent(true);
      toast.success(`Instant invitation email sent to ${email.trim()}! ✉️`);
      setTimeout(() => {
        setIsSent(false);
        setEmail('');
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send email invite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0055ff]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Invite via Email</h3>
              <p className="text-[11px] text-slate-500">Send an instant invitation to a friend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Recipient's Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full pl-9.5 pr-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
                required
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSent}
            className="w-full py-3 px-4 bg-[#0055ff] hover:bg-blue-700 disabled:bg-emerald-600 text-white font-semibold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSent ? (
              <>
                <Check className="w-4 h-4" />
                <span>Invitation Email Sent!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? "Sending Email..." : "Send Instant Invite"}</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
