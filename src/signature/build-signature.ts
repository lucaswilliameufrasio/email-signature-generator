import type { TranslationTable } from "../i18n/translations";
import type { LogoTarget, SignatureState } from "../state/signature-state";
import type { SignatureLine } from "./lines";
import type { TextStyle } from "./style-model";

export type LogoImages = Record<LogoTarget, HTMLImageElement>;

export type BuildSignatureInput = {
  state: SignatureState;
  texts: TranslationTable;
  lines: readonly SignatureLine[];
  logoImages: LogoImages;
};

type StyleMap = Record<string, string>;

function styleText(styles: StyleMap): string {
  return Object.entries(styles)
    .map(function ([property, value]) {
      return `${property}:${value}`;
    })
    .join(";");
}

function createElement<Tag extends keyof HTMLElementTagNameMap>(tag: Tag, styles: StyleMap = {}, attributes: Record<string, string> = {}): HTMLElementTagNameMap[Tag] {
  const element = document.createElement(tag);
  const css = styleText(styles);
  if (css !== "") {
    element.setAttribute("style", css);
  }
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  return element;
}

function createLayoutTable(styles: StyleMap = {}, attributes: Record<string, string> = {}): HTMLTableElement {
  return createElement("table", { "border-collapse": "collapse", ...styles }, { cellpadding: "0", cellspacing: "0", border: "0", role: "presentation", ...attributes });
}

function appendRow(table: HTMLTableElement): HTMLTableRowElement {
  const row = document.createElement("tr");
  table.append(row);
  return row;
}

function borderValue(state: SignatureState): string {
  return `${state.divider.thickness}px ${state.divider.style} ${state.colors.divider}`;
}

function lineStyles(style: TextStyle, color: string, fontFamily: string): StyleMap {
  const styles: StyleMap = {
    "font-family": fontFamily,
    "font-size": `${style.fontSize}px`,
    "line-height": String(style.lineHeight),
    "font-weight": String(style.fontWeight),
    color,
    "padding-top": `${style.spacingTop}px`,
    "padding-left": `${style.indent}px`
  };
  if (style.letterSpacing !== 0) {
    styles["letter-spacing"] = `${style.letterSpacing}px`;
  }
  if (style.italic) {
    styles["font-style"] = "italic";
  }
  if (style.uppercase) {
    styles["text-transform"] = "uppercase";
  }
  return styles;
}

function buildLine(signatureLine: SignatureLine, state: SignatureState): HTMLDivElement {
  const style = state.textStyles[signatureLine.key];
  const textColor = style.color ?? state.colors.text;
  const valueColor = style.color ?? (signatureLine.key === "role" || signatureLine.isLink ? state.colors.accent : state.colors.text);
  const lineColor = signatureLine.key === "role" ? valueColor : textColor;
  const lineElement = createElement("div", lineStyles(style, lineColor, state.fontFamily), { id: `${signatureLine.key}El` });

  if (signatureLine.label !== "") {
    const labelElement = createElement("span", { color: textColor });
    labelElement.textContent = signatureLine.label;
    lineElement.append(labelElement);
  }

  if (signatureLine.href !== undefined) {
    const anchor = createElement("a", { color: valueColor, "text-decoration": "none" }, { href: signatureLine.href });
    anchor.textContent = signatureLine.value;
    lineElement.append(anchor);
  } else if (signatureLine.label !== "" && valueColor !== textColor) {
    const valueElement = createElement("span", { color: valueColor });
    valueElement.textContent = signatureLine.value;
    lineElement.append(valueElement);
  } else {
    lineElement.append(signatureLine.value);
  }
  return lineElement;
}

function prepareLogo(image: HTMLImageElement, state: SignatureState, target: LogoTarget, texts: TranslationTable): HTMLImageElement {
  const frame = state.logos[target].frame;
  image.id = target === "main" ? "mainLogo" : "sideLogo";
  image.dataset["logo"] = target;
  image.alt = target === "main" ? texts.logoMainAlt : texts.logoSideAlt;
  image.width = frame.areaWidth;
  image.height = frame.areaHeight;
  image.setAttribute("style", styleText({ display: "block", border: "0", width: `${frame.areaWidth}px`, height: `${frame.areaHeight}px` }));
  return image;
}

function buildLogos(input: BuildSignatureInput, align: string): HTMLTableElement | undefined {
  const { state, logoImages, texts } = input;
  const targets: LogoTarget[] = [];
  if (state.logos.showMain) {
    targets.push("main");
  }
  if (state.logos.showSide) {
    targets.push("side");
  }
  if (targets.length === 0) {
    return undefined;
  }
  const table = createLayoutTable({}, { align });
  const stacked = state.logos.layout === "vertical";
  let row = appendRow(table);
  for (const [index, target] of targets.entries()) {
    const isLast = index === targets.length - 1;
    if (stacked && index > 0) {
      row = appendRow(table);
    }
    const spacing: StyleMap = isLast ? {} : stacked ? { "padding-bottom": "8px" } : { "padding-right": "12px" };
    const cell = createElement("td", spacing, { valign: "middle", align });
    cell.append(prepareLogo(logoImages[target], state, target, texts));
    row.append(cell);
  }
  return table;
}

function buildText(input: BuildSignatureInput): HTMLTableCellElement {
  const cell = createElement("td", { "text-align": input.state.layout.textAlign }, { id: "textCell", valign: "middle", align: input.state.layout.textAlign });
  for (const signatureLine of input.lines) {
    cell.append(buildLine(signatureLine, input.state));
  }
  return cell;
}

function buildVerticalDivider(state: SignatureState): HTMLTableCellElement {
  if (state.divider.heightMode === "auto") {
    return createElement("td", { padding: "0", width: "0", "border-left": borderValue(state), "font-size": "0", "line-height": "0" }, { id: "dividerCell" });
  }
  const cell = createElement("td", { padding: "0" }, { id: "dividerCell", valign: "middle" });
  const bar = createElement("div", { width: "0", height: `${state.divider.length}px`, "border-left": borderValue(state), "font-size": "0", "line-height": "0" }, { id: "dividerBar" });
  bar.innerHTML = "&nbsp;";
  cell.append(bar);
  return cell;
}

function buildSideBySide(input: BuildSignatureInput, logos: HTMLTableElement | undefined): HTMLTableElement {
  const { state } = input;
  const table = createLayoutTable();
  const row = appendRow(table);
  const logosFirst = state.layout.arrangement === "logos-left";
  const showDivider = logos !== undefined && state.divider.show;
  const logoGap = showDivider ? state.divider.gapBefore : state.divider.gapBefore + state.divider.gapAfter;

  const textCell = buildText(input);
  if (showDivider) {
    textCell.style.setProperty(logosFirst ? "padding-left" : "padding-right", `${state.divider.gapAfter}px`);
  }

  if (logos === undefined) {
    row.append(textCell);
    return table;
  }

  const logosCell = createElement("td", { [logosFirst ? "padding-right" : "padding-left"]: `${logoGap}px` }, { id: "logosCell", valign: "middle" });
  logosCell.append(logos);
  const cells: HTMLTableCellElement[] = showDivider ? [logosCell, buildVerticalDivider(state), textCell] : [logosCell, textCell];
  if (!logosFirst) {
    cells.reverse();
  }
  row.append(...cells);
  return table;
}

function buildStacked(input: BuildSignatureInput, logos: HTMLTableElement | undefined): HTMLTableElement {
  const { state } = input;
  const align = state.layout.textAlign;
  const table = createLayoutTable({ width: "100%" });
  const showDivider = logos !== undefined && state.divider.show;

  if (logos !== undefined) {
    const gap = showDivider ? state.divider.gapBefore : state.divider.gapBefore + state.divider.gapAfter;
    const logosCell = createElement("td", { "padding-bottom": `${gap}px` }, { id: "logosCell", align });
    logosCell.append(logos);
    appendRow(table).append(logosCell);
  }

  if (showDivider) {
    const dividerCell = createElement("td", { "padding-bottom": `${state.divider.gapAfter}px`, "font-size": "0", "line-height": "0" }, { id: "dividerCell", align });
    const width = state.divider.heightMode === "auto" ? "100%" : `${state.divider.length}px`;
    const bar = createElement("div", { width, height: "0", "border-top": borderValue(state), "font-size": "0", "line-height": "0" }, { id: "dividerBar" });
    if (align === "center") {
      bar.style.margin = "0 auto";
    } else if (align === "right") {
      bar.style.marginLeft = "auto";
    }
    bar.innerHTML = "&nbsp;";
    dividerCell.append(bar);
    appendRow(table).append(dividerCell);
  }

  appendRow(table).append(buildText(input));
  return table;
}

export function buildSignature(input: BuildSignatureInput): HTMLTableElement {
  const { state } = input;
  const stacked = state.layout.arrangement === "logos-top";
  const logos = buildLogos(input, stacked ? state.layout.textAlign : "left");

  const outer = createLayoutTable({ "font-family": state.fontFamily, background: state.colors.background }, { id: "sigTable", bgcolor: state.colors.background });
  const outerCell = createElement("td", { padding: `${state.layout.paddingY}px ${state.layout.paddingX}px` });
  outerCell.append(stacked ? buildStacked(input, logos) : buildSideBySide(input, logos));
  appendRow(outer).append(outerCell);
  return outer;
}
