// Weiterleitung von timokempny.github.io/Rezepte/… zur neuen Adresse. Behält Unterseite, Suche und Anker bei
// und nimmt die im Browser gespeicherten Einstellungen mit (Einkaufsliste, Wochenplan, Vorrat, Design).
// Der GitHub-Token wird bewusst nicht übertragen.

const ZIEL = "https://rezepte.timokempny.workers.dev";
const MITNEHMEN = ["thema", "einkaufsliste-schluessel", "wochenplan-v1", "vorrat"];

function zielAdresse() {
  const unterseite = location.pathname.replace(/^\/rezepte\/?/i, "");
  let anker = location.hash;
  // Ein geteilter Link (#liste=…) hat Vorrang, sonst die gespeicherten Einstellungen
  if (!anker) {
    const daten = {};
    try {
      for (const schluessel of MITNEHMEN) {
        const wert = localStorage.getItem(schluessel);
        if (wert !== null) daten[schluessel] = wert;
      }
    } catch {
      // Kein Zugriff auf den Speicher: nur weiterleiten
    }
    if (Object.keys(daten).length) anker = "#umzug=" + encodeURIComponent(JSON.stringify(daten));
  }
  return `${ZIEL}/${unterseite}${location.search}${anker}`;
}

// Alten Offline-Speicher der Rezepte-App entfernen, sonst zeigt der Browser hier weiter die alte Fassung
async function aufraeumen() {
  try {
    if ("serviceWorker" in navigator) {
      for (const sw of await navigator.serviceWorker.getRegistrations()) {
        if (new URL(sw.scope).pathname.toLowerCase().startsWith("/rezepte/")) await sw.unregister();
      }
    }
    if ("caches" in window) {
      for (const name of await caches.keys()) if (name.startsWith("rezepte-")) await caches.delete(name);
    }
  } catch {
    // Aufräumen ist nicht nötig für die Weiterleitung
  }
}

// Die 404.html gilt für die ganze Benutzerseite: nur Pfade unter /Rezepte weiterleiten
if (!/^\/rezepte(\/|$)/i.test(location.pathname)) throw new Error("Keine Rezepte-Adresse");

const ziel = zielAdresse();
const link = document.getElementById("ziel");
if (link) link.href = ziel;
Promise.race([aufraeumen(), new Promise((fertig) => setTimeout(fertig, 1500))])
  .then(() => location.replace(ziel));
