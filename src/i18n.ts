import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import bn from "./locales/bn.json";
import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from "./lib/language";

export function createI18n(language: Language = DEFAULT_LANGUAGE) {
  const i18n = createInstance();

  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...LANGUAGES],
    initAsync: false,
    interpolation: { escapeValue: false },
  });

  return i18n;
}
