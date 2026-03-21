"use client";

import { useEffect } from "react";

function resetBodyStyles() {
  document.body.style.top = "";
  document.body.style.position = "";
  document.body.style.padding = "";
  document.body.style.overflow = "";
}

export function VignetteGuard() {
  // Body reset on focus/pageshow (iOS Safari recovery)
  useEffect(() => {
    window.addEventListener("focus", resetBodyStyles);
    window.addEventListener("pageshow", resetBodyStyles);

    return () => {
      window.removeEventListener("focus", resetBodyStyles);
      window.removeEventListener("pageshow", resetBodyStyles);
    };
  }, []);

  // MutationObserver: reset body after vignette closes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasVignette = document.querySelector('iframe[id*="google_ads"]');
      if (!hasVignette) {
        resetBodyStyles();
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
