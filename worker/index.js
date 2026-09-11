// worker/index.js
const BADGE_CACHE = "quanta-badge-store";

async function getBadgeCount() {
  const cache = await caches.open(BADGE_CACHE);
  const res = await cache.match("count");
  if (!res) return 0;
  return parseInt(await res.text(), 10) || 0;
}

async function setBadgeCount(n) {
  const cache = await caches.open(BADGE_CACHE);
  await cache.put("count", new Response(String(n)));
  if ("setAppBadge" in self.registration) {
    if (n > 0) {
      await self.registration.setAppBadge(n);
    } else {
      await self.registration.clearAppBadge();
    }
  }
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "New notification", body: event.data?.text() || "" };
  }

  const title = data.title || "Quanta Paper";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192x192.png",
    badge: "/icon-96x96.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);
      const current = await getBadgeCount();
      await setBadgeCount(current + 1);
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    (async () => {
      await setBadgeCount(0);
      const clientList = await clients.matchAll({ type: "window" });
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })(),
  );
});

// Lets the app itself (foreground) tell the SW "user opened the app, clear
// the badge" — separate from notificationclick, which only fires when the
// user taps the notification specifically.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_BADGE") {
    event.waitUntil(setBadgeCount(0));
  }
});
