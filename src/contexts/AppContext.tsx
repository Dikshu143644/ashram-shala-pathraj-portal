import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Language = 'en' | 'mr';

export type AppRole = 'web_creator' | 'principal' | 'class_teacher' | 'clerk' | 'subject_teacher' | 'student_parent';

export interface AuthUser {
  username: string;
  role: AppRole;
  nameEn: string;
  nameMr: string;
}

interface OperationResult {
  success: boolean;
  error?: string;
}

interface BeginLoginResult extends OperationResult {
  challengeToken?: string;
  maskedEmail?: string;
}

interface SendOtpResult extends OperationResult {
  maskedEmail?: string;
  resendAfterSeconds?: number;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: AppRole;
  setRole: (role: AppRole) => void;
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  beginLogin: (username: string, password: string) => Promise<BeginLoginResult>;
  sendOtp: (challengeToken: string) => Promise<SendOtpResult>;
  verifyOtp: (challengeToken: string, code: string) => Promise<OperationResult>;
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
    // Ignore invalid browser session data.
  }
  return { isAuthenticated: false, currentUser: null };
}

async function readApiResponse(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json() as Record<string, unknown>;
  } catch {
    return {};
  }
}

function apiError(data: Record<string, unknown>, fallback: string): string {
  return typeof data.error === 'string' ? data.error : fallback;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const storedAuth = getStoredAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(storedAuth.isAuthenticated);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(storedAuth.currentUser);
  const [role, setRole] = useState<AppRole>(storedAuth.currentUser?.role || 'web_creator');

  useEffect(() => {
    if (currentUser) setRole(currentUser.role);
  }, [currentUser]);

  const beginLogin = useCallback(async (username: string, password: string): Promise<BeginLoginResult> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await readApiResponse(response);

      if (
        response.ok &&
        data.success === true &&
        data.otpRequired === true &&
        typeof data.challengeToken === 'string'
      ) {
        return {
          success: true,
          challengeToken: data.challengeToken,
          maskedEmail: typeof data.maskedEmail === 'string' ? data.maskedEmail : undefined,
        };
      }

      return { success: false, error: apiError(data, 'Invalid username or password') };
    } catch {
      return { success: false, error: 'Server unreachable. Please try again later.' };
    }
  }, []);

  const sendOtp = useCallback(async (challengeToken: string): Promise<SendOtpResult> => {
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeToken }),
      });
      const data = await readApiResponse(response);

      if (response.ok && data.success === true) {
        return {
          success: true,
          maskedEmail: typeof data.maskedEmail === 'string' ? data.maskedEmail : undefined,
          resendAfterSeconds: typeof data.resendAfterSeconds === 'number' ? data.resendAfterSeconds : 60,
        };
      }

      return { success: false, error: apiError(data, 'Could not send the verification email.') };
    } catch {
      return { success: false, error: 'Server unreachable. Please try again later.' };
    }
  }, []);

  const verifyOtp = useCallback(async (challengeToken: string, code: string): Promise<OperationResult> => {
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeToken, code }),
      });
      const data = await readApiResponse(response);

      if (response.ok && data.success === true && data.user && typeof data.user === 'object') {
        const user = data.user as unknown as AuthUser;
        setCurrentUser(user);
        setIsAuthenticated(true);
        setRole(user.role);
        sessionStorage.setItem('ashram_auth', JSON.stringify(user));
        return { success: true };
      }

      return { success: false, error: apiError(data, 'Verification code is invalid or expired.') };
    } catch {
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
    <AppContext.Provider value={{ language, setLanguage, role, setRole, isAuthenticated, currentUser, beginLogin, sendOtp, verifyOtp, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

export const roleLabels: Record<AppRole, { en: string; mr: string }> = {
  web_creator: { en: 'Web Creator (Super Admin)', mr: 'वेब क्रिएटर (सुपर अॅडमिन)' },
  principal: { en: 'Principal', mr: 'मुख्याध्यापक' },
  class_teacher: { en: 'Class Teacher', mr: 'वर्गशिक्षक' },
  clerk: { en: 'Clerk (Lipik)', mr: 'लिपिक' },
  subject_teacher: { en: 'Subject Teacher', mr: 'विषय शिक्षक' },
  student_parent: { en: 'Student / Parent', mr: 'विद्यार्थी / पालक' },
};
