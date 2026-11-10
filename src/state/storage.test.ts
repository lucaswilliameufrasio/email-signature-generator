import { describe, expect, it } from "vitest";
import { createDefaultState } from "./signature-state";
import { clearState, loadState, saveState, stateStorageKey, type KeyValueStorage } from "./storage";

class MemoryStorage implements KeyValueStorage {
  readonly entries = new Map<string, string>();
  maxLength = Number.POSITIVE_INFINITY;

  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (value.length > this.maxLength) {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    }
    this.entries.set(key, value);
  }

  removeItem(key: string): void {
    this.entries.delete(key);
  }
}

describe("signature storage", function () {
  it("saves and loads the state", function () {
    const storage = new MemoryStorage();
    const state = { ...createDefaultState("en"), name: "Maria" };

    expect(saveState(storage, state)).toBe("saved");
    expect(loadState(storage, "pt-BR")).toEqual(state);
  });

  it("falls back to defaults when nothing or garbage is stored", function () {
    const storage = new MemoryStorage();
    expect(loadState(storage, "en")).toEqual(createDefaultState("en"));

    storage.entries.set(stateStorageKey, "{not json");
    expect(loadState(storage, "en")).toEqual(createDefaultState("en"));
  });

  it("drops custom logos when the full state does not fit", function () {
    const storage = new MemoryStorage();
    const state = createDefaultState("en");
    state.logos.main.source = `data:image/png;base64,${"A".repeat(5000)}`;
    storage.maxLength = 3000;

    expect(saveState(storage, state)).toBe("savedWithoutLogos");
    const loaded = loadState(storage, "en");
    expect(loaded.logos.main.source).toBeUndefined();
    expect(loaded.logos.main.frame).toEqual(state.logos.main.frame);
    expect(loaded.name).toBe(state.name);
  });

  it("reports failure when nothing fits or storage is unavailable", function () {
    const storage = new MemoryStorage();
    storage.maxLength = 10;

    expect(saveState(storage, createDefaultState("en"))).toBe("failed");
    expect(saveState(undefined, createDefaultState("en"))).toBe("failed");
  });

  it("clears the saved state", function () {
    const storage = new MemoryStorage();
    saveState(storage, createDefaultState("en"));
    clearState(storage);

    expect(storage.entries.has(stateStorageKey)).toBe(false);
  });
});
