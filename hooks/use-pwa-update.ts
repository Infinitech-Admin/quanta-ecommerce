"use client";

import * as React from "react";

/**
 * Detects when a new service worker has installed and is waiting to
 * activate (because skipWaiting: false in next.config.js), and exposes a
 * function to trigger the update on demand.
 */
export function usePwaUpdate() {
  const [waitingWorker, setWaitingWorker] =
    React.useState<ServiceWorker | null>(null);
  const reloadingRef = React.useRef(false);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const handleUpdateFound = () => {
      const installingWorker = registration?.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener("statechange", () => {
        // "installed" + an existing controller means this is an update
        // to an already-active app, not the very first install.
        if (
          installingWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          setWaitingWorker(installingWorker);
        }
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      registration = reg;

      // A waiting worker may already exist (e.g. update finished
      // installing while the app was in the background).
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
      }

      reg.addEventListener("updatefound", handleUpdateFound);
    });

    // Once the new worker activates and takes control, reload once so
    // the page picks up the new assets.
    const handleControllerChange = () => {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      registration?.removeEventListener("updatefound", handleUpdateFound);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  const applyUpdate = React.useCallback(() => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  }, [waitingWorker]);

  return {
    updateAvailable: !!waitingWorker,
    applyUpdate,
  };
}
