import { requireElement } from "../dom";

export function getElements() {
  return {
    langSelect: requireElement("langSelect", HTMLSelectElement),
    nameInput: requireElement("nameInput", HTMLInputElement),
    roleInput: requireElement("roleInput", HTMLInputElement),
    phoneInput: requireElement("phoneInput", HTMLInputElement),
    fontFamilyInput: requireElement("fontFamilyInput", HTMLSelectElement),
    showCountryCodeCheckbox: requireElement("showCountryCode", HTMLInputElement),

    showMainLogoCheckbox: requireElement("showMainLogo", HTMLInputElement),
    showSideLogoCheckbox: requireElement("showSideLogo", HTMLInputElement),
    logoLayoutInput: requireElement("logoLayoutInput", HTMLSelectElement),
    mainLogoWidthInput: requireElement("mainLogoWidthInput", HTMLInputElement),
    sideLogoWidthInput: requireElement("sideLogoWidthInput", HTMLInputElement),
    mainSizeLabel: requireElement("mainSizeLabel", HTMLSpanElement),
    sideSizeLabel: requireElement("sideSizeLabel", HTMLSpanElement),
    mainLogoInput: requireElement("mainLogoInput", HTMLInputElement),
    sideLogoInput: requireElement("sideLogoInput", HTMLInputElement),
    mainDrop: requireElement("mainDrop", HTMLDivElement),
    sideDrop: requireElement("sideDrop", HTMLDivElement),

    textColorInput: requireElement("textColorInput", HTMLInputElement),
    dividerColorInput: requireElement("dividerColorInput", HTMLInputElement),
    accentColorInput: requireElement("accentColorInput", HTMLInputElement),
    bgColorInput: requireElement("bgColorInput", HTMLInputElement),
    paletteGrid: requireElement("paletteGrid", HTMLDivElement),

    exportFormatInput: requireElement("exportFormatInput", HTMLSelectElement),
    exportScaleInput: requireElement("exportScaleInput", HTMLSelectElement),
    exportQualityInput: requireElement("exportQualityInput", HTMLInputElement),
    qualityField: requireElement("qualityField", HTMLDivElement),
    qualityValueLabel: requireElement("qualityValueLabel", HTMLSpanElement),
    webpWarning: requireElement("webpWarning", HTMLParagraphElement),
    downloadImageBtn: requireElement("downloadImageBtn", HTMLButtonElement),
    downloadHtmlBtn: requireElement("downloadHtmlBtn", HTMLButtonElement),
    copyHtmlBtn: requireElement("copyHtmlBtn", HTMLButtonElement),
    resetBtn: requireElement("resetBtn", HTMLButtonElement),
    exportStatus: requireElement("exportStatus", HTMLDivElement),

    sigTable: requireElement("sigTable", HTMLTableElement),
    logosCell: requireElement("logosCell", HTMLTableCellElement),
    dividerCell: requireElement("dividerCell", HTMLTableCellElement),
    dividerBar: requireElement("dividerBar", HTMLDivElement),
    nameEl: requireElement("nameEl", HTMLDivElement),
    roleEl: requireElement("roleEl", HTMLDivElement),
    phoneEl: requireElement("phoneEl", HTMLDivElement),
    logosHorizontal: requireElement("logosHorizontal", HTMLTableElement),
    logosVertical: requireElement("logosVertical", HTMLTableElement),
    mainLogo: requireElement("mainLogo", HTMLImageElement),
    sideLogo: requireElement("sideLogo", HTMLImageElement),
    mainLogoClone: requireElement("mainLogoClone", HTMLImageElement),
    sideLogoClone: requireElement("sideLogoClone", HTMLImageElement),
    mainLogoWrapH: requireElement("mainLogoWrapH", HTMLTableCellElement),
    sideLogoWrapH: requireElement("sideLogoWrapH", HTMLTableCellElement),
    mainLogoWrapV: requireElement("mainLogoWrapV", HTMLTableCellElement),
    sideLogoWrapV: requireElement("sideLogoWrapV", HTMLTableCellElement)
  };
}

export type AppElements = ReturnType<typeof getElements>;
