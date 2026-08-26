import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

export default function ChatPanel({ isOpen, onClose, messages, onSendMessage, currentUser }) {
  const [text, setText] = useState('');
  const chatBottomRef = useRef(null);

  // අලුත් පණිවිඩයක් ආ විට ස්වයංක්‍රීයව පහළට scroll වීම සඳහා
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
    <div className="w-80 md:w-96 border-l border-slate-800 bg-slate-900 h-full flex flex-col shrink-0 transition-all duration-300 z-30">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-200">Live Meeting Chat</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Messages Feed List */}
      <div className="grow overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-6">
            <span className="mb-2">💬</span>
            No messages yet. Say hello to get started!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender Name */}
                <span className="text-[10px] text-slate-500 mb-1 px-1 font-medium">
                  {isMe ? 'You' : msg.senderName}
                </span>
                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
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
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="grow p-2.5 rounded-xl bg-slate-850 border border-slate-850 focus:border-slate-700/60 focus:outline-none text-xs text-white"
          />
          <button
            type="submit"
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}