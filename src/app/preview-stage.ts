import { fillTemplate, type TranslationTable } from "../i18n/translations";

export const recommendedMaxWidth = 600;

export type PreviewStage = {
  refresh: (texts: TranslationTable) => void;
  withNaturalSize: <Result>(task: () => Promise<Result>) => Promise<Result>;
};

export function createPreviewStage(stage: HTMLElement, scaleBox: HTMLElement, preview: HTMLElement, readout: HTMLElement): PreviewStage {
  let lastTexts: TranslationTable | undefined;
  let suspended = false;

  function applyScale(): void {
    const signature = preview.firstElementChild;
    if (!(signature instanceof HTMLElement)) {
      return;
    }
    const naturalWidth = signature.offsetWidth;
    const naturalHeight = signature.offsetHeight;
    const available = scaleBox.clientWidth;
    const scale = suspended || naturalWidth === 0 ? 1 : Math.min(1, available / naturalWidth);
    preview.style.transform = scale < 1 ? `scale(${scale})` : "";
    scaleBox.style.height = scale < 1 ? `${Math.ceil(naturalHeight * scale)}px` : "";

    if (lastTexts !== undefined) {
      const template = naturalWidth > recommendedMaxWidth ? lastTexts.sizeTooWide : lastTexts.sizeWithin;
      readout.textContent = fillTemplate(template, { width: String(naturalWidth), height: String(naturalHeight) });
      readout.dataset["state"] = naturalWidth > recommendedMaxWidth ? "warning" : "ok";
    }
    document.documentElement.style.setProperty("--stage-height", `${stage.offsetHeight}px`);
    const exportBar = stage.querySelector<HTMLElement>(".export-bar");
    if (exportBar) {
      const pinned = getComputedStyle(exportBar).position === "fixed";
      document.documentElement.style.setProperty("--export-height", pinned ? `${exportBar.offsetHeight}px` : "0px");
    }
  }

  const observer = new ResizeObserver(function () {
    applyScale();
  });
  observer.observe(scaleBox);
  observer.observe(preview);
  observer.observe(stage);
  const exportBar = stage.querySelector<HTMLElement>(".export-bar");
  if (exportBar) {
    observer.observe(exportBar);
  }

  return {
    refresh: function (texts) {
      lastTexts = texts;
      applyScale();
    },
    withNaturalSize: async function (task) {
      suspended = true;
      applyScale();
      try {
        return await task();
      } finally {
        suspended = false;
        applyScale();
      }
    }
  };
}
