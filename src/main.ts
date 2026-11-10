import { toPng } from "html-to-image";
import { requireElement } from "./dom";
import { detectLanguage, isLanguage } from "./i18n/language";
import { isTranslationKey, translations, type Language, type TranslationTable } from "./i18n/translations";
import { defaultMainLogo, defaultSideLogo } from "./signature/default-logos";
import { palettes } from "./signature/palettes";
import { formatPhoneLine } from "./signature/phone";
import { downloadBlob, downloadDataUrl } from "./export/download";
import { buildHtmlDocument } from "./export/svg-document";

const langSelect = requireElement("langSelect", HTMLSelectElement);
const nameInput = requireElement("nameInput", HTMLInputElement);
const roleInput = requireElement("roleInput", HTMLInputElement);
const phoneInput = requireElement("phoneInput", HTMLInputElement);
const fontFamilyInput = requireElement("fontFamilyInput", HTMLSelectElement);
const dirtyFields = new Set<string>();
const showCountryCodeCheckbox = requireElement("showCountryCode", HTMLInputElement);

const showMainLogoCheckbox = requireElement("showMainLogo", HTMLInputElement);
const showSideLogoCheckbox = requireElement("showSideLogo", HTMLInputElement);
const logoLayoutInput = requireElement("logoLayoutInput", HTMLSelectElement);
const mainLogoWidthInput = requireElement("mainLogoWidthInput", HTMLInputElement);
const sideLogoWidthInput = requireElement("sideLogoWidthInput", HTMLInputElement);
const mainSizeLabel = requireElement("mainSizeLabel", HTMLSpanElement);
const sideSizeLabel = requireElement("sideSizeLabel", HTMLSpanElement);

const mainLogoInput = requireElement("mainLogoInput", HTMLInputElement);
const sideLogoInput = requireElement("sideLogoInput", HTMLInputElement);
const mainDrop = requireElement("mainDrop", HTMLDivElement);
const sideDrop = requireElement("sideDrop", HTMLDivElement);

const textColorInput = requireElement("textColorInput", HTMLInputElement);
const dividerColorInput = requireElement("dividerColorInput", HTMLInputElement);
const accentColorInput = requireElement("accentColorInput", HTMLInputElement);
const bgColorInput = requireElement("bgColorInput", HTMLInputElement);
const paletteGrid = requireElement("paletteGrid", HTMLDivElement);

const downloadImageBtn = requireElement("downloadImageBtn", HTMLButtonElement);
const downloadHtmlBtn = requireElement("downloadHtmlBtn", HTMLButtonElement);
const copyHtmlBtn = requireElement("copyHtmlBtn", HTMLButtonElement);
const resetBtn = requireElement("resetBtn", HTMLButtonElement);
const exportStatus = requireElement("exportStatus", HTMLDivElement);

const sigTable = requireElement("sigTable", HTMLTableElement);
const logosCell = requireElement("logosCell", HTMLTableCellElement);
const dividerCell = requireElement("dividerCell", HTMLTableCellElement);
const dividerBar = requireElement("dividerBar", HTMLDivElement);
const nameEl = requireElement("nameEl", HTMLDivElement);
const roleEl = requireElement("roleEl", HTMLDivElement);
const phoneEl = requireElement("phoneEl", HTMLDivElement);

const logosHorizontal = requireElement("logosHorizontal", HTMLTableElement);
const logosVertical = requireElement("logosVertical", HTMLTableElement);

const mainLogo = requireElement("mainLogo", HTMLImageElement);
const sideLogo = requireElement("sideLogo", HTMLImageElement);
const mainLogoClone = requireElement("mainLogoClone", HTMLImageElement);
const sideLogoClone = requireElement("sideLogoClone", HTMLImageElement);

const mainLogoWrapH = requireElement("mainLogoWrapH", HTMLTableCellElement);
const sideLogoWrapH = requireElement("sideLogoWrapH", HTMLTableCellElement);
const mainLogoWrapV = requireElement("mainLogoWrapV", HTMLTableCellElement);
const sideLogoWrapV = requireElement("sideLogoWrapV", HTMLTableCellElement);

type LogoTarget = "main" | "side";

function currentLanguage(): Language {
  const selectedLanguage = langSelect.value;
  if (isLanguage(selectedLanguage)) {
    return selectedLanguage;
  }
  return "pt-BR";
}

function currentTexts(): TranslationTable {
  return translations[currentLanguage()];
}

function setStatus(statusText: string): void {
  exportStatus.textContent = statusText;
}

function translatedValue(element: Element, attributeName: string): string | undefined {
  const key = element.getAttribute(attributeName);
  if (key === null || !isTranslationKey(key)) {
    return undefined;
  }
  return currentTexts()[key];
}

function applyLanguage(): void {
  document.documentElement.lang = currentLanguage();

  for (const element of document.querySelectorAll("[data-i18n]")) {
    const text = translatedValue(element, "data-i18n");
    if (text !== undefined) {
      element.textContent = text;
    }
  }

  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    const text = translatedValue(element, "data-i18n-placeholder");
    if (text !== undefined && element instanceof HTMLInputElement) {
      element.placeholder = text;
    }
  }

  for (const element of document.querySelectorAll("[data-i18n-opt]")) {
    const text = translatedValue(element, "data-i18n-opt");
    if (text !== undefined) {
      element.textContent = text;
    }
  }

  for (const element of document.querySelectorAll("[data-i18n-alt]")) {
    const text = translatedValue(element, "data-i18n-alt");
    if (text !== undefined && element instanceof HTMLImageElement) {
      element.alt = text;
    }
  }

  for (const element of document.querySelectorAll("[data-i18n-value]")) {
    if (dirtyFields.has(element.id)) {
      continue;
    }
    const text = translatedValue(element, "data-i18n-value");
    if (text !== undefined && element instanceof HTMLInputElement) {
      element.value = text;
    }
  }

  applyText();
  buildPalettes();
}

function buildPalettes(): void {
  paletteGrid.innerHTML = "";
  for (const palette of palettes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "palette";
    const paletteName = currentTexts()[palette.name];
    button.innerHTML = `
          <div class="swatches">
            <span class="sw" style="background:${palette.text}"></span>
            <span class="sw" style="background:${palette.divider}"></span>
            <span class="sw" style="background:${palette.accent}"></span>
            <span class="sw" style="background:${palette.bg}"></span>
          </div>
          ${paletteName}
        `;
    button.addEventListener("click", function () {
      textColorInput.value = palette.text;
      dividerColorInput.value = palette.divider;
      accentColorInput.value = palette.accent;
      bgColorInput.value = palette.bg;
      applyColors();
    });
    paletteGrid.appendChild(button);
  }
}

function syncLogoSources(): void {
  mainLogoClone.src = mainLogo.src;
  sideLogoClone.src = sideLogo.src;
}

function applyText(): void {
  nameEl.textContent = nameInput.value;
  roleEl.textContent = roleInput.value;
  phoneEl.textContent = formatPhoneLine(phoneInput.value, showCountryCodeCheckbox.checked, currentTexts().phonePrefix);
}

function applyFont(): void {
  const fontFamily = fontFamilyInput.value;
  sigTable.style.fontFamily = fontFamily;
  nameEl.style.fontFamily = fontFamily;
  roleEl.style.fontFamily = fontFamily;
  phoneEl.style.fontFamily = fontFamily;
}

function applyColors(): void {
  sigTable.style.background = bgColorInput.value;
  nameEl.style.color = textColorInput.value;
  roleEl.style.color = textColorInput.value;
  phoneEl.style.color = textColorInput.value;
  dividerBar.style.background = dividerColorInput.value;
  sigTable.setAttribute("data-accent", accentColorInput.value);
}

function applyLogoSizes(): void {
  const mainWidth = parseInt(mainLogoWidthInput.value, 10);
  const sideWidth = parseInt(sideLogoWidthInput.value, 10);

  mainSizeLabel.textContent = `${mainWidth}px`;
  sideSizeLabel.textContent = `${sideWidth}px`;

  for (const image of [mainLogo, mainLogoClone]) {
    image.style.width = `${mainWidth}px`;
    image.style.height = "auto";
  }

  for (const image of [sideLogo, sideLogoClone]) {
    image.style.width = `${sideWidth}px`;
    image.style.height = "auto";
  }
}

function applyLogosVisibilityAndLayout(): void {
  const hasMain = showMainLogoCheckbox.checked;
  const hasSide = showSideLogoCheckbox.checked;
  const hasAny = hasMain || hasSide;
  const vertical = logoLayoutInput.value === "vertical";

  logosCell.style.display = hasAny ? "" : "none";
  dividerCell.style.display = hasAny ? "" : "none";

  logosHorizontal.style.display = vertical ? "none" : "";
  logosVertical.style.display = vertical ? "" : "none";

  mainLogoWrapH.style.display = hasMain ? "" : "none";
  sideLogoWrapH.style.display = hasSide ? "" : "none";
  mainLogoWrapV.style.display = hasMain ? "" : "none";
  sideLogoWrapV.style.display = hasSide ? "" : "none";

  mainLogoWrapH.style.paddingRight = hasMain && hasSide ? "12px" : "0";
  mainLogoWrapV.style.paddingBottom = hasMain && hasSide ? "8px" : "0";
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
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function setLogoFromFile(file: File, targetType: LogoTarget): Promise<void> {
  if (!file.type.startsWith("image/")) {
    return;
  }
  const data = await readAsDataUrl(file);

  if (targetType === "main") {
    mainLogo.src = data;
  } else {
    sideLogo.src = data;
  }

  syncLogoSources();
  applyLogoSizes();
  applyLogosVisibilityAndLayout();
  setStatus(currentTexts().statusLogoLoaded);
}

function wireDropzone(zone: HTMLElement, input: HTMLInputElement, targetType: LogoTarget): void {
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
      await setLogoFromFile(file, targetType);
    }
  });

  input.addEventListener("change", async function () {
    const file = input.files?.[0];
    if (file) {
      await setLogoFromFile(file, targetType);
    }
  });
}

function inlineForExport(root: HTMLElement): void {
  root.style.fontFamily = fontFamilyInput.value;
  root.style.background = bgColorInput.value;
  root.style.minWidth = "0";

  for (const elementId of ["nameEl", "roleEl", "phoneEl"]) {
    const textElement = root.querySelector<HTMLElement>(`#${elementId}`);
    if (textElement) {
      textElement.style.color = textColorInput.value;
      textElement.style.fontFamily = fontFamilyInput.value;
    }
  }

  const dividerElement = root.querySelector<HTMLElement>("#dividerBar");
  if (dividerElement) {
    dividerElement.style.background = dividerColorInput.value;
  }
}

function exportableClone(): HTMLElement {
  const clone = sigTable.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    throw new Error("Signature clone is not an element");
  }
  inlineForExport(clone);
  return clone;
}

async function copyHtml(): Promise<void> {
  await navigator.clipboard.writeText(exportableClone().outerHTML);
  setStatus(currentTexts().statusCopied);
}

async function downloadImage(): Promise<void> {
  const dataUrl = await toPng(sigTable, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#f3f4f6"
  });
  downloadDataUrl(dataUrl, "assinatura.png");
}

function downloadHtml(): void {
  const htmlContent = buildHtmlDocument(exportableClone().outerHTML, currentLanguage());
  downloadBlob(new Blob([htmlContent], { type: "text/html;charset=utf-8" }), "assinatura.html");
  setStatus(currentTexts().statusHtmlDownloaded);
}

function resetAll(): void {
  dirtyFields.clear();
  nameInput.value = "Nome Sobrenome";
  roleInput.value = "Cargo ou área";
  phoneInput.value = "+55 (00) 0000-0000";
  fontFamilyInput.value = "Arial,Helvetica,sans-serif";

  showMainLogoCheckbox.checked = true;
  showSideLogoCheckbox.checked = false;
  showCountryCodeCheckbox.checked = true;
  logoLayoutInput.value = "horizontal";
  mainLogoWidthInput.value = "260";
  sideLogoWidthInput.value = "120";

  textColorInput.value = "#1f3b73";
  dividerColorInput.value = "#1f3b73";
  accentColorInput.value = "#37b37e";
  bgColorInput.value = "#f3f4f6";

  mainLogo.src = defaultMainLogo;
  sideLogo.src = defaultSideLogo;
  syncLogoSources();

  mainLogoInput.value = "";
  sideLogoInput.value = "";

  applyText();
  applyFont();
  applyColors();
  applyLogoSizes();
  applyLogosVisibilityAndLayout();
  setStatus("");
}

for (const element of [nameInput, roleInput, phoneInput]) {
  element.addEventListener("input", function () {
    dirtyFields.add(element.id);
    applyText();
  });
}
fontFamilyInput.addEventListener("change", applyFont);
for (const element of [textColorInput, dividerColorInput, accentColorInput, bgColorInput]) {
  element.addEventListener("input", applyColors);
}
for (const element of [showMainLogoCheckbox, showSideLogoCheckbox]) {
  element.addEventListener("change", applyLogosVisibilityAndLayout);
}
showCountryCodeCheckbox.addEventListener("change", applyText);
logoLayoutInput.addEventListener("change", applyLogosVisibilityAndLayout);
mainLogoWidthInput.addEventListener("input", applyLogoSizes);
sideLogoWidthInput.addEventListener("input", applyLogoSizes);

copyHtmlBtn.addEventListener("click", async function () {
  try {
    await copyHtml();
  } catch {
    setStatus(currentTexts().statusCopyFailed);
  }
});

downloadHtmlBtn.addEventListener("click", downloadHtml);
downloadImageBtn.addEventListener("click", async function () {
  await downloadImage();
});
resetBtn.addEventListener("click", resetAll);

langSelect.addEventListener("change", applyLanguage);

wireDropzone(mainDrop, mainLogoInput, "main");
wireDropzone(sideDrop, sideLogoInput, "side");

langSelect.value = detectLanguage(navigator.language);
buildPalettes();
resetAll();
applyLanguage();
