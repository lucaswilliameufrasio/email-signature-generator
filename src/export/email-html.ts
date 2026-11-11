export type LogoSources = {
  main?: string;
  side?: string;
};

function removeHiddenElements(root: HTMLElement): void {
  for (const element of [...root.querySelectorAll<HTMLElement>("*")]) {
    if (root.contains(element) && element.style.display === "none") {
      element.remove();
    }
  }
}

function replaceLogoSources(root: HTMLElement, logoSources: LogoSources): void {
  for (const image of root.querySelectorAll<HTMLImageElement>("img[data-logo]")) {
    const logoType = image.dataset["logo"];
    const source = logoType === "main" ? logoSources.main : logoSources.side;
    if (source !== undefined) {
      image.src = source;
    }
  }
}

function stripEditorAttributes(root: HTMLElement): void {
  for (const element of [root, ...root.querySelectorAll<HTMLElement>("*")]) {
    element.removeAttribute("id");
    element.removeAttribute("data-i18n-alt");
    element.removeAttribute("data-logo");
  }
}

export function prepareEmailHtml(root: HTMLElement, logoSources: LogoSources): string {
  removeHiddenElements(root);
  replaceLogoSources(root, logoSources);
  stripEditorAttributes(root);
  return root.outerHTML;
}
