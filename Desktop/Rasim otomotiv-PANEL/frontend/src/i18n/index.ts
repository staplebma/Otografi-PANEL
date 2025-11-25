import { tr } from './tr';
import type { Translations } from './tr';
import { en } from './en';
import { useSettings } from '../contexts/SettingsContext';

export const translations: Record<'tr' | 'en', Translations> = {
  tr,
  en,
};

export const useTranslation = () => {
  const { language } = useSettings();

  const t = translations[language];

  return { t, language };
};

export { tr, en };
export type { Translations };
