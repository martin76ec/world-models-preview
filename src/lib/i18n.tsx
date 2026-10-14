import { createContext, useContext } from "react";

export type Lang = "en" | "es";
export type Text = Record<Lang, string>;

export const LangCtx = createContext<Lang>("en");

export const useLang = () => useContext(LangCtx);

/** `const t = useT(); t("hello", "hola")` */
export const useT = () => {
  const lang = useLang();
  return (en: string, es: string) => (lang === "es" ? es : en);
};
