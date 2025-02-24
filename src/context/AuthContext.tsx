import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = supabase.auth.getSession();
    setUser(session.user);
    setIsAuthenticated(!!session.user);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session.user);
      setIsAuthenticated(!!session.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 