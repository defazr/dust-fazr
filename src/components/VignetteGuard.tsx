"use client";

import { useEffect } from "react";

function resetBodyStyles() {
  document.body.style.top = "";
  document.body.style.position = "";
  document.body.style.padding = "";
  document.body.style.overflow = "";
}

function resetViewport() {
  const meta = document.querySelector("meta[name=viewport]");
  if (meta) {
    meta.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1"
    );
  }
}

function forceReflow() {
  document.body.style.display = "none";
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  document.body.offsetHeight;
  document.body.style.display = "";
}

function fullReset() {
  resetBodyStyles();
  resetViewport();
  forceReflow();
}

export function VignetteGuard() {
  // Reset on focus/pageshow (iOS Safari vignette recovery)
  useEffect(() => {
    window.addEventListener("focus", fullReset);
    window.addEventListener("pageshow", fullReset);

    return () => {
      window.removeEventListener("focus", fullReset);
      window.removeEventListener("pageshow", fullReset);
    };
  }, []);

  // MutationObserver: reset after vignette closes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasVignette = document.querySelector('iframe[id*="google_ads"]');
      if (!hasVignette) {
        resetBodyStyles();
        resetViewport();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
