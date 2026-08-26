import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

export default function ChatPanel({ isOpen, onClose, messages, onSendMessage, currentUser }) {
  const [text, setText] = useState('');
  const chatBottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 md:w-96 border-l border-slate-200/90 bg-white/95 backdrop-blur-xl h-full flex flex-col shrink-0 shadow-lg z-30 transition-all duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-900">Live Meeting Chat</h3>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Messages Feed List */}
      <div className="grow overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs p-6 space-y-1">
            <span className="text-2xl">💬</span>
            <p className="font-medium">No messages yet.</p>
            <p className="text-[11px] text-slate-400">Say hello to get the conversation started!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const isSystem = msg.senderId === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                  <p className="font-semibold text-[11px] text-blue-600 mb-0.5">Meeting Assistant</p>
                  <p>{msg.text}</p>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender Name */}
                <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                  {isMe ? 'You' : msg.senderName}
                </span>
                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#0055ff] text-white rounded-tr-none shadow-xs'
                      : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/70'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="grow px-3.5 py-2.5 rounded-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2.5 bg-[#0055ff] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}