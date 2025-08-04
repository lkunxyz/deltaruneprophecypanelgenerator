import { Pathnames } from "next-intl/routing";

export const locales = ["en", "zh", "es-AR", "es-CL", "es-MX", "es-ES", "pl-PL", "pt-BR", "fr-FR", "tr-TR", "en-PH", "it-IT", "de-DE"];

export const localeNames: any = {
  en: "English",
  zh: "中文",
  "es-AR": "Español (Argentina)",
  "es-CL": "Español (Chile)", 
  "es-MX": "Español (México)",
  "es-ES": "Español (España)",
  "pl-PL": "Polski",
  "pt-BR": "Português (Brasil)",
  "fr-FR": "Français",
  "tr-TR": "Türkçe",
  "en-PH": "English (Philippines)",
  "it-IT": "Italiano",
  "de-DE": "Deutsch",
};

export const defaultLocale = "en";

export const localePrefix = "as-needed";

export const localeDetection =
  process.env.NEXT_PUBLIC_LOCALE_DETECTION === "true";
