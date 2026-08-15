import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'en' | 'mr';

export type AppRole = 'web_creator' | 'principal' | 'class_teacher' | 'clerk' | 'subject_teacher' | 'student_parent';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: AppRole;
  setRole: (role: AppRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [role, setRole] = useState<AppRole>('web_creator');

  return (
    <AppContext.Provider value={{ language, setLanguage, role, setRole }}>
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
