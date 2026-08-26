import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('meeting_guest');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Sync latest profile from backend database
        api.post('/auth/login', {
          id: parsed.id,
          fullName: parsed.fullName || parsed.fullname || 'Great Stack',
          email: parsed.email || 'user.greatstack@gmail.com'
        }).then(res => {
          if (res.data) {
            const synced = {
              ...parsed,
              ...res.data,
              fullName: res.data.fullname || parsed.fullName
            };
            setUser(synced);
            localStorage.setItem('meeting_guest', JSON.stringify(synced));
          }
        }).catch(err => {
          console.warn("Backend auth sync offline, using cached credentials:", err.message);
        });
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    } else {
      // Default Great Stack user profile
      const defaultUser = {
        id: "user_mock_001",
        fullName: "Great Stack",
        name: "Great Stack",
        email: "user.greatstack@gmail.com",
        plan: "PREMIUM"
      };
      setUser(defaultUser);
      localStorage.setItem('meeting_guest', JSON.stringify(defaultUser));
      
      // Auto-register default profile in backend PostgreSQL
      api.post('/auth/login', {
        id: defaultUser.id,
        fullName: defaultUser.fullName,
        email: defaultUser.email
      }).catch(() => {});
    }
    setIsLoaded(true);
  }, []);

  const login = async (nickname) => {
    const guestId = `guest_${Date.now()}`;
    const guestEmail = `${nickname.toLowerCase().replace(/\s+/g, '')}@guest.local`;
    
    let profile = {
      id: guestId,
      fullName: nickname,
      email: guestEmail,
      plan: "Free"
    };

    try {
      const res = await api.post('/auth/login', {
        id: guestId,
        fullName: nickname,
        email: guestEmail
      });
      if (res.data) {
        profile = {
          ...profile,
          ...res.data,
          fullName: res.data.fullname || nickname
        };
      }
    } catch (err) {
      console.warn("Backend login offline, falling back to local guest profile:", err.message);
    }

    localStorage.setItem('meeting_guest', JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('meeting_guest');
    setUser(null);
  };

  const updatePlan = async (planName) => {
    if (!user) return;
    const updated = { ...user, plan: planName };
    setUser(updated);
    localStorage.setItem('meeting_guest', JSON.stringify(updated));

    try {
      await api.put('/auth/upgrade', {
        id: user.id,
        plan: planName
      });
    } catch (err) {
      console.warn("Backend plan upgrade failed:", err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn: !!user, login, logout, updatePlan }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useMockAuth = () => useContext(AuthContext);