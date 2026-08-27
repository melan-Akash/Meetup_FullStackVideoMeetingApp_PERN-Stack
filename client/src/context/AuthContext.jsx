import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize auth state and check JWT token validation
  useEffect(() => {
    const token = localStorage.getItem('meetup_token');
    const storedUser = localStorage.getItem('meeting_guest');

    if (token) {
      // Validate token with backend /api/auth/me
      api.get('/auth/me')
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('meeting_guest', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {}
          }
        })
        .finally(() => setIsLoaded(true));
    } else if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {}
      setIsLoaded(true);
    } else {
      setUser(null);
      setIsLoaded(true);
    }
  }, []);

  // 1. Register with Password & JWT + Send Welcome Email
  const register = async (fullName, email, password, nickname, imageUrl = '') => {
    const displayName = (fullName || nickname || 'User').trim();
    const userEmail = email.trim().toLowerCase();

    try {
      const res = await api.post('/auth/register', {
        fullName: displayName,
        email: userEmail,
        password: password,
        nickname: nickname || displayName,
        imageUrl: imageUrl || null
      });

      if (res.data && res.data.token) {
        localStorage.setItem('meetup_token', res.data.token);
        localStorage.setItem('meeting_guest', JSON.stringify(res.data.user));
        setUser(res.data.user);

        // Asynchronously dispatch welcome onboarding email
        api.post('/email/send-welcome', {
          email: userEmail,
          fullName: displayName
        }).catch(err => console.warn("Welcome email notice:", err.message));

        return res.data.user;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      throw new Error(errorMsg);
    }
  };

  // 2. Login with Email & Password
  const loginWithEmail = async (email, password) => {
    const userEmail = email.trim().toLowerCase();

    try {
      const res = await api.post('/auth/login', {
        email: userEmail,
        password: password
      });

      if (res.data && res.data.token) {
        localStorage.setItem('meetup_token', res.data.token);
        localStorage.setItem('meeting_guest', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Invalid email or password";
      throw new Error(errorMsg);
    }
  };

  // 3. Fast Guest Login (Nickname only)
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
        if (res.data.token) {
          localStorage.setItem('meetup_token', res.data.token);
        }
        profile = {
          ...profile,
          ...res.data,
          fullName: res.data.fullname || nickname
        };
      }
    } catch (err) {
      console.warn("Backend login offline, using local guest profile:", err.message);
    }

    localStorage.setItem('meeting_guest', JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  // 4. Update Profile (Name, Nickname, Cloudinary Avatar, Bio)
  const updateProfile = async ({ fullName, nickname, imageUrl, bio }) => {
    if (!user) return;

    const res = await api.put('/auth/profile', {
      id: user.id,
      fullName,
      nickname,
      imageUrl,
      bio
    });

    if (res.data && res.data.user) {
      const updated = { ...user, ...res.data.user };
      setUser(updated);
      localStorage.setItem('meeting_guest', JSON.stringify(updated));
      return updated;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('meetup_token');
    localStorage.removeItem('meeting_guest');
    setUser(null);
  };

  // Upgrade Plan
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
    <AuthContext.Provider value={{ 
      user, 
      isLoaded, 
      isSignedIn: !!user, 
      login, 
      register, 
      loginWithEmail, 
      updateProfile, 
      logout, 
      updatePlan 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useMockAuth = () => useContext(AuthContext);