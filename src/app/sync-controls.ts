import { describeFormat } from "../export/image-format";
import { frameLimits } from "../logos/logo-frame";
import type { LogoTarget, SignatureState } from "../state/signature-state";
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

export function syncControls(state: SignatureState, elements: AppElements, editingTarget: LogoTarget): void {
  setValue(elements.langSelect, state.language);
  setValue(elements.nameInput, state.name);
  setValue(elements.roleInput, state.role);
  setValue(elements.phoneInput, state.phone);
  setValue(elements.fontFamilyInput, state.fontFamily);
  elements.showCountryCodeCheckbox.checked = state.showCountryCode;

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
