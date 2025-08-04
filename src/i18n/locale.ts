import { Pathnames } from "next-intl/routing";

export const locales = ["en", "zh", "ar", "cl", "mx", "es", "pl", "br", "fr", "tr", "ph", "it", "de"];

export const localeNames: any = {
  en: "English",
  zh: "中文",
  ar: "Español",
  cl: "Español", 
  mx: "Español",
  es: "Español",
  pl: "Polski",
  br: "Português",
  fr: "Français",
  tr: "Türkçe",
  ph: "Filipino",
  it: "Italiano",
  de: "Deutsch",
};

export const defaultLocale = "en";

export const localePrefix = "as-needed";

export const localeDetection =
  process.env.NEXT_PUBLIC_LOCALE_DETECTION === "true";
