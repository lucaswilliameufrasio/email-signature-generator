import type { TranslationTable } from "../i18n/translations";
import { defaultMainLogo, defaultSideLogo } from "../signature/default-logos";
import { formatPhoneLine } from "../signature/phone";
import type { SignatureState } from "../state/signature-state";
import type { AppElements } from "./elements";

function setLine(element: HTMLElement, text: string, color: string, fontFamily: string): void {
  element.textContent = text;
  element.style.display = text.trim() === "" ? "none" : "";
  element.style.color = color;
  element.style.fontFamily = fontFamily;
}

function setSource(image: HTMLImageElement, source: string): void {
  if (image.getAttribute("src") !== source) {
    image.src = source;
  }
}

function showWhen(element: HTMLElement, visible: boolean): void {
  element.style.display = visible ? "" : "none";
}

export function renderSignature(state: SignatureState, elements: AppElements, texts: TranslationTable): void {
  const { colors, logos } = state;

  elements.sigTable.style.fontFamily = state.fontFamily;
  elements.sigTable.style.background = colors.background;
  elements.dividerBar.style.background = colors.divider;

  setLine(elements.nameEl, state.name, colors.text, state.fontFamily);
  setLine(elements.roleEl, state.role, colors.accent, state.fontFamily);
  setLine(elements.phoneEl, formatPhoneLine(state.phone, state.showCountryCode, texts.phonePrefix), colors.text, state.fontFamily);

  const mainSource = logos.mainSource ?? defaultMainLogo;
  const sideSource = logos.sideSource ?? defaultSideLogo;
  for (const image of [elements.mainLogo, elements.mainLogoClone]) {
    setSource(image, mainSource);
    image.style.width = `${logos.mainWidth}px`;
    image.style.height = "auto";
  }
  for (const image of [elements.sideLogo, elements.sideLogoClone]) {
    setSource(image, sideSource);
    image.style.width = `${logos.sideWidth}px`;
    image.style.height = "auto";
  }

  const hasAnyLogo = logos.showMain || logos.showSide;
  const vertical = logos.layout === "vertical";
  showWhen(elements.logosCell, hasAnyLogo);
  showWhen(elements.dividerCell, hasAnyLogo);
  showWhen(elements.logosHorizontal, !vertical);
  showWhen(elements.logosVertical, vertical);
  showWhen(elements.mainLogoWrapH, logos.showMain);
  showWhen(elements.sideLogoWrapH, logos.showSide);
  showWhen(elements.mainLogoWrapV, logos.showMain);
  showWhen(elements.sideLogoWrapV, logos.showSide);
  elements.mainLogoWrapH.style.paddingRight = logos.showMain && logos.showSide ? "12px" : "0";
  elements.mainLogoWrapV.style.paddingBottom = logos.showMain && logos.showSide ? "8px" : "0";
}
