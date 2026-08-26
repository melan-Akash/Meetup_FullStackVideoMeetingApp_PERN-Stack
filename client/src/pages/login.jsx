import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockAuth } from '../context/AuthContext';
import { ArrowRight, User, Mail, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login' | 'guest'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, loginWithEmail, login } = useMockAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.trim() || (!fullName.trim() && !nickname.trim())) {
      toast.error("Please fill in your name and email address");
      return;
    }
    setIsLoading(true);
    try {
      const displayName = fullName.trim() || nickname.trim();
      await register(displayName, email.trim(), nickname.trim());
      toast.success(`Welcome to MeetUp, ${displayName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);
    try {
      const displayName = fullName.trim() || email.split('@')[0];
      await loginWithEmail(email.trim(), displayName);
      toast.success(`Welcome back, ${displayName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error("Please enter a valid nickname");
      return;
    }
    setIsLoading(true);
    try {
      await login(nickname.trim());
      toast.success(`Welcome, ${nickname}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error("Guest login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative selection:bg-blue-500/20"
      style={{ backgroundImage: `url('/login_bg.png')` }}
    >
      {/* Centered Glass Card */}
      <div className="relative w-full max-w-md glass-card p-7 sm:p-9 rounded-4xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="p-3 bg-white/80 rounded-2xl shadow-xs border border-white">
            <img src="/logo.svg" alt="MeetUp Logo" className="h-9 w-auto" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {authMode === 'register' && "Create an Account"}
              {authMode === 'login' && "Welcome Back"}
              {authMode === 'guest' && "Join as Guest"}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              {authMode === 'register' && "Sign up to host instant HD video meetings and save sessions."}
              {authMode === 'login' && "Sign in to access your dashboard, past sessions, and meetings."}
              {authMode === 'guest' && "Enter a quick nickname to join or start calls without an account."}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-100/70 border border-slate-200/60 rounded-full">
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
          
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('guest')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'guest'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guest</span>
          </button>
        </div>

        {/* 1. REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 bg-[#0055ff] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span>{isLoading ? "Creating account..." : "Create Account & Continue"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        {/* 2. SIGN IN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Your Name / Nickname (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Great Stack"
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 bg-[#0055ff] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span>{isLoading ? "Signing in..." : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        {/* 3. GUEST NICKNAME FORM */}
        {authMode === 'guest' && (
          <form onSubmit={handleGuest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Enter Nickname
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Great Stack"
                  maxLength={30}
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 bg-[#0055ff] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span>{isLoading ? "Entering..." : "Continue as Guest"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 font-medium pt-1">
          Protected with end-to-end WebRTC encryption.
        </p>

      </div>
    </div>
  );
}