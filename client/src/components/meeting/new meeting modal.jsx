import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Video, Sparkles, ArrowRight, Mic, MicOff, VideoOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../config/api';

export default function NewMeetingModal({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAudio, setStartAudio] = useState(true);
  const [startVideo, setStartVideo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartMeeting = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const part = () => Math.random().toString(36).substring(2, 5);
    const meetingID = `${part()}-${part()}-${part()}`;
    const meetingTitle = title.trim() || `${user?.fullName || 'Great Stack'}'s Meeting`;

    try {
      // 1. Create meeting in database
      await api.post('/meetings/create', {
        meetingID,
        title: meetingTitle,
        description: description.trim(),
        hostID: user?.id || 'user_mock_001'
      });

      toast.success("Meeting room created! Joining now... 🚀");
      onClose();
      navigate(`/meeting/${meetingID}`);
    } catch (err) {
      console.warn("Backend create note:", err.message);
      // Even if offline, navigate to room
      navigate(`/meeting/${meetingID}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Card */}
      <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-4xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-blue-50/50 via-white to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0055ff] text-white shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Start New Meeting</h3>
              <p className="text-xs text-slate-500">Set topic and agenda before starting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleStartMeeting} className="p-6 space-y-4">
          
          {/* Meeting Title */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Meeting Title / Topic
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. ${user?.fullName || 'Weekly'} Strategy Sync`}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
              autoFocus
            />
          </div>

          {/* Meeting Description / Agenda */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Description / Agenda <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this meeting about? (e.g. Sprint planning, budget review)"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-medium resize-none"
            />
          </div>

          {/* Quick Audio / Video Presets */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Initial Setup</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStartAudio(!startAudio)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  startAudio ? 'bg-white border-slate-200 text-slate-700' : 'bg-rose-50 border-rose-200 text-rose-600'
                }`}
                title={startAudio ? "Microphone ON" : "Microphone MUTED"}
              >
                {startAudio ? <Mic className="w-3.5 h-3.5 text-emerald-600" /> : <MicOff className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{startAudio ? 'Mic ON' : 'Muted'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStartVideo(!startVideo)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  startVideo ? 'bg-white border-slate-200 text-slate-700' : 'bg-rose-50 border-rose-200 text-rose-600'
                }`}
                title={startVideo ? "Camera ON" : "Camera OFF"}
              >
                {startVideo ? <Video className="w-3.5 h-3.5 text-blue-600" /> : <VideoOff className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{startVideo ? 'Cam ON' : 'Off'}</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="grow sm:grow-0 px-6 py-3 bg-[#0055ff] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Room...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Meeting Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
