import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as supabaseStorage from '../utils/supabaseStorage';

export type UserRole = 'Administrator' | 'QA Engineer' | 'Product Manager' | 'Scrum Master';

interface User {
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole, organizationName: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for active session on mount
  useEffect(() => {
    const checkSession = async () => {
      console.log('[AuthContext] Checking for active session...');

      // Initialize demo data if needed
      await supabaseStorage.initializeDemoData();

      // Check if there's an active session
      const sessionUser = await supabaseStorage.checkSession();

      if (sessionUser) {
        console.log('[AuthContext] Found active session for:', sessionUser.email);
        try {
          setUser({
            email: sessionUser.email,
            name: sessionUser.name,
            role: sessionUser.role,
            organizationId: sessionUser.organizationId,
            organizationName: sessionUser.organizationName,
          });
        } catch (error) {
          console.error('[AuthContext] Error setting user:', error);
          setUser(null);
        }
      } else {
        console.log('[AuthContext] No active session found');
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    console.log('[AuthContext] Attempting login for:', email);

    try {
      const result = await supabaseStorage.login(email, password, rememberMe);

      if (result.success && result.user) {
        console.log('[AuthContext] Login successful, user:', result.user);
        setUser({
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          organizationId: result.user.organizationId,
          organizationName: result.user.organizationName,
        });
        return true;
      }

      console.log('[AuthContext] Login failed:', result.error);
      return false;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    organizationName: string
  ): Promise<boolean> => {
    console.log('[AuthContext] Attempting signup for:', email, 'organization:', organizationName);

    const users = await supabaseStorage.getData('aqms_users') || [];

    if (users.some((u: any) => u.email === email)) {
      console.log('[AuthContext] Email already exists');
      return false;
    }

    // Generate unique organization ID for new signups
    // Demo users (qa@aqms.com, pm@aqms.com, sm@aqms.com) share "demo-org"
    const isDemoUser = email.endsWith('@aqms.com');
    const organizationId = isDemoUser
      ? 'demo-org'
      : `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newUser = {
      email,
      password,
      name,
      role,
      organizationId,
      organizationName: isDemoUser ? 'AQMS Demo Organization' : organizationName,
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      title: role,
      status: 'Active',
      joinedDate: new Date(),
      isActive: true
    };

    users.push(newUser);
    await supabaseStorage.setData('aqms_users', users);

    console.log('[AuthContext] New user created with organizationId:', organizationId, 'organizationName:', organizationName);

    // Auto-login after signup
    return await login(email, password, false);
  };

  const logout = async () => {
    console.log('[AuthContext] Logging out');
    setUser(null);
    await supabaseStorage.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
