"use client";

import * as React from "react";

export type PwaUpdateStatus =
  | "idle"
  | "installing"
  | "installed"
  | "activating"
  | "activated";

/**
 * Detects when a new service worker has installed and is waiting to
 * activate (because skipWaiting: false in next.config.js), exposes the
 * current step of that process (`status`), and a function to trigger
 * the update on demand.
 */
export function usePwaUpdate() {
  const [waitingWorker, setWaitingWorker] =
    React.useState<ServiceWorker | null>(null);
  const [status, setStatus] = React.useState<PwaUpdateStatus>("idle");
  const reloadingRef = React.useRef(false);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const trackWorker = (worker: ServiceWorker) => {
      // Reflect the worker's live state into our status immediately...
      if (worker.state === "installing") setStatus("installing");

      // ...and on every subsequent change.
      worker.addEventListener("statechange", () => {
        switch (worker.state) {
          case "installing":
            setStatus("installing");
            break;
          case "installed":
            // Only "waiting to activate" if there's already an active
            // controller (i.e. this is an update, not first install).
            if (navigator.serviceWorker.controller) {
              setWaitingWorker(worker);
              setStatus("installed");
            }
            break;
          case "activating":
            setStatus("activating");
            break;
          case "activated":
            setStatus("activated");
            break;
        }
      });
    };

    const handleUpdateFound = () => {
      const installingWorker = registration?.installing;
      if (installingWorker) trackWorker(installingWorker);
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      registration = reg;

      // A waiting worker may already exist (update finished installing
      // while the app was in the background) — pick up mid-flight.
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
        setStatus("installed");
        trackWorker(reg.waiting);
      }
      // Or one may currently be installing.
      if (reg.installing) trackWorker(reg.installing);

      reg.addEventListener("updatefound", handleUpdateFound);
    });

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

  const applyUpdate = React.useCallback(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const worker = reg?.waiting ?? waitingWorker;

    if (!worker) {
      window.location.reload();
      return;
    }

    setStatus("activating");
    worker.postMessage({ type: "SKIP_WAITING" });

    // Safety net in case controllerchange never fires.
    window.setTimeout(() => {
      if (!reloadingRef.current) {
        reloadingRef.current = true;
        window.location.reload();
      }
    }, 4000);
  }, [waitingWorker]);

  return {
    updateAvailable: !!waitingWorker,
    status,
    applyUpdate,
  };
}
