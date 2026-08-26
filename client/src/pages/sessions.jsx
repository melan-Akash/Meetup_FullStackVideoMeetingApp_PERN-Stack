import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { dummySessions } from '../assets/assets';
import { useMockAuth } from '../context/AuthContext';
import api from '../config/api';
import SessionCard from '../components/sessions/session card.jsx';
import SessionDetailModal from '../components/sessions/session detail model.jsx';
import EmptySessions from '../components/sessions/empty sessions.jsx';

export default function Sessions() {
  const { user } = useMockAuth();
  const [sessions, setSessions] = useState(dummySessions);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSessions = async () => {
      const userID = user?.id || 'user_mock_001';
      try {
        const res = await api.get(`/meetings/user/${userID}`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setSessions(res.data);
        } else {
          setSessions(dummySessions);
        }
      } catch (err) {
        console.warn("Could not fetch sessions from backend, displaying default sessions:", err.message);
        setSessions(dummySessions);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSessions();
  }, [user]);

  const handleRejoin = (meetingID) => {
    navigate(`/meeting/${meetingID}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 py-4 max-w-7xl mx-auto">
      
      {/* Top Back to Dashboard Link */}
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Go to Dashboard</span>
      </Link>

      {/* Main Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Meeting sessions.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          Review your past and active meeting history, participant logs, and chat transcripts.
        </p>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <EmptySessions />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {sessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onViewDetails={() => setSelected(session)}
              onRejoin={() => handleRejoin(session.meetingID || session.meetingId)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <SessionDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        session={selected}
      />
    </div>
  );
}