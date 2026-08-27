import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, History, Sparkles, LogOut, Menu, X, User } from 'lucide-react';
import { useMockAuth } from '../context/AuthContext';
import ProfileModal from './profile/profile modal.jsx';

export default function Navbar() {
  const { user, logout } = useMockAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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

  const displayName = user?.fullName || user?.name || 'Great Stack';
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
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

          {/* Right: Welcome Name & User Cloudinary Avatar */}
          <div className="hidden md:flex items-center gap-3 relative">
            <span className="text-xs text-slate-600 font-normal">
              Welcome, <span className="font-semibold text-slate-800">{displayName}</span>
            </span>

            {/* User Avatar Circle */}
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-xs bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-transform hover:scale-105"
            >
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(displayName)}</span>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 top-11 bg-white border border-slate-200/90 rounded-2xl w-60 p-4 shadow-xl flex flex-col gap-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="border-b border-slate-100 pb-2.5 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(displayName)}</span>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email || 'user@gmail.com'}</p>
                    <span className="mt-1 inline-block px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                      {user?.plan || 'Free'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile Settings & Avatar</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
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
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{displayName}</p>
                <p className="text-[10px] text-slate-500">{user?.email || 'user@gmail.com'}</p>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Edit Profile
              </button>
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

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}