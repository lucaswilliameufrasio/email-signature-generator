import { getElements } from "./app/elements";
import { renderSignature } from "./app/render-signature";
import { syncControls } from "./app/sync-controls";
import { copyRichHtml } from "./export/clipboard";
import { downloadBlob } from "./export/download";
import { prepareEmailHtml, type LogoSources } from "./export/email-html";
import { buildHtmlDocument } from "./export/html-document";
import { exportImage } from "./export/image-export";
import { describeFormat, formatFileSize, isImageFormat, type ImageFormat } from "./export/image-format";
import { applyStaticTexts } from "./i18n/apply-texts";
import { detectLanguage, isLanguage } from "./i18n/language";
import { fillTemplate, translations, type TranslationTable } from "./i18n/translations";
import { createCopyJourney } from "./journey/copy-journey";
import { fontOptions } from "./signature/fonts";
import { palettes } from "./signature/palettes";
import {
  changeLanguage,
  createDefaultState,
  editText,
  exportScales,
  logoWidthLimits,
  qualityLimits,
  type SignatureState,
  type TextField
} from "./state/signature-state";
import { browserStorage, clearState, loadState, saveState, type SaveResult } from "./state/storage";
import { isThemePreference, loadThemePreference, resolveTheme, saveThemePreference, type ThemePreference } from "./theme/theme";

type LogoTarget = "main" | "side";

const elements = getElements();
const storage = browserStorage();
const saveDelayMs = 300;

let state: SignatureState = loadState(storage, detectLanguage(navigator.language));
let pendingSave: ReturnType<typeof setTimeout> | undefined;
let lastSaveResult: SaveResult = "saved";
let renderedLanguage = "";

function texts(): TranslationTable {
  return translations[state.language];
}

function setStatus(statusText: string): void {
  elements.exportStatus.textContent = statusText;
}

function flushSave(): void {
  if (pendingSave !== undefined) {
    clearTimeout(pendingSave);
    pendingSave = undefined;
  }
  const result = saveState(storage, state);
  if (result !== lastSaveResult) {
    if (result === "savedWithoutLogos") {
      setStatus(texts().statusLogosNotSaved);
    } else if (result === "failed") {
      setStatus(texts().statusStorageUnavailable);
    }
  }
  lastSaveResult = result;
}

function scheduleSave(): void {
  if (pendingSave !== undefined) {
    clearTimeout(pendingSave);
  }
  pendingSave = setTimeout(flushSave, saveDelayMs);
}

function buildPalettes(): void {
  elements.paletteGrid.replaceChildren();
  for (const palette of palettes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "palette";
    const swatches = document.createElement("div");
    swatches.className = "swatches";
    for (const color of [palette.text, palette.divider, palette.accent, palette.bg]) {
      const swatch = document.createElement("span");
      swatch.className = "sw";
      swatch.style.background = color;
      swatches.append(swatch);
    }
    button.append(swatches, texts()[palette.name]);
    button.addEventListener("click", function () {
      update({
        ...state,
        colors: { text: palette.text, divider: palette.divider, accent: palette.accent, background: palette.bg }
      });
    });
    elements.paletteGrid.append(button);
  }
}

function buildFontOptions(): void {
  elements.fontFamilyInput.replaceChildren();
  for (const font of fontOptions) {
    elements.fontFamilyInput.append(new Option(font.label, font.value));
  }
}

function render(): void {
  if (renderedLanguage !== state.language) {
    document.documentElement.lang = state.language;
    applyStaticTexts(document, texts());
    buildPalettes();
    renderedLanguage = state.language;
  }
  syncControls(state, elements);
  renderSignature(state, elements, texts());
}

function update(nextState: SignatureState): void {
  state = nextState;
  render();
  scheduleSave();
}

function clampNumber(rawValue: string, minimum: number, maximum: number, fallback: number): number {
  const parsed = parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(maximum, Math.max(minimum, parsed));
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unexpected file reader result"));
    };
    reader.onerror = function () {
      reject(reader.error ?? new Error("Could not read file"));
    };
    reader.readAsDataURL(file);
  });
}

async function setLogoFromFile(file: File, target: LogoTarget): Promise<void> {
  if (!file.type.startsWith("image/")) {
    return;
  }
  const source = await readAsDataUrl(file);
  const logos = target === "main" ? { ...state.logos, mainSource: source } : { ...state.logos, sideSource: source };
  update({ ...state, logos });
  setStatus(texts().statusLogoLoaded);
  flushSave();
}

function wireDropzone(zone: HTMLElement, input: HTMLInputElement, target: LogoTarget): void {
  for (const eventType of ["dragenter", "dragover"]) {
    zone.addEventListener(eventType, function (event) {
      event.preventDefault();
      event.stopPropagation();
      zone.classList.add("dragover");
    });
  }
  for (const eventType of ["dragleave", "drop"]) {
    zone.addEventListener(eventType, function (event) {
      event.preventDefault();
      event.stopPropagation();
      zone.classList.remove("dragover");
    });
  }
  zone.addEventListener("drop", async function (event) {
    const file = event.dataTransfer?.files[0];
    if (file) {
      await setLogoFromFile(file, target);
    }
  });
  input.addEventListener("change", async function () {
    const file = input.files?.[0];
    if (file) {
      await setLogoFromFile(file, target);
    }
  });
}

function exportableClone(): HTMLElement {
  const clone = elements.sigTable.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    throw new Error("Signature clone is not an element");
  }
  clone.style.minWidth = "0";
  return clone;
}

function visibleLogos(): { main: boolean; side: boolean } {
  return { main: state.logos.showMain, side: state.logos.showSide };
}

function plainTextSignature(): string {
  return [elements.nameEl, elements.roleEl, elements.phoneEl]
    .filter(function (element) {
      return element.style.display !== "none";
    })
    .map(function (element) {
      return element.textContent;
    })
    .join("\n");
}

async function copySignature(logoSources: LogoSources): Promise<void> {
  const htmlContent = prepareEmailHtml(exportableClone(), logoSources);
  await copyRichHtml(htmlContent, plainTextSignature());
  setStatus(texts().statusCopied);
}

async function downloadImageAs(format: ImageFormat): Promise<void> {
  const currentTexts = texts();
  const details = describeFormat(format);
  const scale = details.usesScale ? state.exportSettings.scale : 1;
  try {
    const imageBlob = await exportImage({
      node: elements.sigTable,
      format,
      scale,
      quality: state.exportSettings.quality / 100,
      backgroundColor: state.colors.background
    });
    downloadBlob(imageBlob, `${currentTexts.fileBaseName}.${details.extension}`);
    setStatus(fillTemplate(currentTexts.statusImageDownloadedDetail, {
      format: details.label,
      scale: String(scale),
      size: formatFileSize(imageBlob.size)
    }));
  } catch (error) {
    console.error(error);
    setStatus(currentTexts.statusImageFailed);
  }
}

function downloadHtml(): void {
  const currentTexts = texts();
  const signatureHtml = prepareEmailHtml(exportableClone(), {});
  const htmlContent = buildHtmlDocument(signatureHtml, state.language, currentTexts.htmlTitle);
  downloadBlob(new Blob([htmlContent], { type: "text/html;charset=utf-8" }), `${currentTexts.fileBaseName}.html`);
  setStatus(currentTexts.statusHtmlDownloaded);
}

function resetAll(): void {
  if (!window.confirm(texts().resetConfirm)) {
    return;
  }
  clearState(storage);
  elements.mainLogoInput.value = "";
  elements.sideLogoInput.value = "";
  state = createDefaultState(state.language);
  lastSaveResult = "saved";
  render();
  setStatus("");
}

const systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
let themePreference: ThemePreference = loadThemePreference(storage);

function applyTheme(): void {
  document.documentElement.dataset["theme"] = resolveTheme(themePreference, systemDarkQuery.matches);
  for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="themePreference"]')) {
    radio.checked = radio.value === themePreference;
  }
}

function wireTextField(input: HTMLInputElement, field: TextField): void {
  input.addEventListener("input", function () {
    update(editText(state, field, input.value));
  });
}

wireTextField(elements.nameInput, "name");
wireTextField(elements.roleInput, "role");
wireTextField(elements.phoneInput, "phone");

elements.langSelect.addEventListener("change", function () {
  const language = elements.langSelect.value;
  if (isLanguage(language)) {
    update(changeLanguage(state, language));
  }
});

elements.showCountryCodeCheckbox.addEventListener("change", function () {
  update({ ...state, showCountryCode: elements.showCountryCodeCheckbox.checked });
});

elements.fontFamilyInput.addEventListener("change", function () {
  update({ ...state, fontFamily: elements.fontFamilyInput.value });
});

elements.showMainLogoCheckbox.addEventListener("change", function () {
  update({ ...state, logos: { ...state.logos, showMain: elements.showMainLogoCheckbox.checked } });
});

elements.showSideLogoCheckbox.addEventListener("change", function () {
  update({ ...state, logos: { ...state.logos, showSide: elements.showSideLogoCheckbox.checked } });
});

elements.logoLayoutInput.addEventListener("change", function () {
  const layout = elements.logoLayoutInput.value === "vertical" ? "vertical" : "horizontal";
  update({ ...state, logos: { ...state.logos, layout } });
});

elements.mainLogoWidthInput.addEventListener("input", function () {
  const limits = logoWidthLimits.main;
  const mainWidth = clampNumber(elements.mainLogoWidthInput.value, limits.min, limits.max, state.logos.mainWidth);
  update({ ...state, logos: { ...state.logos, mainWidth } });
});

elements.sideLogoWidthInput.addEventListener("input", function () {
  const limits = logoWidthLimits.side;
  const sideWidth = clampNumber(elements.sideLogoWidthInput.value, limits.min, limits.max, state.logos.sideWidth);
  update({ ...state, logos: { ...state.logos, sideWidth } });
});

const colorInputs = [
  { input: elements.textColorInput, key: "text" },
  { input: elements.dividerColorInput, key: "divider" },
  { input: elements.accentColorInput, key: "accent" },
  { input: elements.bgColorInput, key: "background" }
] as const;

for (const colorInput of colorInputs) {
  colorInput.input.addEventListener("input", function () {
    update({ ...state, colors: { ...state.colors, [colorInput.key]: colorInput.input.value } });
  });
}

elements.exportFormatInput.addEventListener("change", function () {
  const format = elements.exportFormatInput.value;
  if (isImageFormat(format)) {
    update({ ...state, exportSettings: { ...state.exportSettings, format } });
  }
});

elements.exportScaleInput.addEventListener("change", function () {
  const scale = parseInt(elements.exportScaleInput.value, 10);
  const knownScale = exportScales.find(function (option) {
    return option === scale;
  });
  if (knownScale !== undefined) {
    update({ ...state, exportSettings: { ...state.exportSettings, scale: knownScale } });
  }
});

elements.exportQualityInput.addEventListener("input", function () {
  const quality = clampNumber(elements.exportQualityInput.value, qualityLimits.min, qualityLimits.max, state.exportSettings.quality);
  update({ ...state, exportSettings: { ...state.exportSettings, quality } });
});

const copyJourney = createCopyJourney({
  texts,
  visibleLogos,
  copySignature,
  downloadPng: async function () {
    await downloadImageAs("png");
  }
});

elements.copyHtmlBtn.addEventListener("click", function () {
  copyJourney.open();
});
elements.downloadHtmlBtn.addEventListener("click", downloadHtml);
elements.downloadImageBtn.addEventListener("click", async function () {
  await downloadImageAs(state.exportSettings.format);
});
elements.resetBtn.addEventListener("click", resetAll);

wireDropzone(elements.mainDrop, elements.mainLogoInput, "main");
wireDropzone(elements.sideDrop, elements.sideLogoInput, "side");

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="themePreference"]')) {
  radio.addEventListener("change", function () {
    if (radio.checked && isThemePreference(radio.value)) {
      themePreference = radio.value;
      saveThemePreference(storage, themePreference);
      applyTheme();
    }
  });
}
systemDarkQuery.addEventListener("change", applyTheme);

window.addEventListener("pagehide", function () {
  if (pendingSave !== undefined) {
    flushSave();
  }
});

buildFontOptions();
applyTheme();
render();
