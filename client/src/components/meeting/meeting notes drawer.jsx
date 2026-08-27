import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Check } from 'lucide-react';
import { socket } from '../../config/socket';
import { toast } from 'react-hot-toast';

export default function MeetingNotesDrawer({ isOpen, onClose, roomID, currentUser }) {
  const [notes, setNotes] = useState('');
  const [lastEditedBy, setLastEditedBy] = useState('');
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const handleNotesUpdated = ({ content, updatedBy }) => {
      setNotes(content);
      if (updatedBy) {
        setLastEditedBy(updatedBy);
      }
      setIsSaved(true);
    };

    socket.on('notes-updated', handleNotesUpdated);

    return () => {
      socket.off('notes-updated', handleNotesUpdated);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const newContent = e.target.value;
    setNotes(newContent);
    setIsSaved(false);

    // Broadcast to room
    socket.emit('notes-update', {
      roomId: roomID,
      content: newContent,
      updatedBy: currentUser?.fullName || currentUser?.name || 'Someone'
    });

    setTimeout(() => setIsSaved(true), 800);
  };

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([notes || 'No meeting notes taken.'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `meeting-notes-${roomID}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Meeting notes exported as text file!");
  };

  return (
    <div className="w-80 md:w-96 border-l border-slate-200/90 bg-white/95 backdrop-blur-xl h-full flex flex-col shrink-0 shadow-lg z-30 transition-all duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0055ff]" />
          <h3 className="font-bold text-sm text-slate-900">Live Meeting Notes</h3>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Editor Body */}
      <div className="grow p-4 flex flex-col space-y-3">
        
        {/* Status Indicator */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Synced</span>
          </span>
          {lastEditedBy && (
            <span>Last edited by: <strong className="text-slate-600">{lastEditedBy}</strong></span>
          )}
        </div>

        {/* Text Area */}
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Type meeting decisions, agenda points, action items, or notes here... Everyone in the room can see and collaborate!"
          className="grow w-full p-4 rounded-2xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder-slate-400 outline-none leading-relaxed font-sans resize-none transition-all"
        />

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="w-full py-2.5 px-4 rounded-2xl bg-[#0055ff] hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Notes (.txt)</span>
        </button>

      </div>
    </div>
  );
}
