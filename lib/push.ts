// lib/push.ts

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);

  // Explicitly backing this with `new ArrayBuffer(...)` (rather than letting
  // `new Uint8Array(length)` infer a generic ArrayBufferLike) keeps this
  // typed as Uint8Array<ArrayBuffer>, which is what PushSubscriptionOptionsInit's
  // applicationServerKey expects under newer lib.dom.d.ts versions.
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(): Promise<PushSubscription> {
  if (!isPushSupported()) {
    throw new Error("Push notifications aren't supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  // next-pwa already registers /sw.js in _app or layout, but this is
  // safe to call again — it just returns the existing registration.
  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      ),
    }));

  // subscription.toJSON() already returns { endpoint, keys: { p256dh, auth } }
  // — exactly the shape PushSubscriptionController@store validates against.
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });

  if (!res.ok) {
    throw new Error("Failed to save your subscription on the server.");
  }

  return subscription;
}

/**
 * Silently re-saves whatever push subscription the browser already has
 * to the backend, without prompting for permission or showing any UI.
 *
 * Why this exists: deleting a row from `push_subscriptions` does NOT
 * unsubscribe the browser — they're two independent systems. If someone
 * manually clears the table (or a row gets lost some other way), the
 * device is still subscribed under the hood, it just has no matching
 * backend row anymore. Since the enable banner never shows again once
 * permission is "granted", there'd be no way to recreate that row
 * without this. Call this once on app load (e.g. in a top-level layout
 * client component) so the backend stays in sync automatically.
 */
export async function resyncPushSubscription(): Promise<void> {
  if (!isPushSupported()) return;
  if (
    typeof Notification === "undefined" ||
    Notification.permission !== "granted"
  )
    return;

  try {
    const existing = await getExistingSubscription();
    if (!existing) return; // browser has no subscription — nothing to sync

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(existing.toJSON()),
    });
  } catch (err) {
    console.error("Push resync failed:", err);
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  const subscription = await getExistingSubscription();
  if (!subscription) return;

  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  await subscription.unsubscribe();
}
