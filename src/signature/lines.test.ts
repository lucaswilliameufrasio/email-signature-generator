import { describe, expect, it } from "vitest";
import { translations } from "../i18n/translations";
import { createDefaultState } from "../state/signature-state";
import { signatureLines, signaturePlainText } from "./lines";

describe("signatureLines", function () {
  it("lists only filled lines with labels and links", function () {
    const state = createDefaultState("pt-BR");
    state.contacts.email = "maria@empresa.com";
    state.contacts.website = "empresa.com";
    state.role = "  ";
    const lines = signatureLines(state, translations["pt-BR"]);

    expect(lines.map(function (line) {
      return line.key;
    })).toEqual(["name", "phone", "email", "website"]);
    expect(lines[1]).toMatchObject({ label: "Telefone: ", value: "+55 (00) 0000-0000", href: "tel:+550000000000", isLink: false });
    expect(lines[2]).toMatchObject({ label: "E-mail: ", href: "mailto:maria@empresa.com", isLink: true });
    expect(lines[3]).toMatchObject({ href: "https://empresa.com/" });
  });

  it("omits labels when disabled", function () {
    const state = { ...createDefaultState("en"), showLabels: false };
    const phone = signatureLines(state, translations.en).find(function (line) {
      return line.key === "phone";
    });
    expect(phone?.label).toBe("");
  });

  it("keeps a line without a link when the value is not a valid address", function () {
    const state = createDefaultState("en");
    state.contacts.email = "maria at empresa";
    const email = signatureLines(state, translations.en).find(function (line) {
      return line.key === "email";
    });
    expect(email?.value).toBe("maria at empresa");
    expect(email?.href).toBeUndefined();
  });
});

describe("signaturePlainText", function () {
  it("joins label and value per line", function () {
    const state = createDefaultState("en");
    state.contacts.email = "john@company.com";
    expect(signaturePlainText(signatureLines(state, translations.en))).toBe(
      "John Doe\nRole or Department\nPhone: +1 (555) 000-0000\nEmail: john@company.com"
    );
  });
});
