import Cropper, { CropperCanvas, CropperImage, CropperSelection } from "cropperjs";
import { requireElement } from "../dom";
import { clampCrop, type CropRect, type Size } from "./logo-frame";

export type CropRequest = {
  source: string;
  natural: Size;
  crop?: CropRect;
  areaAspectRatio: number;
};

export type CropResult =
  | { kind: "applied"; crop?: CropRect }
  | { kind: "cancelled" };

const cropTemplate = [
  "<cropper-canvas background>",
  '<cropper-image initial-center-size="contain"></cropper-image>',
  "<cropper-shade hidden></cropper-shade>",
  '<cropper-selection initial-coverage="0.8" movable resizable outlined keyboard>',
  '<cropper-grid role="grid" bordered covered></cropper-grid>',
  "<cropper-crosshair centered></cropper-crosshair>",
  '<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>',
  '<cropper-handle action="n-resize"></cropper-handle>',
  '<cropper-handle action="e-resize"></cropper-handle>',
  '<cropper-handle action="s-resize"></cropper-handle>',
  '<cropper-handle action="w-resize"></cropper-handle>',
  '<cropper-handle action="ne-resize"></cropper-handle>',
  '<cropper-handle action="nw-resize"></cropper-handle>',
  '<cropper-handle action="se-resize"></cropper-handle>',
  '<cropper-handle action="sw-resize"></cropper-handle>',
  "</cropper-selection>",
  "</cropper-canvas>"
].join("");

type ImageBox = {
  left: number;
  top: number;
  scale: number;
  width: number;
  height: number;
};

function nextFrame(): Promise<void> {
  return new Promise(function (resolve) {
    requestAnimationFrame(function () {
      resolve();
    });
  });
}

function isCropRect(value: unknown): value is CropRect {
  if (typeof value !== "object" || !value) {
    return false;
  }
  return ["x", "y", "width", "height"].every(function (key) {
    return typeof Reflect.get(value, key) === "number";
  });
}

export function createCropDialog(): { open: (request: CropRequest) => Promise<CropResult> } {
  const dialog = requireElement("cropDialog", HTMLDialogElement);
  const cropArea = requireElement("cropArea", HTMLDivElement);
  const applyButton = requireElement("cropApplyBtn", HTMLButtonElement);
  const cancelButton = requireElement("cropCancelBtn", HTMLButtonElement);
  const aspectButtons = [...dialog.querySelectorAll<HTMLButtonElement>("button[data-aspect]")];

  function setControlsEnabled(enabled: boolean): void {
    for (const button of [applyButton, ...aspectButtons]) {
      button.disabled = !enabled;
    }
  }

  async function open(request: CropRequest): Promise<CropResult> {
    setControlsEnabled(false);
    cropArea.replaceChildren();
    const image = new Image();
    image.src = request.source;
    image.alt = "";
    dialog.showModal();

    const cropper = new Cropper(image, { container: cropArea, template: cropTemplate });
    const createdCanvas = cropper.getCropperCanvas();
    const createdImage = cropper.getCropperImage();
    const createdSelection = cropper.getCropperSelection();
    if (!(createdCanvas instanceof CropperCanvas) || !(createdImage instanceof CropperImage) || !(createdSelection instanceof CropperSelection)) {
      cropper.destroy();
      dialog.close();
      throw new Error("Cropper did not create its elements");
    }
    const canvas: CropperCanvas = createdCanvas;
    const cropperImage: CropperImage = createdImage;
    const selection: CropperSelection = createdSelection;

    await cropperImage.$ready();
    await nextFrame();
    await nextFrame();

    function imageBox(): ImageBox {
      const canvasRect = canvas.getBoundingClientRect();
      const imageRect = cropperImage.getBoundingClientRect();
      return {
        left: imageRect.left - canvasRect.left,
        top: imageRect.top - canvasRect.top,
        scale: imageRect.width / request.natural.width,
        width: imageRect.width,
        height: imageRect.height
      };
    }

    const box = imageBox();
    if (request.crop !== undefined) {
      selection.$change(
        box.left + request.crop.x * box.scale,
        box.top + request.crop.y * box.scale,
        request.crop.width * box.scale,
        request.crop.height * box.scale
      );
    } else {
      selection.$change(box.left, box.top, box.width, box.height);
    }

    function keepInsideImage(event: Event): void {
      if (!(event instanceof CustomEvent) || !isCropRect(event.detail)) {
        return;
      }
      const bounds = imageBox();
      const proposed = event.detail;
      const tolerance = 0.5;
      const outside = proposed.x < bounds.left - tolerance
        || proposed.y < bounds.top - tolerance
        || proposed.x + proposed.width > bounds.left + bounds.width + tolerance
        || proposed.y + proposed.height > bounds.top + bounds.height + tolerance;
      if (outside) {
        event.preventDefault();
      }
    }
    selection.addEventListener("change", keepInsideImage);

    function setAspect(button: HTMLButtonElement): void {
      const aspectValue = button.dataset["aspect"];
      let ratio = Number.NaN;
      if (aspectValue === "area") {
        ratio = request.areaAspectRatio;
      } else if (aspectValue !== undefined && aspectValue !== "free") {
        ratio = Number(aspectValue);
      }
      for (const aspectButton of aspectButtons) {
        aspectButton.setAttribute("aria-pressed", String(aspectButton === button));
      }
      const bounds = imageBox();
      selection.aspectRatio = ratio;
      if (Number.isFinite(ratio)) {
        const width = Math.min(bounds.width, bounds.height * ratio);
        const height = width / ratio;
        selection.$change(bounds.left + (bounds.width - width) / 2, bounds.top + (bounds.height - height) / 2, width, height, ratio);
      }
    }

    const aspectHandlers = aspectButtons.map(function (button) {
      const handler = function (): void {
        setAspect(button);
      };
      button.addEventListener("click", handler);
      return { button, handler };
    });
    const freeButton = aspectButtons.find(function (button) {
      return button.dataset["aspect"] === "free";
    });
    if (freeButton) {
      for (const aspectButton of aspectButtons) {
        aspectButton.setAttribute("aria-pressed", String(aspectButton === freeButton));
      }
    }

    return new Promise<CropResult>(function (resolve) {
      function finish(result: CropResult): void {
        applyButton.removeEventListener("click", onApply);
        cancelButton.removeEventListener("click", onCancel);
        dialog.removeEventListener("cancel", onCancel);
        selection.removeEventListener("change", keepInsideImage);
        for (const aspectHandler of aspectHandlers) {
          aspectHandler.button.removeEventListener("click", aspectHandler.handler);
        }
        cropper.destroy();
        cropArea.replaceChildren();
        if (dialog.open) {
          dialog.close();
        }
        resolve(result);
      }

      function onApply(): void {
        const bounds = imageBox();
        const crop = clampCrop({
          x: (selection.x - bounds.left) / bounds.scale,
          y: (selection.y - bounds.top) / bounds.scale,
          width: selection.width / bounds.scale,
          height: selection.height / bounds.scale
        }, request.natural);
        finish(crop === undefined ? { kind: "applied" } : { kind: "applied", crop });
      }

      function onCancel(event: Event): void {
        event.preventDefault();
        finish({ kind: "cancelled" });
      }

      applyButton.addEventListener("click", onApply);
      cancelButton.addEventListener("click", onCancel);
      dialog.addEventListener("cancel", onCancel);
      setControlsEnabled(true);
    });
  }

  return { open };
}
