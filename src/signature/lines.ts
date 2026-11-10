import type { TranslationTable } from "../i18n/translations";
import type { SignatureState } from "../state/signature-state";
import { emailHref, instagramHref, linkedinHref, phoneHref, websiteHref } from "./contact-links";
import { formatPhoneLine } from "./phone";
import type { LineKey } from "./style-model";

export type SignatureLine = {
  key: LineKey;
  label: string;
  value: string;
  href?: string;
  isLink: boolean;
};

function line(key: LineKey, label: string, value: string, href: string | undefined, isLink: boolean): SignatureLine {
  const result: SignatureLine = { key, label, value, isLink };
  if (href !== undefined) {
    result.href = href;
  }
  return result;
}

export function signatureLines(state: SignatureState, texts: TranslationTable): SignatureLine[] {
  const labels = state.showLabels;
  const phoneValue = formatPhoneLine(state.phone, state.showCountryCode, "");
  const candidates: SignatureLine[] = [
    line("name", "", state.name.trim(), undefined, false),
    line("role", "", state.role.trim(), undefined, false),
    line("phone", labels ? texts.phonePrefix : "", phoneValue, phoneHref(phoneValue), false),
    line("email", labels ? texts.emailPrefix : "", state.contacts.email.trim(), emailHref(state.contacts.email), true),
    line("website", labels ? texts.websitePrefix : "", state.contacts.website.trim(), websiteHref(state.contacts.website), true),
    line("linkedin", labels ? texts.linkedinPrefix : "", state.contacts.linkedin.trim(), linkedinHref(state.contacts.linkedin), true),
    line("instagram", labels ? texts.instagramPrefix : "", state.contacts.instagram.trim(), instagramHref(state.contacts.instagram), true)
  ];
  return candidates.filter(function (candidate) {
    return candidate.value !== "";
  });
}

export function signaturePlainText(lines: readonly SignatureLine[]): string {
  return lines
    .map(function (signatureLine) {
      return `${signatureLine.label}${signatureLine.value}`;
    })
    .join("\n");
}
