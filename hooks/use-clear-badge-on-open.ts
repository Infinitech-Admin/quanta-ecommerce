// hooks/use-clear-badge-on-open.ts
"use client";

import { useEffect } from "react";

/**
 * Clears the app badge whenever this app is opened or brought back into
 * focus — not just when a notification is tapped. Call this once from the
 * root layout so it runs on every cold start and every tab/app focus.
 */
export function useClearBadgeOnOpen() {
  useEffect(() => {
    const clearBadge = () => {
      // Clear directly if supported (covers the case where no SW is
      // controlling the page yet).
      if ("clearAppBadge" in navigator) {
        (navigator as any).clearAppBadge().catch(() => {});
      }
      // Also tell the SW so its stored count resets — otherwise the next
      // push would resume counting from the old, already-seen total.
      navigator.serviceWorker?.controller?.postMessage({
        type: "CLEAR_BADGE",
      });
    };

    // Cold start / initial app open
    clearBadge();

    // App brought back to foreground (e.g. switched tabs/apps and back)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        clearBadge();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
}
