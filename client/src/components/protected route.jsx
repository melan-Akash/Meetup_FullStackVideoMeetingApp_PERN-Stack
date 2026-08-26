import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMockAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useMockAuth();

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 text-xs font-semibold uppercase tracking-wider animate-pulse">
          Authenticating...
        </span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}