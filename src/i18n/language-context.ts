import { createContext } from "react";
import { Lang, TranslationKey } from "./translations";

export interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  showPicker: boolean;
  setShowPicker: (v: boolean) => void;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);
