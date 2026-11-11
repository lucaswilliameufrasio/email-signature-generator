export type LogoUrlCheck =
  | { kind: "valid"; url: string }
  | { kind: "invalid" };

export function parseLogoUrl(rawValue: string): LogoUrlCheck {
  const trimmed = rawValue.trim();
  if (!URL.canParse(trimmed)) {
    return { kind: "invalid" };
  }
  const parsed = new URL(trimmed);
  if (parsed.protocol !== "https:" || parsed.hostname === "") {
    return { kind: "invalid" };
  }
  return { kind: "valid", url: parsed.href };
}

export function probeImage(url: string, timeoutMs: number): Promise<boolean> {
  return new Promise(function (resolve) {
    const image = new Image();
    const timer = setTimeout(function () {
      image.src = "";
      resolve(false);
    }, timeoutMs);
    image.onload = function () {
      clearTimeout(timer);
      resolve(image.naturalWidth > 0);
    };
    image.onerror = function () {
      clearTimeout(timer);
      resolve(false);
    };
    image.src = url;
  });
}
