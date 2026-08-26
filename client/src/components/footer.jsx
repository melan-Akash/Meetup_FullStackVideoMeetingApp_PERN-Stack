import React from 'react';

export default function Footer() {
  return (
    <footer className="py-6 text-center text-slate-500 text-xs mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
        <p className="font-medium">© 2026 MeetUp. All rights reserved.</p>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
          <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
