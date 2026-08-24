import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Language = 'en' | 'mr';

export type AppRole = 'web_creator' | 'principal' | 'class_teacher' | 'clerk' | 'subject_teacher' | 'student_parent';

export interface AuthUser {
  username: string;
  role: AppRole;
  nameEn: string;
  nameMr: string;
  mustChangePassword?: boolean;
}

interface OperationResult {
  success: boolean;
  error?: string;
  retryAfter?: number;
  aiPin?: string;
}

interface BeginLoginResult extends OperationResult {
  challengeToken?: string;
  maskedEmail?: string;
}

interface SendOtpResult extends OperationResult {
  maskedEmail?: string;
  resendAfterSeconds?: number;
}

interface RegisterResult extends OperationResult {
  userId?: string;
  challengeToken?: string;
  maskedEmail?: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: AppRole;
  setRole: (role: AppRole) => void;
  isAuthenticated: boolean;
  isAuthChecking: boolean;
  currentUser: AuthUser | null;
  mustChangePassword: boolean;
  isRegistering: boolean;
  setIsRegistering: (v: boolean) => void;
  beginLogin: (username: string, password: string) => Promise<BeginLoginResult>;
  sendOtp: (challengeToken: string) => Promise<SendOtpResult>;
  verifyOtp: (challengeToken: string, code: string) => Promise<OperationResult>;
  register: (data: { fullName: string; mobileNumber: string; email: string; relationship: string }) => Promise<RegisterResult>;
  setPassword: (password: string, confirmPassword: string) => Promise<OperationResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<OperationResult>;
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

function retryAfter(response: Response, data: Record<string, unknown>): number | undefined {
  if (typeof data.retryAfter === 'number' && Number.isFinite(data.retryAfter)) {
    return Math.max(0, Math.ceil(data.retryAfter));
  }
  const header = Number.parseInt(response.headers.get('Retry-After') || '', 10);
  return Number.isFinite(header) ? Math.max(0, header) : undefined;
}

const API_TIMEOUT_MS = 15_000;

async function apiRequest(
  path: string,
  body: Record<string, unknown>,
  operationId: string,
): Promise<{ response: Response; data: Record<string, unknown> }> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': operationId,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      });
      return { response, data: await readApiResponse(response) };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function newOperationId(): string {
  return crypto.randomUUID();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const storedAuth = getStoredAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(storedAuth.isAuthenticated);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(storedAuth.currentUser);
  const [role, setRole] = useState<AppRole>(storedAuth.currentUser?.role || 'web_creator');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (currentUser) setRole(currentUser.role);
  }, [currentUser]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8_000);
    void fetch('/api/auth/session', {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async (response) => ({ response, data: await readApiResponse(response) }))
      .then(({ response, data }) => {
        if (response.ok && data.user && typeof data.user === 'object') {
          const userData = data.user as Record<string, unknown>;
          const user: AuthUser = {
            username: userData.username as string,
            role: userData.role as AppRole,
            nameEn: userData.nameEn as string,
            nameMr: userData.nameMr as string,
            mustChangePassword: userData.mustChangePassword === true,
          };
          setCurrentUser(user);
          setIsAuthenticated(true);
          setRole(user.role);
          setMustChangePassword(user.mustChangePassword || false);
          sessionStorage.setItem('ashram_auth', JSON.stringify(user));
          return;
        }
        setCurrentUser(null);
        setIsAuthenticated(false);
        setMustChangePassword(false);
        sessionStorage.removeItem('ashram_auth');
      })
      .catch(() => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setMustChangePassword(false);
        sessionStorage.removeItem('ashram_auth');
      })
      .finally(() => {
        window.clearTimeout(timer);
        setIsAuthChecking(false);
      });
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const beginLogin = useCallback(async (username: string, password: string): Promise<BeginLoginResult> => {
    try {
      const { response, data } = await apiRequest(
        '/api/auth/login',
        { username, password },
        newOperationId(),
      );

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

      return {
        success: false,
        error: apiError(data, 'Invalid username or password'),
        retryAfter: retryAfter(response, data),
      };
    } catch {
      return { success: false, error: 'Server request timed out. Please try again.' };
    }
  }, []);

  const sendOtp = useCallback(async (challengeToken: string): Promise<SendOtpResult> => {
    try {
      const { response, data } = await apiRequest(
        '/api/otp/send',
        { challengeToken },
        newOperationId(),
      );

      if (response.ok && data.success === true) {
        return {
          success: true,
          maskedEmail: typeof data.maskedEmail === 'string' ? data.maskedEmail : undefined,
          resendAfterSeconds: typeof data.resendAfterSeconds === 'number' ? data.resendAfterSeconds : 60,
        };
      }

      return {
        success: false,
        error: apiError(data, 'Could not send the verification email.'),
        retryAfter: retryAfter(response, data),
      };
    } catch {
      return { success: false, error: 'Email request timed out. Retry is safe and will use the same code.' };
    }
  }, []);

  const verifyOtp = useCallback(async (challengeToken: string, code: string): Promise<OperationResult> => {
    try {
      const { response, data } = await apiRequest(
        '/api/otp/verify',
        { challengeToken, code },
        newOperationId(),
      );

      if (response.ok && data.success === true && data.user && typeof data.user === 'object') {
        const userData = data.user as Record<string, unknown>;
        const user: AuthUser = {
          username: userData.username as string,
          role: userData.role as AppRole,
          nameEn: userData.nameEn as string,
          nameMr: userData.nameMr as string,
          mustChangePassword: userData.mustChangePassword === true,
        };
        setCurrentUser(user);
        setIsAuthenticated(true);
        setRole(user.role);
        setMustChangePassword(user.mustChangePassword || false);
        sessionStorage.setItem('ashram_auth', JSON.stringify(user));
        return { success: true };
      }

      return {
        success: false,
        error: apiError(data, 'Verification code is invalid or expired.'),
        retryAfter: retryAfter(response, data),
      };
    } catch {
      return { success: false, error: 'Verification request timed out. It is safe to try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    void fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setRole('web_creator');
    setMustChangePassword(false);
    sessionStorage.removeItem('ashram_auth');
  }, []);

  const register = useCallback(async (regData: { fullName: string; mobileNumber: string; email: string; relationship: string }): Promise<RegisterResult> => {
    try {
      const { response, data } = await apiRequest(
        '/api/auth/register',
        regData,
        newOperationId(),
      );

      if ((response.ok || response.status === 201) && data.success === true) {
        return {
          success: true,
          userId: typeof data.userId === 'string' ? data.userId : undefined,
          challengeToken: typeof data.challengeToken === 'string' ? data.challengeToken : undefined,
          maskedEmail: typeof data.maskedEmail === 'string' ? data.maskedEmail : undefined,
        };
      }

      return {
        success: false,
        error: apiError(data, 'Registration failed.'),
        retryAfter: retryAfter(response, data),
      };
    } catch {
      return { success: false, error: 'Registration request timed out. Please try again.' };
    }
  }, []);

  const setPasswordFn = useCallback(async (password: string, confirmPassword: string): Promise<OperationResult> => {
    try {
      const { response, data } = await apiRequest(
        '/api/auth/set-password',
        { password, confirmPassword },
        newOperationId(),
      );

      if (response.ok && data.success === true) {
        setMustChangePassword(false);
        if (currentUser) {
          const updated = { ...currentUser, mustChangePassword: false };
          setCurrentUser(updated);
          sessionStorage.setItem('ashram_auth', JSON.stringify(updated));
        }
        return { success: true, aiPin: data.aiPin as string | undefined };
      }

      return {
        success: false,
        error: apiError(data, 'Unable to set password.'),
        retryAfter: retryAfter(response, data),
      };
    } catch {
      return { success: false, error: 'Request timed out. Please try again.' };
    }
  }, [currentUser]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<OperationResult> => {
    try {
      const { response, data } = await apiRequest(
        '/api/auth/change-password',
        { currentPassword, newPassword },
        newOperationId(),
      );

      if (response.ok && data.success === true) {
        setMustChangePassword(false);
        if (currentUser) {
          const updated = { ...currentUser, mustChangePassword: false };
          setCurrentUser(updated);
          sessionStorage.setItem('ashram_auth', JSON.stringify(updated));
        }
        return { success: true };
      }

      return {
        success: false,
        error: apiError(data, 'Unable to change password.'),
        retryAfter: retryAfter(response, data),
      };
    } catch {
      return { success: false, error: 'Request timed out. Please try again.' };
    }
  }, [currentUser]);

  return (
    <AppContext.Provider value={{ language, setLanguage, role, setRole, isAuthenticated, isAuthChecking, currentUser, mustChangePassword, isRegistering, setIsRegistering, beginLogin, sendOtp, verifyOtp, register, setPassword: setPasswordFn, changePassword, logout }}>
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
