import { bakeLogo } from "../logos/bake-logo";
import type { LogoFrame } from "../logos/logo-frame";
import type { LogoTarget } from "../state/signature-state";

export type LogoBaker = {
  request: (target: LogoTarget, source: string, frame: LogoFrame) => void;
  ready: () => Promise<void>;
  baked: (target: LogoTarget) => string | undefined;
};

const bakeDensity = 3;

export function createLogoBaker(onBaked: (target: LogoTarget, bakedSource: string) => void, onError: (error: unknown) => void): LogoBaker {
  const requestedKeys: Record<LogoTarget, string> = { main: "", side: "" };
  const bakedSources: Partial<Record<LogoTarget, string>> = {};
  const pending = new Set<Promise<void>>();

  function request(target: LogoTarget, source: string, frame: LogoFrame): void {
    const key = `${JSON.stringify(frame)}|${source}`;
    if (requestedKeys[target] === key) {
      return;
    }
    requestedKeys[target] = key;
    const job = (async function () {
      try {
        const bakedSource = await bakeLogo(source, frame, bakeDensity);
        if (requestedKeys[target] === key) {
          bakedSources[target] = bakedSource;
          onBaked(target, bakedSource);
        }
      } catch (error) {
        onError(error);
      }
    })();
    pending.add(job);
    void job.finally(function () {
      pending.delete(job);
    });
  }

  async function ready(): Promise<void> {
    while (pending.size > 0) {
      await Promise.all([...pending]);
    }
  }

  return {
    request,
    ready,
    baked: function (target) {
      return bakedSources[target];
    }
  };
}
