import type { TranslationKey } from "../i18n/translations";

export const emailClients = ["gmail", "outlookWeb", "outlookDesktop", "appleMail", "other"] as const;

export type EmailClient = (typeof emailClients)[number];

type ClientInstructions = {
  paste: TranslationKey;
  insertImage: TranslationKey;
};

const instructions: Record<EmailClient, ClientInstructions> = {
  gmail: { paste: "pasteGmail", insertImage: "imageInsertGmail" },
  outlookWeb: { paste: "pasteOutlookWeb", insertImage: "imageInsertOutlookWeb" },
  outlookDesktop: { paste: "pasteOutlookDesktop", insertImage: "imageInsertOutlookDesktop" },
  appleMail: { paste: "pasteAppleMail", insertImage: "imageInsertAppleMail" },
  other: { paste: "pasteOther", insertImage: "imageInsertOther" }
};

export function isEmailClient(value: string): value is EmailClient {
  return emailClients.some(function (client) {
    return client === value;
  });
}

export function clientInstructions(client: EmailClient): ClientInstructions {
  return instructions[client];
}
