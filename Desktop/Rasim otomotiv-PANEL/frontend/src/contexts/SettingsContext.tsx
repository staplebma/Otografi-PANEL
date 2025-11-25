import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface SettingsContextType {
  darkMode: boolean;
  language: 'tr' | 'en';
  currency: 'TRY' | 'USD' | 'EUR';
  timezone: string;
  emailNotifications: boolean;
  toggleDarkMode: () => void;
  setLanguage: (lang: 'tr' | 'en') => void;
  setCurrency: (currency: 'TRY' | 'USD' | 'EUR') => void;
  setTimezone: (timezone: string) => void;
  setEmailNotifications: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode] = useState(false);
  const [language] = useState<'tr' | 'en'>('tr');

  const [currency, setCurrencyState] = useState<'TRY' | 'USD' | 'EUR'>(() => {
    const saved = localStorage.getItem('currency');
    return (saved as 'TRY' | 'USD' | 'EUR') || 'TRY';
  });

  const [timezone, setTimezoneState] = useState(() => {
    const saved = localStorage.getItem('timezone');
    return saved || 'Europe/Istanbul';
  });

  const [emailNotifications, setEmailNotificationsState] = useState(() => {
    const saved = localStorage.getItem('emailNotifications');
    return saved !== 'false';
  });

  // Force light mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('darkMode');
  }, []);

  // Force Turkish
  useEffect(() => {
    localStorage.setItem('language', 'tr');
  }, []);

  // Save currency
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Save timezone
  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);

  // Save email notifications
  useEffect(() => {
    localStorage.setItem('emailNotifications', String(emailNotifications));
  }, [emailNotifications]);

  const toggleDarkMode = () => { }; // Disabled
  const setLanguage = () => { }; // Disabled
  const setCurrency = (curr: 'TRY' | 'USD' | 'EUR') => setCurrencyState(curr);
  const setTimezone = (tz: string) => setTimezoneState(tz);
  const setEmailNotifications = (enabled: boolean) => setEmailNotificationsState(enabled);

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        language,
        currency,
        timezone,
        emailNotifications,
        toggleDarkMode,
        setLanguage,
        setCurrency,
        setTimezone,
        setEmailNotifications,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
