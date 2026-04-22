import type { BrowserFamily, BrowserSupportLevel } from "./types.ts";

export type EnvironmentAssessment = {
  browserFamily: BrowserFamily;
  browserSupportLevel: BrowserSupportLevel;
  browserNotice: string | null;
  reducedMotion: boolean;
  reducedMotionSupported: boolean;
};

export function assessEnvironment({
  userAgent,
  reducedMotion,
  reducedMotionSupported,
}: {
  userAgent: string;
  reducedMotion: boolean;
  reducedMotionSupported: boolean;
}): EnvironmentAssessment {
  const browserFamily = detectBrowserFamily(userAgent);

  if (browserFamily === "safari") {
    return {
      browserFamily,
      browserSupportLevel: "best-effort",
      browserNotice:
        "Safari support is best-effort for MVP. Guided entry, plotting, export, presentation-safe mode, or reduced-motion behavior may degrade.",
      reducedMotion,
      reducedMotionSupported,
    };
  }

  if (browserFamily === "unknown") {
    return {
      browserFamily,
      browserSupportLevel: "degraded",
      browserNotice:
        "This browser is outside the full MVP support path. Guided entry, plotting, export, and presentation-safe behavior may degrade.",
      reducedMotion,
      reducedMotionSupported,
    };
  }

  return {
    browserFamily,
    browserSupportLevel: "full",
    browserNotice: null,
    reducedMotion,
    reducedMotionSupported,
  };
}

export function detectBrowserFamily(userAgent: string): BrowserFamily {
  const normalized = userAgent.toLowerCase();
  if (normalized.includes("firefox")) {
    return "firefox";
  }
  if (normalized.includes("edg/") || normalized.includes("chrome/") || normalized.includes("chromium")) {
    return "chromium";
  }
  if (normalized.includes("safari/") && !normalized.includes("chrome/") && !normalized.includes("chromium") && !normalized.includes("edg/")) {
    return "safari";
  }
  return "unknown";
}
