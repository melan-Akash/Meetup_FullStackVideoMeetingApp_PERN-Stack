import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, History, Sparkles, LogOut, Menu, X } from 'lucide-react';
import { useMockAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useMockAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'Sessions', path: '/sessions', icon: History },
    { name: 'Pricing', path: '/pricing', icon: Sparkles },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.fullName || 'Great Stack';

  return (
    <header className="sticky top-0 z-40 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl px-5 py-2.5 flex items-center justify-between shadow-xs">
        
        {/* Left: Brand Logo & Title */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <img 
            src="/logo.svg" 
            alt="MeetUp Logo" 
            className="h-6 w-auto object-contain" 
          />
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            MeetUp<span className="text-slate-900">.</span>
          </span>
        </div>

        {/* Middle: Navigation Tabs Pill Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1 rounded-full border border-slate-200/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Welcome Name & User Avatar */}
        <div className="hidden md:flex items-center gap-3 relative">
          <span className="text-xs text-slate-600 font-normal">
            Welcome, <span className="font-semibold text-slate-800">{displayName}</span>
          </span>

          {/* User Avatar Circle */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
          >
            <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" fill="#0f9d58" />
              <path d="M16 4C9.37 4 4 9.37 4 16C4 22.63 9.37 28 16 28C22.63 28 28 22.63 28 16C28 9.37 22.63 4 16 4ZM16 8C18.21 8 20 9.79 20 12C20 14.21 18.21 16 16 16C13.79 16 12 14.21 12 12C12 9.79 13.79 8 16 8ZM16 25.2C13 25.2 10.36 23.68 8.8 21.36C8.76 18.98 13.6 17.68 16 17.68C18.39 17.68 23.24 18.98 23.2 21.36C21.64 23.68 19 25.2 16 25.2Z" fill="#ffffff" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-10 bg-white border border-slate-200/90 rounded-2xl w-56 p-4 shadow-xl flex flex-col gap-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-slate-100 pb-2">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'user.greatstack@gmail.com'}</p>
                <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                  {user?.plan || 'PREMIUM'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-semibold text-rose-500 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-600 rounded-lg hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="pb-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900">{displayName}</p>
            <p className="text-[10px] text-slate-500">{user?.email || 'user.greatstack@gmail.com'}</p>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            );
          })}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 bg-rose-50 rounded-xl mt-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}