import React from 'react';
import Navbar from './navbar.jsx';
import Footer from './footer.jsx';

export default function ProtectedLayout({ children }) {
  return (
    <div 
      className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative selection:bg-blue-500/20"
      style={{ backgroundImage: `url('/protected_bg.png')` }}
    >
      <Navbar />
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col justify-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}