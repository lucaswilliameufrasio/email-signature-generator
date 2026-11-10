import type { Language } from "../i18n/translations";
import { createDefaultState, parseState, type SignatureState } from "./signature-state";

export const stateStorageKey = "email-signature-generator:state:v1";

export type KeyValueStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type SaveResult = "saved" | "savedWithoutLogos" | "failed";

export function loadState(storage: KeyValueStorage | undefined, fallbackLanguage: Language): SignatureState {
  if (storage === undefined) {
    return createDefaultState(fallbackLanguage);
  }
  try {
    const stored = storage.getItem(stateStorageKey) ?? undefined;
    if (stored === undefined) {
      return createDefaultState(fallbackLanguage);
    }
    const parsed: unknown = JSON.parse(stored);
    return parseState(parsed, fallbackLanguage);
  } catch (error) {
    console.warn("Ignoring unreadable saved signature", error);
    return createDefaultState(fallbackLanguage);
  }
}

function withoutLogos(state: SignatureState): SignatureState {
  return {
    ...state,
    logos: {
      ...state.logos,
      main: { frame: state.logos.main.frame },
      side: { frame: state.logos.side.frame }
    }
  };
}

export function saveState(storage: KeyValueStorage | undefined, state: SignatureState): SaveResult {
  if (storage === undefined) {
    return "failed";
  }
  try {
    storage.setItem(stateStorageKey, JSON.stringify(state));
    return "saved";
  } catch (error) {
    console.warn("Could not save the full signature", error);
  }
  try {
    storage.setItem(stateStorageKey, JSON.stringify(withoutLogos(state)));
    return "savedWithoutLogos";
  } catch (error) {
    console.warn("Could not save the signature", error);
    return "failed";
  }
}

export function clearState(storage: KeyValueStorage | undefined): void {
  if (storage === undefined) {
    return;
  }
  try {
    storage.removeItem(stateStorageKey);
  } catch (error) {
    console.warn("Could not clear the saved signature", error);
  }
}

export function browserStorage(): KeyValueStorage | undefined {
  try {
    return window.localStorage;
  } catch (error) {
    console.warn("Local storage is not available", error);
    return undefined;
  }
}
