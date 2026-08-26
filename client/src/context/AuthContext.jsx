import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('meeting_guest');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoaded(true);
  }, []);

  const login = (nickname) => {
    const mockUser = {
      id: `guest_${Date.now()}`,
      fullName: nickname,
      email: `${nickname.toLowerCase().replace(/\s+/g, '')}@guest.local`,
      plan: "Free"
    };
    localStorage.setItem('meeting_guest', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('meeting_guest');
    setUser(null);
  };

  const updatePlan = (planName) => {
    if (user) {
      const updated = { ...user, plan: planName };
      localStorage.setItem('meeting_guest', JSON.stringify(updated));
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn: !!user, login, logout, updatePlan }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useMockAuth = () => useContext(AuthContext);