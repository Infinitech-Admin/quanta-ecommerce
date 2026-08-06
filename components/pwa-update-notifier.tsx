"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { usePwaUpdate } from "@/hooks/use-pwa-update";

// Mount this once, near the root of the app (e.g. in app/layout.tsx next
// to <Toaster />). It has no visual output of its own — it just fires a
// toast when an update becomes available.
export function PwaUpdateNotifier() {
  const { updateAvailable, applyUpdate } = usePwaUpdate();
  const shownRef = React.useRef(false);

  React.useEffect(() => {
    if (!updateAvailable || shownRef.current) return;
    shownRef.current = true;

    toast("A new version of Quanta Paper is available", {
      description: "Update now to get the latest fixes and features.",
      icon: <RefreshCw className="h-4 w-4" />,
      duration: Infinity,
      action: {
        label: "Update",
        onClick: applyUpdate,
      },
    });
  }, [updateAvailable, applyUpdate]);

  return null;
}
