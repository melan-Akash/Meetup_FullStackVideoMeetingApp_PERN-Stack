import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockAuth } from '../context/AuthContext';
import { ArrowRight, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [nickname, setNickname] = useState('');
  const { login } = useMockAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error("Please enter a valid nickname");
      return;
    }
    login(nickname.trim());
    toast.success(`Welcome, ${nickname}!`);
    navigate('/dashboard');
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative selection:bg-blue-500/20"
      style={{ backgroundImage: `url('/login_bg.png')` }}
    >
      {/* Centered Glass Card */}
      <div className="relative w-full max-w-md glass-card p-8 sm:p-10 rounded-4xl shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-white">
            <img src="/logo.svg" alt="MeetUp Logo" className="h-10 w-auto" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome to MeetUp
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
              Join or start instant HD meetings with zero setup required.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              Your Nickname
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Great Stack"
                maxLength={30}
                className="w-full pl-11 pr-4 py-3.5 glass-input rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <span>Enter App</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          Protected with end-to-end WebRTC encryption.
        </p>

      </div>
    </div>
  );
}