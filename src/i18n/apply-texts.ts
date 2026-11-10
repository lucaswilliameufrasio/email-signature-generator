import { isTranslationKey, type TranslationTable } from "./translations";

function translatedValue(element: Element, attributeName: string, texts: TranslationTable): string | undefined {
  const key = element.getAttribute(attributeName);
  if (!key || !isTranslationKey(key)) {
    return undefined;
  }
  return texts[key];
}

export function applyStaticTexts(root: ParentNode, texts: TranslationTable): void {
  for (const element of root.querySelectorAll("[data-i18n], [data-i18n-opt]")) {
    const text = translatedValue(element, "data-i18n", texts) ?? translatedValue(element, "data-i18n-opt", texts);
    if (text !== undefined) {
      element.textContent = text;
    }
  }

  for (const element of root.querySelectorAll("[data-i18n-placeholder]")) {
    const text = translatedValue(element, "data-i18n-placeholder", texts);
    if (text !== undefined && element instanceof HTMLInputElement) {
      element.placeholder = text;
    }
  }

  for (const element of root.querySelectorAll("[data-i18n-alt]")) {
    const text = translatedValue(element, "data-i18n-alt", texts);
    if (text !== undefined && element instanceof HTMLImageElement) {
      element.alt = text;
    }
  }
}
