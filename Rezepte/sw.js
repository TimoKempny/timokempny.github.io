// Ersetzt den alten Service Worker der Rezepte-App: löscht dessen Offline-Speicher, meldet sich ab
// und lädt offene Seiten neu, damit sie die Weiterleitung bekommen.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith("rezepte-")) await caches.delete(name);
    await self.registration.unregister();
    for (const fenster of await self.clients.matchAll({ type: "window" })) fenster.navigate(fenster.url);
  })());
});
