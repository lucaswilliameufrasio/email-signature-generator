import { getElements } from "./app/elements";
import { createLogoBaker } from "./app/logo-baker";
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
import { loadImage, naturalSizeOf } from "./logos/bake-logo";
import type { createCropDialog } from "./logos/crop-dialog";
import { areaHeightForImage, frameLimits, isAlignment, isFitMode, resetFraming, type LogoFrame } from "./logos/logo-frame";
import { defaultMainLogo, defaultSideLogo } from "./signature/default-logos";
import { fontOptions } from "./signature/fonts";
import { buildSignature, type LogoImages } from "./signature/build-signature";
import { signatureLines, signaturePlainText } from "./signature/lines";
import { palettes } from "./signature/palettes";
import {
  defaultTextStyle,
  dividerLimits,
  isArrangement,
  isDividerStyle,
  isFontWeight,
  isLineKey,
  isTextAlignment,
  layoutLimits,
  textStyleLimits,
  type ContactKey,
  type DividerSettings,
  type LayoutSettings,
  type LineKey,
  type TextStyle
} from "./signature/style-model";
import {
  changeLanguage,
  createDefaultState,
  editText,
  exportScales,
  qualityLimits,
  updateLogo,
  type LogoTarget,
  type SignatureState,
  type TextField
} from "./state/signature-state";
import { browserStorage, clearState, loadState, saveState, type SaveResult } from "./state/storage";
import { isThemePreference, loadThemePreference, resolveTheme, saveThemePreference, type ThemePreference } from "./theme/theme";

const elements = getElements();
const storage = browserStorage();
const saveDelayMs = 300;

let state: SignatureState = loadState(storage, detectLanguage(navigator.language));
let pendingSave: ReturnType<typeof setTimeout> | undefined;
let lastSaveResult: SaveResult = "saved";
let renderedLanguage = "";
let editingTarget: LogoTarget = "main";
let editingLine: LineKey = "name";

const logoImages: LogoImages = { main: new Image(), side: new Image() };

const logoBaker = createLogoBaker(function (target, bakedSource) {
  logoImages[target].src = bakedSource;
}, function (error) {
  console.error(error);
});
let cropDialog: ReturnType<typeof createCropDialog> | undefined;

async function getCropDialog(): Promise<ReturnType<typeof createCropDialog>> {
  if (cropDialog === undefined) {
    const cropModule = await import("./logos/crop-dialog");
    cropDialog = cropModule.createCropDialog();
  }
  return cropDialog;
}

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
  const currentTexts = texts();
  syncControls(state, elements, { logo: editingTarget, line: editingLine }, currentTexts);
  const signature = buildSignature({
    state,
    texts: currentTexts,
    lines: signatureLines(state, currentTexts),
    logoImages
  });
  elements.signaturePreview.replaceChildren(signature);
  for (const target of ["main", "side"] as const) {
    logoBaker.request(target, logoSource(target), state.logos[target].frame);
  }
}

function logoSource(target: LogoTarget): string {
  const custom = state.logos[target].source;
  if (custom !== undefined) {
    return custom;
  }
  return target === "main" ? defaultMainLogo : defaultSideLogo;
}

function editingFrame(): LogoFrame {
  return state.logos[editingTarget].frame;
}

function updateEditingFrame(frame: LogoFrame): void {
  update(updateLogo(state, editingTarget, { ...state.logos[editingTarget], frame }));
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

async function setLogoFromFile(file: File): Promise<void> {
  if (!file.type.startsWith("image/")) {
    return;
  }
  const target = editingTarget;
  const source = await readAsDataUrl(file);
  const image = await loadImage(source);
  const cleanFrame = resetFraming(state.logos[target].frame);
  const frame = { ...cleanFrame, areaHeight: areaHeightForImage(cleanFrame, naturalSizeOf(image)) };
  const withLogo = updateLogo(state, target, { source, frame });
  const visibilityKey = target === "main" ? "showMain" : "showSide";
  update({ ...withLogo, logos: { ...withLogo.logos, [visibilityKey]: true } });
  setStatus(texts().statusLogoLoaded);
  flushSave();
}

function wireDropzone(zone: HTMLElement, input: HTMLInputElement): void {
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
      await setLogoFromFile(file);
    }
  });
  input.addEventListener("change", async function () {
    const file = input.files?.[0];
    if (file) {
      await setLogoFromFile(file);
    }
    input.value = "";
  });
}

async function openCrop(): Promise<void> {
  const target = editingTarget;
  const source = logoSource(target);
  const frame = state.logos[target].frame;
  try {
    const image = await loadImage(source);
    const request = {
      source,
      natural: naturalSizeOf(image),
      areaAspectRatio: frame.areaWidth / frame.areaHeight
    };
    const dialog = await getCropDialog();
    const result = await dialog.open(frame.crop === undefined ? request : { ...request, crop: frame.crop });
    if (result.kind === "cancelled") {
      return;
    }
    const { crop: _previousCrop, ...withoutCrop } = state.logos[target].frame;
    const nextFrame: LogoFrame = result.crop === undefined ? withoutCrop : { ...withoutCrop, crop: result.crop };
    update(updateLogo(state, target, { ...state.logos[target], frame: nextFrame }));
  } catch (error) {
    console.error(error);
    setStatus(texts().statusCropFailed);
  }
}

async function fitAreaToLogo(): Promise<void> {
  const target = editingTarget;
  const image = await loadImage(logoSource(target));
  const frame = state.logos[target].frame;
  update(updateLogo(state, target, {
    ...state.logos[target],
    frame: { ...frame, areaHeight: areaHeightForImage(frame, naturalSizeOf(image)) }
  }));
}

async function downloadAdjustedLogo(target: LogoTarget): Promise<void> {
  await logoBaker.ready();
  const bakedSource = logoBaker.baked(target);
  if (bakedSource === undefined) {
    return;
  }
  const response = await fetch(bakedSource);
  const currentTexts = texts();
  const baseName = target === "main" ? currentTexts.logoFileMain : currentTexts.logoFileSide;
  downloadBlob(await response.blob(), `${baseName}.png`);
}

function currentSignature(): HTMLTableElement {
  const signature = elements.signaturePreview.querySelector("#sigTable");
  if (!(signature instanceof HTMLTableElement)) {
    throw new Error("Signature preview is missing");
  }
  return signature;
}

function exportableClone(): HTMLElement {
  const clone = currentSignature().cloneNode(true);
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
  return signaturePlainText(signatureLines(state, texts()));
}

async function copySignature(logoSources: LogoSources): Promise<void> {
  await logoBaker.ready();
  const htmlContent = prepareEmailHtml(exportableClone(), logoSources);
  await copyRichHtml(htmlContent, plainTextSignature());
  setStatus(texts().statusCopied);
}

async function downloadImageAs(format: ImageFormat): Promise<void> {
  const currentTexts = texts();
  const details = describeFormat(format);
  const scale = details.usesScale ? state.exportSettings.scale : 1;
  try {
    await logoBaker.ready();
    const imageBlob = await exportImage({
      node: currentSignature(),
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

async function downloadHtml(): Promise<void> {
  await logoBaker.ready();
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
  elements.logoFileInput.value = "";
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

const contactInputs: ReadonlyArray<{ input: HTMLInputElement; key: ContactKey }> = [
  { input: elements.emailInput, key: "email" },
  { input: elements.websiteInput, key: "website" },
  { input: elements.linkedinInput, key: "linkedin" },
  { input: elements.instagramInput, key: "instagram" }
];

for (const contactInput of contactInputs) {
  contactInput.input.addEventListener("input", function () {
    update({ ...state, contacts: { ...state.contacts, [contactInput.key]: contactInput.input.value } });
  });
}

elements.showLabelsCheckbox.addEventListener("change", function () {
  update({ ...state, showLabels: elements.showLabelsCheckbox.checked });
});

function editingStyle(): TextStyle {
  return state.textStyles[editingLine];
}

function updateEditingStyle(style: TextStyle): void {
  update({ ...state, textStyles: { ...state.textStyles, [editingLine]: style } });
}

function decimalInput(input: HTMLInputElement, limits: { min: number; max: number }, fallback: number): number {
  const parsed = Number(input.value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(limits.max, Math.max(limits.min, Math.round(parsed * 100) / 100));
}

elements.lineSelect.addEventListener("change", function () {
  const line = elements.lineSelect.value;
  if (isLineKey(line)) {
    editingLine = line;
    render();
  }
});

elements.fontSizeInput.addEventListener("input", function () {
  const style = editingStyle();
  updateEditingStyle({ ...style, fontSize: clampNumber(elements.fontSizeInput.value, textStyleLimits.fontSize.min, textStyleLimits.fontSize.max, style.fontSize) });
});

elements.fontWeightInput.addEventListener("change", function () {
  const fontWeight = Number(elements.fontWeightInput.value);
  if (isFontWeight(fontWeight)) {
    updateEditingStyle({ ...editingStyle(), fontWeight });
  }
});

elements.spacingTopInput.addEventListener("input", function () {
  const style = editingStyle();
  updateEditingStyle({ ...style, spacingTop: clampNumber(elements.spacingTopInput.value, textStyleLimits.spacingTop.min, textStyleLimits.spacingTop.max, style.spacingTop) });
});

elements.indentInput.addEventListener("input", function () {
  const style = editingStyle();
  updateEditingStyle({ ...style, indent: clampNumber(elements.indentInput.value, textStyleLimits.indent.min, textStyleLimits.indent.max, style.indent) });
});

elements.letterSpacingInput.addEventListener("input", function () {
  const style = editingStyle();
  updateEditingStyle({ ...style, letterSpacing: decimalInput(elements.letterSpacingInput, textStyleLimits.letterSpacing, style.letterSpacing) });
});

elements.lineHeightInput.addEventListener("input", function () {
  const style = editingStyle();
  updateEditingStyle({ ...style, lineHeight: decimalInput(elements.lineHeightInput, textStyleLimits.lineHeight, style.lineHeight) });
});

elements.italicInput.addEventListener("change", function () {
  updateEditingStyle({ ...editingStyle(), italic: elements.italicInput.checked });
});

elements.uppercaseInput.addEventListener("change", function () {
  updateEditingStyle({ ...editingStyle(), uppercase: elements.uppercaseInput.checked });
});

elements.customColorInput.addEventListener("change", function () {
  const { color: _color, ...withoutColor } = editingStyle();
  updateEditingStyle(elements.customColorInput.checked ? { ...withoutColor, color: elements.lineColorInput.value } : withoutColor);
});

elements.lineColorInput.addEventListener("input", function () {
  updateEditingStyle({ ...editingStyle(), color: elements.lineColorInput.value });
});

elements.resetLineStyleBtn.addEventListener("click", function () {
  updateEditingStyle(defaultTextStyle(editingLine));
});

function updateLayout(layout: LayoutSettings): void {
  update({ ...state, layout });
}

function updateDivider(divider: DividerSettings): void {
  update({ ...state, divider });
}

elements.arrangementInput.addEventListener("change", function () {
  const arrangement = elements.arrangementInput.value;
  if (isArrangement(arrangement)) {
    updateLayout({ ...state.layout, arrangement });
  }
});

elements.textAlignInput.addEventListener("change", function () {
  const textAlign = elements.textAlignInput.value;
  if (isTextAlignment(textAlign)) {
    updateLayout({ ...state.layout, textAlign });
  }
});

elements.paddingXInput.addEventListener("input", function () {
  updateLayout({ ...state.layout, paddingX: clampNumber(elements.paddingXInput.value, layoutLimits.padding.min, layoutLimits.padding.max, state.layout.paddingX) });
});

elements.paddingYInput.addEventListener("input", function () {
  updateLayout({ ...state.layout, paddingY: clampNumber(elements.paddingYInput.value, layoutLimits.padding.min, layoutLimits.padding.max, state.layout.paddingY) });
});

elements.showDividerInput.addEventListener("change", function () {
  updateDivider({ ...state.divider, show: elements.showDividerInput.checked });
});

elements.dividerStyleInput.addEventListener("change", function () {
  const style = elements.dividerStyleInput.value;
  if (isDividerStyle(style)) {
    updateDivider({ ...state.divider, style });
  }
});

elements.dividerThicknessInput.addEventListener("input", function () {
  updateDivider({ ...state.divider, thickness: clampNumber(elements.dividerThicknessInput.value, dividerLimits.thickness.min, dividerLimits.thickness.max, state.divider.thickness) });
});

elements.dividerHeightModeInput.addEventListener("change", function () {
  updateDivider({ ...state.divider, heightMode: elements.dividerHeightModeInput.value === "fixed" ? "fixed" : "auto" });
});

elements.dividerLengthInput.addEventListener("input", function () {
  updateDivider({ ...state.divider, length: clampNumber(elements.dividerLengthInput.value, dividerLimits.length.min, dividerLimits.length.max, state.divider.length) });
});

elements.gapBeforeInput.addEventListener("input", function () {
  updateDivider({ ...state.divider, gapBefore: clampNumber(elements.gapBeforeInput.value, dividerLimits.gap.min, dividerLimits.gap.max, state.divider.gapBefore) });
});

elements.gapAfterInput.addEventListener("input", function () {
  updateDivider({ ...state.divider, gapAfter: clampNumber(elements.gapAfterInput.value, dividerLimits.gap.min, dividerLimits.gap.max, state.divider.gapAfter) });
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

for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="logoTarget"]')) {
  radio.addEventListener("change", function () {
    if (radio.checked) {
      editingTarget = radio.value === "side" ? "side" : "main";
      render();
    }
  });
}

function clampedInput(input: HTMLInputElement, limits: { min: number; max: number }, fallback: number): number {
  return clampNumber(input.value, limits.min, limits.max, fallback);
}

elements.areaWidthInput.addEventListener("input", function () {
  const frame = editingFrame();
  updateEditingFrame({ ...frame, areaWidth: clampedInput(elements.areaWidthInput, frameLimits.areaWidth[editingTarget], frame.areaWidth) });
});

elements.areaHeightInput.addEventListener("input", function () {
  const frame = editingFrame();
  updateEditingFrame({ ...frame, areaHeight: clampedInput(elements.areaHeightInput, frameLimits.areaHeight, frame.areaHeight) });
});

elements.zoomInput.addEventListener("input", function () {
  const frame = editingFrame();
  updateEditingFrame({ ...frame, zoom: clampedInput(elements.zoomInput, frameLimits.zoom, frame.zoom) });
});

elements.offsetXInput.addEventListener("input", function () {
  const frame = editingFrame();
  updateEditingFrame({ ...frame, offsetX: clampedInput(elements.offsetXInput, frameLimits.offset, frame.offsetX) });
});

elements.offsetYInput.addEventListener("input", function () {
  const frame = editingFrame();
  updateEditingFrame({ ...frame, offsetY: clampedInput(elements.offsetYInput, frameLimits.offset, frame.offsetY) });
});

elements.fitModeInput.addEventListener("change", function () {
  const fit = elements.fitModeInput.value;
  if (isFitMode(fit)) {
    updateEditingFrame({ ...editingFrame(), fit });
  }
});

for (const button of document.querySelectorAll<HTMLButtonElement>(".align-grid button[data-align]")) {
  button.addEventListener("click", function () {
    const align = button.dataset["align"];
    if (isAlignment(align)) {
      updateEditingFrame({ ...editingFrame(), align });
    }
  });
}

elements.fitAreaBtn.addEventListener("click", async function () {
  await fitAreaToLogo();
});

elements.cropBtn.addEventListener("click", async function () {
  await openCrop();
});

elements.removeCropBtn.addEventListener("click", function () {
  const { crop: _crop, ...frame } = editingFrame();
  updateEditingFrame(frame);
});

elements.resetFrameBtn.addEventListener("click", function () {
  updateEditingFrame(resetFraming(editingFrame()));
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
  },
  downloadAdjustedLogo
});

elements.copyHtmlBtn.addEventListener("click", function () {
  copyJourney.open();
});
elements.downloadHtmlBtn.addEventListener("click", async function () {
  await downloadHtml();
});
elements.downloadImageBtn.addEventListener("click", async function () {
  await downloadImageAs(state.exportSettings.format);
});
elements.resetBtn.addEventListener("click", resetAll);

wireDropzone(elements.logoDrop, elements.logoFileInput);

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
