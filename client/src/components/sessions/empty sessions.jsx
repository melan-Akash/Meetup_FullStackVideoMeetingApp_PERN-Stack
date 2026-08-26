import React from 'react';
import { CalendarDays, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmptySessions() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 glass-card rounded-4xl max-w-lg mx-auto my-8 shadow-xl">
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-6 relative">
        <CalendarDays className="w-10 h-10" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </div>

      <h3 className="text-lg font-black text-slate-900 mb-2">No Past Sessions Found</h3>
      <p className="text-slate-600 text-xs leading-relaxed max-w-sm mb-6">
        You haven't hosted or joined any meetings yet. Your call history, participant details, and chat records will appear here once you finish your first conference.
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
      >
        <Video className="w-4 h-4" />
        <span>Start Your First Meeting</span>
      </button>
    </div>
  );
}