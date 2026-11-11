import type { Locator, Page } from "@playwright/test";

export type EditorTab = "content" | "logos" | "text" | "layout";

export async function logosAreStacked(page: Page): Promise<boolean> {
  const mainBox = await page.locator("#mainLogo").boundingBox();
  const sideBox = await page.locator("#sideLogo").boundingBox();
  if (!mainBox || !sideBox) {
    return false;
  }
  return sideBox.y >= mainBox.y + mainBox.height - 1;
}

export async function openTab(page: Page, tab: EditorTab): Promise<void> {
  const tabButton = page.locator(`#tab-${tab}`);
  if ((await tabButton.getAttribute("aria-selected")) !== "true") {
    await tabButton.click();
  }
}

export async function reveal(page: Page, selector: string): Promise<Locator> {
  const location = await page.locator(selector).evaluate(function (element) {
    const panel = element.closest('[role="tabpanel"]');
    const details = element.closest("details");
    return {
      tabId: panel?.getAttribute("aria-labelledby") ?? "",
      insideClosedDetails: details !== null && !details.open,
      detailsPanelId: details?.closest('[role="tabpanel"]')?.id ?? ""
    };
  });
  if (location.tabId !== "") {
    const tabButton = page.locator(`#${location.tabId}`);
    if ((await tabButton.getAttribute("aria-selected")) !== "true") {
      await tabButton.click();
    }
  }
  if (location.insideClosedDetails) {
    await page.locator(`#${location.detailsPanelId} details`).filter({ has: page.locator(selector) }).locator("summary").click();
  }
  return page.locator(selector);
}

export type CopiedContent = {
  html: string;
  text: string;
};

export async function captureClipboard(page: Page): Promise<void> {
  await page.addInitScript(function () {
    const store = { html: "", text: "" };
    Reflect.set(window, "__copiedContent", store);
    const clipboard = {
      write: async function (items: ClipboardItem[]): Promise<void> {
        const first = items[0];
        if (!first) {
          return;
        }
        store.html = first.types.includes("text/html") ? await (await first.getType("text/html")).text() : "";
        store.text = first.types.includes("text/plain") ? await (await first.getType("text/plain")).text() : "";
      },
      writeText: async function (text: string): Promise<void> {
        store.html = "";
        store.text = text;
      }
    };
    Object.defineProperty(navigator, "clipboard", { value: clipboard, configurable: true });
  });
}

export async function copiedContent(page: Page): Promise<CopiedContent> {
  return page.evaluate(function () {
    const store: unknown = Reflect.get(window, "__copiedContent");
    if (typeof store !== "object" || store === null) {
      return { html: "", text: "" };
    }
    const html = Reflect.get(store, "html");
    const text = Reflect.get(store, "text");
    return { html: typeof html === "string" ? html : "", text: typeof text === "string" ? text : "" };
  });
}
