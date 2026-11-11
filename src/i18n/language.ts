import { languages, type Language } from "./translations";

export function isLanguage(value: string): value is Language {
  return languages.some(function (language) {
    return language === value;
  });
}

export function detectLanguage(browserLanguage: string | undefined): Language {
  if (browserLanguage !== undefined && browserLanguage.startsWith("en")) {
    return "en";
  }
  return "pt-BR";
}
