import { requireElement } from "../dom";
import type { TranslationTable } from "../i18n/translations";
import type { LogoSources } from "../export/email-html";
import { clientInstructions, isEmailClient, type EmailClient } from "./email-clients";
import { parseLogoUrl, probeImage } from "./logo-url";

type JourneyStep = "client" | "hosted" | "image" | "urls" | "done";

type VisibleLogos = {
  main: boolean;
  side: boolean;
};

export type CopyJourneyDependencies = {
  texts: () => TranslationTable;
  visibleLogos: () => VisibleLogos;
  copySignature: (logoSources: LogoSources) => Promise<void>;
  downloadPng: () => Promise<void>;
};

type LogoUrlField = {
  field: HTMLDivElement;
  input: HTMLInputElement;
  error: HTMLSpanElement;
};

const probeTimeoutMs = 8000;

export function createCopyJourney(dependencies: CopyJourneyDependencies): { open: () => void } {
  const dialog = requireElement("copyDialog", HTMLDialogElement);
  const journeyError = requireElement("journeyError", HTMLParagraphElement);
  const imageInsertText = requireElement("journeyImageInsert", HTMLParagraphElement);
  const pasteInstructions = requireElement("journeyPasteInstructions", HTMLParagraphElement);
  const mainUrl: LogoUrlField = {
    field: requireElement("mainLogoUrlField", HTMLDivElement),
    input: requireElement("mainLogoUrlInput", HTMLInputElement),
    error: requireElement("mainLogoUrlError", HTMLSpanElement)
  };
  const sideUrl: LogoUrlField = {
    field: requireElement("sideLogoUrlField", HTMLDivElement),
    input: requireElement("sideLogoUrlInput", HTMLInputElement),
    error: requireElement("sideLogoUrlError", HTMLSpanElement)
  };

  const history: JourneyStep[] = [];
  let currentStep: JourneyStep = "client";
  let busy = false;

  function selectedClient(): EmailClient {
    const checked = dialog.querySelector<HTMLInputElement>('input[name="emailClient"]:checked');
    if (checked && isEmailClient(checked.value)) {
      return checked.value;
    }
    return "other";
  }

  function render(): void {
    for (const section of dialog.querySelectorAll<HTMLElement>("section[data-step]")) {
      section.hidden = section.dataset["step"] !== currentStep;
    }
    const texts = dependencies.texts();
    const clientTexts = clientInstructions(selectedClient());
    imageInsertText.textContent = texts[clientTexts.insertImage];
    pasteInstructions.textContent = texts[clientTexts.paste];

    const visibleLogos = dependencies.visibleLogos();
    mainUrl.field.hidden = !visibleLogos.main;
    sideUrl.field.hidden = !visibleLogos.side;

    const firstControl = dialog.querySelector<HTMLElement>(`section[data-step="${currentStep}"] input:not([type="radio"]), section[data-step="${currentStep}"] button`);
    firstControl?.focus();
  }

  function goTo(step: JourneyStep): void {
    history.push(currentStep);
    currentStep = step;
    journeyError.textContent = "";
    render();
  }

  function goBack(): void {
    const previousStep = history.pop();
    if (previousStep !== undefined) {
      currentStep = previousStep;
      journeyError.textContent = "";
      render();
    }
  }

  async function copyAndFinish(logoSources: LogoSources): Promise<void> {
    try {
      await dependencies.copySignature(logoSources);
      goTo("done");
    } catch (error) {
      console.error(error);
      journeyError.textContent = dependencies.texts().journeyCopyFailed;
    }
  }

  async function checkUrlField(urlField: LogoUrlField): Promise<string | undefined> {
    urlField.error.textContent = "";
    urlField.input.removeAttribute("aria-invalid");
    const texts = dependencies.texts();
    const check = parseLogoUrl(urlField.input.value);
    if (check.kind === "invalid") {
      urlField.error.textContent = texts.journeyUrlInvalid;
      urlField.input.setAttribute("aria-invalid", "true");
      return undefined;
    }
    const loads = await probeImage(check.url, probeTimeoutMs);
    if (!loads) {
      urlField.error.textContent = texts.journeyUrlFailed;
      urlField.input.setAttribute("aria-invalid", "true");
      return undefined;
    }
    return check.url;
  }

  async function testAndCopy(): Promise<void> {
    const visibleLogos = dependencies.visibleLogos();
    const logoSources: LogoSources = {};
    let allValid = true;

    if (visibleLogos.main) {
      const url = await checkUrlField(mainUrl);
      if (url === undefined) {
        allValid = false;
      } else {
        logoSources.main = url;
      }
    }
    if (visibleLogos.side) {
      const url = await checkUrlField(sideUrl);
      if (url === undefined) {
        allValid = false;
      } else {
        logoSources.side = url;
      }
    }

    if (allValid) {
      await copyAndFinish(logoSources);
    }
  }

  async function handleAction(action: string): Promise<void> {
    if (action === "close") {
      dialog.close();
      return;
    }
    if (action === "back") {
      goBack();
      return;
    }
    if (action === "next") {
      const visibleLogos = dependencies.visibleLogos();
      if (!visibleLogos.main && !visibleLogos.side) {
        await copyAndFinish({});
        return;
      }
      goTo("hosted");
      return;
    }
    if (action === "hosted-yes") {
      goTo("urls");
      return;
    }
    if (action === "hosted-no") {
      goTo("image");
      return;
    }
    if (action === "download-image") {
      await dependencies.downloadPng();
      return;
    }
    if (action === "test-and-copy") {
      await testAndCopy();
    }
  }

  dialog.addEventListener("click", async function (event) {
    if (!(event.target instanceof Element)) {
      return;
    }
    const button = event.target.closest<HTMLButtonElement>("button[data-action]");
    const action = button?.dataset["action"];
    if (!button || action === undefined || busy) {
      return;
    }
    busy = true;
    button.disabled = true;
    try {
      await handleAction(action);
    } finally {
      busy = false;
      button.disabled = false;
    }
  });

  return {
    open: function () {
      history.length = 0;
      currentStep = "client";
      journeyError.textContent = "";
      for (const urlField of [mainUrl, sideUrl]) {
        urlField.error.textContent = "";
        urlField.input.removeAttribute("aria-invalid");
      }
      dialog.showModal();
      render();
    }
  };
}
