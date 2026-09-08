// components/notification-prompt-banner.tsx

"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const DISMISS_KEY = "notif-prompt-dismissed";

export function NotificationPromptBanner() {
  const { permission, subscribe, loading } = usePushNotifications();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Huwag ipakita kung naka-enable na or na-deny na
    if (permission === "granted" || permission === "denied") {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    // Huwag ipakita kung dinismiss na dati sa current session
    if (sessionStorage.getItem(DISMISS_KEY)) {
      return;
    }

    // Konting delay para hindi biglaan
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [permission]);

  function handleDismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  async function handleEnable() {
    await subscribe();
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="relative flex w-full max-w-xs flex-col items-center rounded-2xl border border-moss-200 bg-white p-6 text-center shadow-xl">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute right-3 top-3 text-moss-400 transition-colors hover:text-moss-900"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Notification Icon */}
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-moss-900/10">
          <Bell className="h-6 w-6 text-moss-900" />
        </span>

        {/* Content */}
        <div className="w-full">
          <p className="text-base font-semibold text-moss-900">
            Stay in the loop
          </p>

          <p className="mt-1 text-sm text-moss-500">
            Stay updated with our latest promotions
          </p>

          {/* Buttons */}
          <div className="mt-5 flex w-full flex-col gap-2">
            <Button
              size="sm"
              onClick={handleEnable}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Enabling..." : "Enable"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="w-full"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
