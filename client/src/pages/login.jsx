import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockAuth } from '../context/AuthContext';
import { ArrowRight, ArrowLeft, User, Mail, Sparkles, LogIn, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  // 'login' | 'register'
  const [viewMode, setViewMode] = useState('login');
  
  // Registration steps: 1 = Basic Info, 2 = Set Nickname
  const [regStep, setRegStep] = useState(1);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, loginWithEmail } = useMockAuth();
  const navigate = useNavigate();

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);
    try {
      const userProfile = await loginWithEmail(loginEmail.trim());
      toast.success(`Welcome back, ${userProfile.fullName || 'User'}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Proceed to Nickname setup
  const handleRegStep1 = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please provide both your full name and email");
      return;
    }
    // Pre-populate nickname with first name / full name
    if (!nickname.trim()) {
      setNickname(fullName.trim());
    }
    setRegStep(2);
  };

  // Step 2: Complete Registration with Nickname
  const handleRegStep2 = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error("Please choose a nickname for your video meetings");
      return;
    }
    setIsLoading(true);
    try {
      await register(fullName.trim(), email.trim(), nickname.trim());
      toast.success(`Registration complete! Welcome, ${nickname.trim()}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative selection:bg-blue-500/20"
      style={{ backgroundImage: `url('/login_bg.png')` }}
    >
      {/* Main Frosted Glass Card */}
      <div className="relative w-full max-w-md glass-card p-8 sm:p-10 rounded-4xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="p-3 bg-white/80 rounded-2xl shadow-xs border border-white">
            <img src="/logo.svg" alt="MeetUp Logo" className="h-9 w-auto" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {viewMode === 'login' ? "Welcome Back" : (regStep === 1 ? "Create Account" : "Set Your Nickname")}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              {viewMode === 'login' && "Sign in to access your meetings, history logs, and dashboard."}
              {viewMode === 'register' && regStep === 1 && "Register to start hosting HD meetings and invite peers."}
              {viewMode === 'register' && regStep === 2 && "Choose how your name will appear to others in video calls."}
            </p>
          </div>
        </div>

        {/* ----------------- 1. LOGIN VIEW ----------------- */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
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
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? "Signing in..." : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Switch to Register */}
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-500 font-normal">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('register');
                    setRegStep(1);
                  }}
                  className="font-bold text-[#0055ff] hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ----------------- 2. REGISTER VIEW (STEP 1) ----------------- */}
        {viewMode === 'register' && regStep === 1 && (
          <form onSubmit={handleRegStep1} className="space-y-4">
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
              className="w-full py-3.5 px-5 bg-[#0055ff] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span>Continue to Set Nickname</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Switch to Login */}
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-500 font-normal">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="font-bold text-[#0055ff] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ----------------- 3. REGISTER VIEW (STEP 2: SET NICKNAME) ----------------- */}
        {viewMode === 'register' && regStep === 2 && (
          <form onSubmit={handleRegStep2} className="space-y-4">
            
            {/* Nickname Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Meeting Nickname
                </label>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Account Ready
                </span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Great Stack"
                  maxLength={30}
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                  required
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-500 pl-1">
                This name will be displayed in your video tile and participant list.
              </p>
            </div>

            {/* Complete Registration Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 bg-[#0055ff] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span>{isLoading ? "Saving Profile..." : "Complete Registration & Enter App"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Back to Step 1 */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setRegStep(1)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to account details</span>
              </button>
            </div>
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