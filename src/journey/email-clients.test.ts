import { describe, expect, it } from "vitest";
import { translations } from "../i18n/translations";
import { clientInstructions, emailClients, isEmailClient } from "./email-clients";

describe("email clients", function () {
  it("recognizes supported clients", function () {
    expect(isEmailClient("gmail")).toBe(true);
    expect(isEmailClient("thunderbird")).toBe(false);
  });

  it("has paste and image instructions for every client", function () {
    for (const client of emailClients) {
      const clientTexts = clientInstructions(client);
      expect(translations.en[clientTexts.paste]).not.toBe("");
      expect(translations.en[clientTexts.insertImage]).not.toBe("");
    }
  });
});
