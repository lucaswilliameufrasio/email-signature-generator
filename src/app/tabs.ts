export function setupTabs(tablist: HTMLElement, onChange: () => void): void {
  const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')];

  function select(selected: HTMLButtonElement, moveFocus: boolean): void {
    for (const tab of tabs) {
      const isSelected = tab === selected;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      const panelId = tab.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : undefined;
      if (panel) {
        panel.hidden = !isSelected;
      }
    }
    if (moveFocus) {
      selected.focus();
    }
    onChange();
  }

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", function () {
      select(tab, false);
    });
    tab.addEventListener("keydown", function (event) {
      let target: HTMLButtonElement | undefined;
      if (event.key === "ArrowRight") {
        target = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowLeft") {
        target = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        target = tabs[0];
      } else if (event.key === "End") {
        target = tabs[tabs.length - 1];
      }
      if (target !== undefined) {
        event.preventDefault();
        select(target, true);
      }
    });
  }
}
