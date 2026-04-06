import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storage } from '../utils/storage';

import en from './locales/en.json';
import ne from './locales/ne.json';

const resources = {
  en: { translation: en },
  ne: { translation: ne },
};

const LANGUAGE_KEY = '@app_language';

export const initI18n = async () => {
  const savedLanguage = await storage.getItem(LANGUAGE_KEY);
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage || 'ne', // Default to Nepali based on current app state
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

export const changeLanguage = async (lng: string) => {
  await i18n.changeLanguage(lng);
  await storage.setItem(LANGUAGE_KEY, lng);
};

export default i18n;
