import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, FileText, Download, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ChatPanel({ isOpen, onClose, messages, onSendMessage, currentUser }) {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit to 5MB for browser socket transfer
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        data: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    if (onSendMessage) {
      onSendMessage(text, selectedFile);
    }

    setText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            <p className="text-[11px] text-slate-400">Say hello or share files to get started!</p>
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
                <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                  {isMe ? 'You' : msg.senderName}
                </span>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    isMe
                      ? 'bg-[#0055ff] text-white rounded-tr-none shadow-xs'
                      : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/70'
                  }`}
                >
                  {/* Text Content */}
                  {msg.text && <p>{msg.text}</p>}

                  {/* File Attachment Card */}
                  {msg.file && (
                    <div className={`p-2 rounded-xl flex items-center gap-2 ${isMe ? 'bg-white/20' : 'bg-white border border-slate-200 shadow-2xs'}`}>
                      {msg.file.type?.startsWith('image/') ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <img src={msg.file.data} alt={msg.file.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}

                      <div className="truncate grow pr-1 text-left">
                        <p className="text-[11px] font-bold truncate">{msg.file.name}</p>
                        <p className="text-[9px] opacity-75">{msg.file.size}</p>
                      </div>

                      <a
                        href={msg.file.data}
                        download={msg.file.name}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                          isMe ? 'hover:bg-white/30 text-white' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                        title="Download Attachment"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Selected File Preview Box */}
      {selectedFile && (
        <div className="mx-4 p-2 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 truncate pr-2">
            <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold truncate">{selectedFile.name}</span>
            <span className="text-[10px] text-blue-600 shrink-0">({selectedFile.size})</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="p-1 hover:bg-blue-100 rounded-full text-blue-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Message Input Bar */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-1.5">
          
          {/* File Upload Input & Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
            title="Attach Image or Document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder="Type message or share files..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="grow px-3.5 py-2.5 rounded-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() && !selectedFile}
            className="p-2.5 bg-[#0055ff] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}