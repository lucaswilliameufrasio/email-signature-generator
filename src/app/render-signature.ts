import type { TranslationTable } from "../i18n/translations";
import { formatPhoneLine } from "../signature/phone";
import type { SignatureState } from "../state/signature-state";
import type { LogoFrame } from "../logos/logo-frame";
import type { AppElements } from "./elements";

function setLine(element: HTMLElement, text: string, color: string, fontFamily: string): void {
  element.textContent = text;
  element.style.display = text.trim() === "" ? "none" : "";
  element.style.color = color;
  element.style.fontFamily = fontFamily;
}

function showWhen(element: HTMLElement, visible: boolean): void {
  element.style.display = visible ? "" : "none";
}

function sizeLogo(image: HTMLImageElement, frame: LogoFrame): void {
  image.width = frame.areaWidth;
  image.height = frame.areaHeight;
  image.style.width = `${frame.areaWidth}px`;
  image.style.height = `${frame.areaHeight}px`;
}

export function renderSignature(state: SignatureState, elements: AppElements, texts: TranslationTable): void {
  const { colors, logos } = state;

  elements.sigTable.style.fontFamily = state.fontFamily;
  elements.sigTable.style.background = colors.background;
  elements.dividerBar.style.background = colors.divider;

  setLine(elements.nameEl, state.name, colors.text, state.fontFamily);
  setLine(elements.roleEl, state.role, colors.accent, state.fontFamily);
  setLine(elements.phoneEl, formatPhoneLine(state.phone, state.showCountryCode, texts.phonePrefix), colors.text, state.fontFamily);

  for (const image of [elements.mainLogo, elements.mainLogoClone]) {
    sizeLogo(image, logos.main.frame);
  }
  for (const image of [elements.sideLogo, elements.sideLogoClone]) {
    sizeLogo(image, logos.side.frame);
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

export function applyBakedLogo(elements: AppElements, target: "main" | "side", bakedSource: string): void {
  const images = target === "main" ? [elements.mainLogo, elements.mainLogoClone] : [elements.sideLogo, elements.sideLogoClone];
  for (const image of images) {
    image.src = bakedSource;
  }
}
