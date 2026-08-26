import React, { useState } from 'react';
import { X, Users, MessageSquare, Clock, Award } from 'lucide-react';

export default function SessionDetailModal({ isOpen, onClose, session }) {
  const [activeTab, setActiveTab] = useState('participants');

  if (!isOpen || !session) return null;

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="bg-white/90 backdrop-blur-2xl border border-white/80 rounded-4xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {session.title || 'Meeting Details'}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(session.createdAt)}
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
        <div className="flex border-b border-slate-200/60 bg-slate-50/50 px-6">
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'participants'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Participants ({session.participants?.length || 0})
          </button>
          
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'chats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Saved Chats ({session.messages?.length || 0})
          </button>
        </div>

        {/* Modal Content */}
        <div className="grow overflow-y-auto p-6 min-h-75 max-h-[50vh]">
          
          {activeTab === 'participants' && (
            <div className="space-y-3">
              {session.participants && session.participants.length > 0 ? (
                session.participants.map((participant, index) => {
                  const isHost = participant.id === session.host?.id;
                  const avatar = participant.imageUrl || participant.avatar;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white"
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
                    <div className="grow glass-card p-3 rounded-2xl border border-white">
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

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
          >
            Close Logs
          </button>
        </div>

      </div>
    </div>
  );
}