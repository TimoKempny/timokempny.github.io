// Weiterleitung von timokempny.github.io/Schulwebsite/… zur neuen Adresse. Behält Unterseite, Suche und Anker bei
// und nimmt die im Browser gespeicherten Daten der Schulwebsite mit (Editoren, Übungsstände, Lostopf, Design).
// Projekte des HTML-Editors liegen in IndexedDB und kommen nicht mit (vorher als ZIP exportieren).

const ZIEL = "https://schulwebsite.timokempny.workers.dev";
// Schlüssel der Schulwebsite (die Rezepte teilen sich denselben Speicher und bleiben außen vor)
const PRAEFIXE = ["theme", "op-lang", "lostopf.v1", "c-editor", "py-editor", "html-editor", "mermaid-editor",
  "struktogramm-editor-v1", "farbwaehler", "binaer-ueben", "hexoktal-ueben", "ipv4-ueben"];

function zielAdresse() {
  const unterseite = location.pathname.replace(/^\/schulwebsite\/?/i, "");
  let anker = location.hash;
  if (!anker) {
    const daten = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (PRAEFIXE.some((p) => k === p || k.startsWith(p + "."))) daten[k] = localStorage.getItem(k);
      }
    } catch {
      // Kein Zugriff auf den Speicher: nur weiterleiten
    }
    if (Object.keys(daten).length) anker = "#umzug=" + encodeURIComponent(JSON.stringify(daten));
  }
  return `${ZIEL}/${unterseite}${location.search}${anker}`;
}

// Alte Service Worker der Schulwebsite (Python-Editor, HTML-Vorschau) abmelden
async function aufraeumen() {
  try {
    if ("serviceWorker" in navigator) {
      for (const sw of await navigator.serviceWorker.getRegistrations()) {
        if (new URL(sw.scope).pathname.toLowerCase().startsWith("/schulwebsite/")) await sw.unregister();
      }
    }
  } catch {
    // Aufräumen ist nicht nötig für die Weiterleitung
  }
}

// Die 404.html gilt für die ganze Benutzerseite: nur Pfade unter /Schulwebsite weiterleiten
if (!/^\/schulwebsite(\/|$)/i.test(location.pathname)) throw new Error("Keine Schulwebsite-Adresse");

const ziel = zielAdresse();
const link = document.getElementById("ziel");
if (link) { link.href = ziel; link.textContent = "schulwebsite.timokempny.workers.dev"; }
const titel = document.getElementById("titel");
if (titel) titel.textContent = "Die Schulwebsite ist umgezogen";
document.title = "Schulwebsite ist umgezogen";
Promise.race([aufraeumen(), new Promise((fertig) => setTimeout(fertig, 1500))])
  .then(() => location.replace(ziel));
