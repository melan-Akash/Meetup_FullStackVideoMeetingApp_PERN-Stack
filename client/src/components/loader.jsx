import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <span className="absolute inline-flex h-16 w-16 rounded-full border-2 border-blue-500/20 animate-pulse"></span>
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
        Loading Session...
      </p>
    </div>
  );
}