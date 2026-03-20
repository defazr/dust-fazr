"use client";

import { useEffect } from "react";

export function ScrollReset() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return null;
}
