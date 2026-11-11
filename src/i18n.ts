import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import bn from "./locales/bn.json";

export function createI18n() {
  const i18n = createInstance();

  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    lng: "bn",
    fallbackLng: "bn",
    supportedLngs: ["bn", "en"],
    initAsync: false,
    interpolation: { escapeValue: false },
  });

  return i18n;
}
