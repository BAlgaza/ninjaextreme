import { createContext, useContext, useState, ReactNode } from "react";
import { translations, Lang, TranslationKey } from "./translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  showPicker: boolean;
  setShowPicker: (v: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const stored = getCookie("ne_lang") as Lang | null;
  const [lang, setLangState] = useState<Lang>(stored || "id");
  const [showPicker, setShowPicker] = useState(!stored);

  const setLang = (l: Lang) => {
    setLangState(l);
    setCookie("ne_lang", l);
  };

  const t = (key: TranslationKey) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, showPicker, setShowPicker }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
