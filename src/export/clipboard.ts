export async function copyRichHtml(htmlContent: string, plainText: string): Promise<void> {
  if (typeof ClipboardItem === "function" && typeof navigator.clipboard.write === "function") {
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([htmlContent], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" })
    });
    await navigator.clipboard.write([clipboardItem]);
    return;
  }
  await navigator.clipboard.writeText(htmlContent);
}
