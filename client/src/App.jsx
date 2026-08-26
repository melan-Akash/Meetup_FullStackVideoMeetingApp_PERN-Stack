import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/protected route.jsx';
import ProtectedLayout from './components/protected layout.jsx';

import Login from './pages/login.jsx';
import Dashboard from './pages/dashboard.jsx';
import Sessions from './pages/sessions.jsx';
import Pricing from './pages/pricing.jsx';
import MeetingRoom from './pages/meeting room.jsx';

export default function App() {
  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          }
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        } />

        <Route path="/sessions" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Sessions />
            </ProtectedLayout>
          </ProtectedRoute>
        } />

        <Route path="/pricing" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Pricing />
            </ProtectedLayout>
          </ProtectedRoute>
        } />

        <Route path="/meeting/:id" element={
          <ProtectedRoute>
            <MeetingRoom />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}