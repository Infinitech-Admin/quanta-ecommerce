// components/NotificationOptIn.tsx
"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  getExistingSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push";

export function NotificationOptIn() {
  const [supported, setSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isPushSupported()) {
        setSupported(false);
        setIsLoading(false);
        return;
      }
      const existing = await getExistingSubscription();
      setIsSubscribed(!!existing);
      setIsLoading(false);
    })();
  }, []);

  async function handleToggle() {
    setIsWorking(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        toast.success("Notifications turned off");
      } else {
        await subscribeToPush();
        setIsSubscribed(true);
        toast.success("Notifications enabled");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsWorking(false);
    }
  }

  if (!supported || isLoading) return null;

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      className="gap-1.5"
      onClick={handleToggle}
      disabled={isWorking}
    >
      {isWorking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {isSubscribed ? "Disable notifications" : "Enable notifications"}
    </Button>
  );
}
