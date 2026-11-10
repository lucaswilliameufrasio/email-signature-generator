import { describeFormat } from "../export/image-format";
import { frameLimits } from "../logos/logo-frame";
import type { TranslationTable } from "../i18n/translations";
import type { LogoTarget, SignatureState } from "../state/signature-state";
import { isContactKey, type LineKey } from "../signature/style-model";
import type { AppElements } from "./elements";

function setValue(control: HTMLInputElement | HTMLSelectElement, value: string): void {
  if (control.value !== value) {
    control.value = value;
  }
}

function syncLogoEditor(state: SignatureState, elements: AppElements, editingTarget: LogoTarget): void {
  const frame = state.logos[editingTarget].frame;
  const widthLimits = frameLimits.areaWidth[editingTarget];

  for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="logoTarget"]')) {
    radio.checked = radio.value === editingTarget;
  }
  elements.areaWidthInput.min = String(widthLimits.min);
  elements.areaWidthInput.max = String(widthLimits.max);
  setValue(elements.areaWidthInput, String(frame.areaWidth));
  setValue(elements.areaHeightInput, String(frame.areaHeight));
  setValue(elements.fitModeInput, frame.fit);
  setValue(elements.zoomInput, String(frame.zoom));
  setValue(elements.offsetXInput, String(frame.offsetX));
  setValue(elements.offsetYInput, String(frame.offsetY));
  elements.areaWidthValue.textContent = `${frame.areaWidth}px`;
  elements.areaHeightValue.textContent = `${frame.areaHeight}px`;
  elements.zoomValue.textContent = `${frame.zoom}%`;
  elements.offsetXValue.textContent = `${frame.offsetX}px`;
  elements.offsetYValue.textContent = `${frame.offsetY}px`;
  elements.removeCropBtn.hidden = frame.crop === undefined;

  for (const button of document.querySelectorAll<HTMLButtonElement>(".align-grid button[data-align]")) {
    button.setAttribute("aria-pressed", String(button.dataset["align"] === frame.align));
  }
}

function syncLineEditor(state: SignatureState, elements: AppElements, editingLine: LineKey, texts: TranslationTable): void {
  const style = state.textStyles[editingLine];
  setValue(elements.lineSelect, editingLine);
  setValue(elements.fontSizeInput, String(style.fontSize));
  setValue(elements.fontWeightInput, String(style.fontWeight));
  setValue(elements.spacingTopInput, String(style.spacingTop));
  setValue(elements.indentInput, String(style.indent));
  setValue(elements.letterSpacingInput, String(style.letterSpacing));
  setValue(elements.lineHeightInput, String(style.lineHeight));
  elements.fontSizeValue.textContent = `${style.fontSize}px`;
  elements.spacingTopValue.textContent = `${style.spacingTop}px`;
  elements.indentValue.textContent = `${style.indent}px`;
  elements.letterSpacingValue.textContent = `${style.letterSpacing}px`;
  elements.lineHeightValue.textContent = String(style.lineHeight);
  elements.italicInput.checked = style.italic;
  elements.uppercaseInput.checked = style.uppercase;

  const hasOwnColor = style.color !== undefined;
  elements.customColorInput.checked = hasOwnColor;
  elements.lineColorInput.disabled = !hasOwnColor;
  const paletteColor = editingLine === "role" || isContactKey(editingLine) ? state.colors.accent : state.colors.text;
  setValue(elements.lineColorInput, style.color ?? paletteColor);
  if (hasOwnColor) {
    elements.lineColorHint.textContent = "";
  } else if (editingLine === "role") {
    elements.lineColorHint.textContent = texts.lineUsesAccentColor;
  } else if (isContactKey(editingLine)) {
    elements.lineColorHint.textContent = texts.lineUsesTextAndAccent;
  } else {
    elements.lineColorHint.textContent = texts.lineUsesTextColor;
  }
}

function syncLayout(state: SignatureState, elements: AppElements): void {
  const { layout, divider } = state;
  setValue(elements.arrangementInput, layout.arrangement);
  setValue(elements.textAlignInput, layout.textAlign);
  setValue(elements.paddingXInput, String(layout.paddingX));
  setValue(elements.paddingYInput, String(layout.paddingY));
  elements.paddingXValue.textContent = `${layout.paddingX}px`;
  elements.paddingYValue.textContent = `${layout.paddingY}px`;

  elements.showDividerInput.checked = divider.show;
  setValue(elements.dividerStyleInput, divider.style);
  setValue(elements.dividerThicknessInput, String(divider.thickness));
  setValue(elements.dividerHeightModeInput, divider.heightMode);
  setValue(elements.dividerLengthInput, String(divider.length));
  setValue(elements.gapBeforeInput, String(divider.gapBefore));
  setValue(elements.gapAfterInput, String(divider.gapAfter));
  elements.dividerThicknessValue.textContent = `${divider.thickness}px`;
  elements.dividerLengthValue.textContent = `${divider.length}px`;
  elements.gapBeforeValue.textContent = `${divider.gapBefore}px`;
  elements.gapAfterValue.textContent = `${divider.gapAfter}px`;
  elements.dividerLengthInput.disabled = divider.heightMode !== "fixed";
  for (const control of [elements.dividerStyleInput, elements.dividerThicknessInput, elements.dividerHeightModeInput, elements.gapAfterInput]) {
    control.disabled = !divider.show;
  }
  if (!divider.show) {
    elements.dividerLengthInput.disabled = true;
  }
}

export type EditorFocus = {
  logo: LogoTarget;
  line: LineKey;
};

export function syncControls(state: SignatureState, elements: AppElements, focus: EditorFocus, texts: TranslationTable): void {
  const editingTarget = focus.logo;
  setValue(elements.langSelect, state.language);
  setValue(elements.nameInput, state.name);
  setValue(elements.roleInput, state.role);
  setValue(elements.phoneInput, state.phone);
  setValue(elements.fontFamilyInput, state.fontFamily);
  elements.showCountryCodeCheckbox.checked = state.showCountryCode;
  setValue(elements.emailInput, state.contacts.email);
  setValue(elements.websiteInput, state.contacts.website);
  setValue(elements.linkedinInput, state.contacts.linkedin);
  setValue(elements.instagramInput, state.contacts.instagram);
  elements.showLabelsCheckbox.checked = state.showLabels;
  syncLineEditor(state, elements, focus.line, texts);
  syncLayout(state, elements);

  elements.showMainLogoCheckbox.checked = state.logos.showMain;
  elements.showSideLogoCheckbox.checked = state.logos.showSide;
  setValue(elements.logoLayoutInput, state.logos.layout);
  syncLogoEditor(state, elements, editingTarget);

  setValue(elements.textColorInput, state.colors.text);
  setValue(elements.dividerColorInput, state.colors.divider);
  setValue(elements.accentColorInput, state.colors.accent);
  setValue(elements.bgColorInput, state.colors.background);

  const formatDetails = describeFormat(state.exportSettings.format);
  setValue(elements.exportFormatInput, state.exportSettings.format);
  setValue(elements.exportScaleInput, String(state.exportSettings.scale));
  setValue(elements.exportQualityInput, String(state.exportSettings.quality));
  elements.qualityField.hidden = !formatDetails.usesQuality;
  elements.qualityValueLabel.textContent = `${state.exportSettings.quality}%`;
  elements.exportScaleInput.disabled = !formatDetails.usesScale;
  elements.webpWarning.hidden = state.exportSettings.format !== "webp";
}
