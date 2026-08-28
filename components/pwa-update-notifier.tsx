"use client";

import * as React from "react";
import { RefreshCw, Loader2, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

import { usePwaUpdate, type PwaUpdateStatus } from "@/hooks/use-pwa-update";

const STATUS_COPY: Record<
  PwaUpdateStatus,
  { title: string; icon: React.ReactNode }
> = {
  idle: {
    title: "",
    icon: null,
  },

  installing: {
    title: "Downloading update...",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },

  installed: {
    title: "Update ready to install",
    icon: <RefreshCw className="h-4 w-4" />,
  },

  activating: {
    title: "Installing update...",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },

  activated: {
    title: "Update installed — reloading...",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

export function PwaUpdateNotifier() {
  const { updateAvailable, status, applyUpdate } = usePwaUpdate();

  const toastIdRef = React.useRef<string | number | null>(null);

  // "installed" = ready, waiting for the user to click Update.
  React.useEffect(() => {
    if (!updateAvailable || status !== "installed") {
      return;
    }

    toastIdRef.current = toast("A new version of Quanta Paper is available", {
      description: "Update now to get the latest fixes and features.",

      icon: <RefreshCw className="h-4 w-4" />,

      duration: Infinity,

      action: {
        label: "Update",
        onClick: applyUpdate,
      },

      cancel: {
        label: <X className="h-4 w-4 text-red-500" />,
        onClick: () => {
          toastIdRef.current = null;
        },
      },

      cancelButtonStyle: {
        backgroundColor: "transparent",
        color: "rgb(239 68 68)", // red-500
        padding: "0.25rem",
      },
    });
  }, [updateAvailable, status, applyUpdate]);

  // Once the user clicks Update, swap the same toast into a progress
  // toast that walks through activating -> activated -> reload.
  React.useEffect(() => {
    if (status === "activating" || status === "activated") {
      const copy = STATUS_COPY[status];

      toast.loading(copy.title, {
        id: toastIdRef.current ?? undefined,
        icon: copy.icon,
        duration: Infinity,
      });
    }
  }, [status]);

  return null;
}
