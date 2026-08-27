import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Sparkles, Send, Bot, User, 
  Loader2, Lightbulb, Mail, CheckSquare, RefreshCw 
} from 'lucide-react';
import api from '../../config/api';

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: "Brainstorm 3 Ideas", prompt: "Give me 3 creative brainstorming ideas for this topic." },
  { icon: Mail, label: "Draft Follow-up Email", prompt: "Draft a professional follow-up email summarizing our meeting." },
  { icon: CheckSquare, label: "List Next Steps", prompt: "What are the recommended action items and next steps for us?" }
];

export default function AICoPilotDrawer({
  isOpen,
  onClose,
  roomID,
  meetingTitle,
  notes = '',
  messages = []
}) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content: `Hello! 👋 I'm your **MeetUp AI Co-Pilot**.\nHow can I assist you in this meeting today? You can ask me to draft emails, brainstorm ideas, or summarize discussion topics.`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (userText) => {
    const textToSend = userText || query;
    if (!textToSend.trim() || isLoading) return;

    const newHistory = [...history, { role: 'user', content: textToSend.trim() }];
    setHistory(newHistory);
    setQuery('');
    setIsLoading(true);

    try {
      const recentChat = messages.slice(-10).map(m => `${m.senderName}: ${m.text}`).join('\n');
      const res = await api.post('/ai/copilot', {
        query: textToSend.trim(),
        meetingContext: {
          roomID,
          title: meetingTitle || 'Live Meeting',
          notes,
          recentChat
        },
        history: newHistory
      });

      if (res.data && res.data.response) {
        setHistory(prev => [...prev, { role: 'assistant', content: res.data.response }]);
      }
    } catch (err) {
      setHistory(prev => [
        ...prev, 
        { role: 'assistant', content: "⚠️ Sorry, I encountered an issue reaching OpenRouter AI. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 md:w-96 border-l border-slate-200/90 bg-white/95 backdrop-blur-xl h-full flex flex-col shrink-0 shadow-lg z-30 transition-all duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#0055ff] text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">AI Co-Pilot</h3>
            <p className="text-[10px] text-slate-500">Live In-Meeting Assistant</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="grow overflow-y-auto p-4 space-y-3.5">
        {history.map((msg, index) => {
          const isAI = msg.role === 'assistant';
          return (
            <div key={index} className={`flex gap-2.5 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-xs ${
                isAI ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
              }`}>
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[82%] whitespace-pre-wrap ${
                isAI 
                  ? 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/60' 
                  : 'bg-[#0055ff] text-white rounded-tr-none shadow-xs'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-100/90 border border-slate-200/60 rounded-tl-none flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Action Chips */}
      <div className="px-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_PROMPTS.map((qp, i) => {
          const Icon = qp.icon;
          return (
            <button
              key={i}
              onClick={() => handleSend(qp.prompt)}
              className="py-1 px-2.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/70 text-slate-600 text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            >
              <Icon className="w-3 h-3" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Ask AI Co-Pilot anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="grow px-3.5 py-2.5 rounded-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="p-2.5 bg-[#0055ff] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

    </div>
  );
}
