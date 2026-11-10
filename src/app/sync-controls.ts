import { describeFormat } from "../export/image-format";
import type { SignatureState } from "../state/signature-state";
import type { AppElements } from "./elements";

function setValue(control: HTMLInputElement | HTMLSelectElement, value: string): void {
  if (control.value !== value) {
    control.value = value;
  }
}

export function syncControls(state: SignatureState, elements: AppElements): void {
  setValue(elements.langSelect, state.language);
  setValue(elements.nameInput, state.name);
  setValue(elements.roleInput, state.role);
  setValue(elements.phoneInput, state.phone);
  setValue(elements.fontFamilyInput, state.fontFamily);
  elements.showCountryCodeCheckbox.checked = state.showCountryCode;

  elements.showMainLogoCheckbox.checked = state.logos.showMain;
  elements.showSideLogoCheckbox.checked = state.logos.showSide;
  setValue(elements.logoLayoutInput, state.logos.layout);
  setValue(elements.mainLogoWidthInput, String(state.logos.mainWidth));
  setValue(elements.sideLogoWidthInput, String(state.logos.sideWidth));
  elements.mainSizeLabel.textContent = `${state.logos.mainWidth}px`;
  elements.sideSizeLabel.textContent = `${state.logos.sideWidth}px`;

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
