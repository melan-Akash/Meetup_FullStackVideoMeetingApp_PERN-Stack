import React, { useState } from 'react';
import { 
  X, Users, MessageSquare, Clock, Award, 
  Sparkles, Copy, Check, Mail, Loader2, FileText 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../config/api';

export default function SessionDetailModal({ isOpen, onClose, session, user }) {
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' | 'chats' | 'ai-summary'
  const [aiSummary, setAiSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  if (!isOpen || !session) return null;

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleGenerateAISummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await api.post('/ai/summary', {
        title: session.title || 'Meeting Session',
        messages: session.messages || [],
        notes: session.description || '',
        participants: session.participants || []
      });

      if (res.data && res.data.summary) {
        setAiSummary(res.data.summary);
        toast.success("AI Summary & Action Items generated!");
      }
    } catch (err) {
      toast.error("Failed to generate AI summary");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleCopySummary = () => {
    if (!aiSummary) return;
    navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailSummary = async () => {
    if (!aiSummary) return;
    const recipientEmail = user?.email || session.host?.email || 'melonakash2002@gmail.com';

    setIsEmailing(true);
    try {
      await api.post('/ai/email-summary', {
        recipientEmail,
        title: session.title || 'Meeting Session',
        summary: aiSummary,
        hostName: session.host?.name || 'Host'
      });
      toast.success(`Summary emailed to ${recipientEmail}! ✉️`);
    } catch (err) {
      toast.error("Failed to email summary");
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-4xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {session.title || 'Meeting Details'}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(session.createdAt || session.scheduledAt)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Control Bar */}
        <div className="flex border-b border-slate-200/60 bg-slate-50/50 px-6 gap-2">
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'participants'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Participants ({session.participants?.length || 0})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'chats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Saved Chats ({session.messages?.length || 0})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai-summary');
              if (!aiSummary) handleGenerateAISummary();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'ai-summary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Executive Summary</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="grow overflow-y-auto p-6 min-h-75 max-h-[50vh]">
          
          {/* 1. PARTICIPANTS */}
          {activeTab === 'participants' && (
            <div className="space-y-3">
              {session.participants && session.participants.length > 0 ? (
                session.participants.map((participant, index) => {
                  const isHost = participant.id === session.host?.id;
                  const avatar = participant.imageUrl || participant.avatar;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-linear-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                          {avatar ? (
                            <img src={avatar} alt={participant.name} className="w-full h-full object-cover" />
                          ) : (
                            participant.name ? participant.name.charAt(0).toUpperCase() : '?'
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {participant.name}
                            {isHost && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full">
                                <Award className="w-2.5 h-2.5" /> Host
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500">{participant.email}</p>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Joined: {participant.joinedAt || 'N/A'}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">No participant details saved.</div>
              )}
            </div>
          )}

          {/* 2. CHATS */}
          {activeTab === 'chats' && (
            <div className="space-y-3">
              {session.messages && session.messages.length > 0 ? (
                session.messages.map((msg, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {msg.senderAvatar ? (
                        <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                      ) : (
                        msg.senderName ? msg.senderName.charAt(0).toUpperCase() : '?'
                      )}
                    </div>
                    <div className="grow bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-900">{msg.senderName}</span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{msg.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">No messages were sent during this meeting.</div>
              )}
            </div>
          )}

          {/* 3. AI EXECUTIVE SUMMARY */}
          {activeTab === 'ai-summary' && (
            <div className="space-y-4">
              {isLoadingSummary ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#0055ff] animate-spin" />
                  <p className="text-xs font-semibold text-slate-800">
                    Generating OpenRouter AI Executive Summary...
                  </p>
                  <p className="text-[11px] text-slate-400">Analyzing discussion transcripts & decisions</p>
                </div>
              ) : aiSummary ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {aiSummary}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <button
                    onClick={handleGenerateAISummary}
                    className="py-2.5 px-5 bg-[#0055ff] hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Summary</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-between">
          {activeTab === 'ai-summary' && aiSummary ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Markdown"}</span>
              </button>
              <button
                onClick={handleEmailSummary}
                disabled={isEmailing}
                className="py-2 px-3 bg-[#0055ff] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isEmailing ? "Emailing..." : "Email to Host"}</span>
              </button>
            </div>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
          >
            Close Logs
          </button>
        </div>

      </div>
    </div>
  );
}