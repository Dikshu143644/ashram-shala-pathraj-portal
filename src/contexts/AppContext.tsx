import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Language = 'en' | 'mr';

export type AppRole = 'web_creator' | 'principal' | 'class_teacher' | 'clerk' | 'subject_teacher' | 'student_parent';

export interface AuthUser {
  username: string;
  role: AppRole;
  nameEn: string;
  nameMr: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: AppRole;
  setRole: (role: AppRole) => void;
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStoredAuth(): { isAuthenticated: boolean; currentUser: AuthUser | null } {
  try {
    const stored = sessionStorage.getItem('ashram_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.username && parsed.role) {
        return { isAuthenticated: true, currentUser: parsed as AuthUser };
      }
    }
  } catch {
    // Ignore parse errors
  }
  return { isAuthenticated: false, currentUser: null };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const storedAuth = getStoredAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(storedAuth.isAuthenticated);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(storedAuth.currentUser);
  const [role, setRole] = useState<AppRole>(storedAuth.currentUser?.role || 'web_creator');

  useEffect(() => {
    if (currentUser) {
      setRole(currentUser.role);
    }
  }, [currentUser]);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call server-side validation endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 429) {
        return { success: false, error: data.error || 'Too many login attempts. Please try again after 1 minute.' };
      }

      if (data.success && data.user) {
        const user: AuthUser = data.user;
        setCurrentUser(user);
        setIsAuthenticated(true);
        setRole(user.role);
        // Store in sessionStorage (never localStorage for security)
        sessionStorage.setItem('ashram_auth', JSON.stringify(user));
        return { success: true };
      }

      return { success: false, error: data.error || 'Invalid username or password' };
    } catch {
      // No client-side fallback - if server is unreachable, show error
      return { success: false, error: 'Server unreachable. Please try again later.' };
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setRole('web_creator');
    sessionStorage.removeItem('ashram_auth');
  }, []);

  return (
    <AppContext.Provider value={{ language, setLanguage, role, setRole, isAuthenticated, currentUser, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export const roleLabels: Record<AppRole, { en: string; mr: string }> = {
  web_creator: { en: 'Web Creator (Super Admin)', mr: 'वेब क्रिएटर (सुपर अॅडमिन)' },
  principal: { en: 'Principal', mr: 'मुख्याध्यापक' },
  class_teacher: { en: 'Class Teacher', mr: 'वर्गशिक्षक' },
  clerk: { en: 'Clerk (Lipik)', mr: 'लिपिक' },
  subject_teacher: { en: 'Subject Teacher', mr: 'विषय शिक्षक' },
  student_parent: { en: 'Student / Parent', mr: 'विद्यार्थी / पालक' },
};
