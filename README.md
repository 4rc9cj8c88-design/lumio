# Lumio — Website

Cinematic, mehrseitige Website für das fiktive Digital- & Brandstudio **Lumio**.
Im Hintergrund jeder Seite läuft die `moon-walk`-Aufnahme als **scroll-gesteuerte
Animation**: Beim Scrollen wird die Video-Zeitleiste vorgespult und die „Kamera"
zoomt tiefer in das Tor hinein – man stößt Stück für Stück weiter in die Welt.

## Seiten
| Datei | Inhalt |
|-------|--------|
| `index.html` | Hauptseite: Hero („Wir bringen dein Unternehmen ans Licht."), Kennzahlen, Leistungs-Vorschau, **AI Automation (coming soon)**, CTA |
| `ueber-uns.html` | Über uns – Gründer (Miko Brüll & Nevio Liebig) mit Kontakt-Platzhaltern, Eckdaten (2026, Aidlingen/BW), Haltung, Werte |
| `prozesse.html` | **Unsere Arbeit** – Vorgehen als animierter Lichtstrahl (4 Phasen) + Partner-/Kunden-Logos (Platzhalter) |
| `leistungen.html` | **Unser Angebot** – Regelschieber zwischen *Website-Erstellung* und *AI Automation (coming soon)*, Disziplinen + Pakete |
| `kontakt.html` | **Angebots-Assistent** (4 Schritte: Bereich → Details → Kontakt → Übersicht), öffnet das Mailprogramm |
| `impressum.html` | Impressum nach § 5 DDG (Vorlage, Platzhalter markiert) |
| `datenschutz.html` | Datenschutzerklärung nach DSGVO (Vorlage, Platzhalter markiert) |

## AI Automation (coming soon)
AI Automation ist als „Bald verfügbar" angelegt: ein Abschnitt auf der Startseite und in
den Leistungen mit einem „Benachrichtigen"-Feld (sammelt Interesse per E-Mail-Fallback).
Wenn das Angebot live geht, lässt es sich zu einer eigenen Seite ausbauen.

## Angebots-Assistent (`kontakt.html`)
Mehrstufiger Assistent: **1) Umfang** – Funktions-Auswahl (Landingpage, Kontaktformular,
mehrseitig, Shop, SEO, Motion, Branding, AI …), **2) Kontakt** – Name/E-Mail/Nachricht,
**3) Übersicht** – Zusammenfassung. Beim Absenden öffnet sich das Mailprogramm mit einer
fertigen Anfrage. Kein Backend nötig.

## Mobil & Desktop
Das Layout ist vollständig responsiv (Hamburger-Menü ab ≤ 880 px). Zusätzlich erkennt
`scroll-scene.js` Handys/Touch/Data-Saver und schaltet in einen **Lite-Modus**: Statt das
4K-Video zu scrubben, bleibt das Poster stehen und es läuft nur die leichte Scroll-Parallaxe
– das spart Datenvolumen und Akku.

## Rechtliche Hinweise
Impressum und Datenschutzerklärung sind **Vorlagentexte**. Mit `[…]` markierte Felder
(Straße, Telefon, E-Mail, Hosting-Anbieter) müssen vor dem Live-Gang ergänzt und die Texte
anwaltlich geprüft werden. Hinweis zu Google Fonts: Die Schriften werden derzeit extern von
Google geladen – für eine datensparsame Lösung sollten sie selbst gehostet werden.

## Header
Logo (Buchstabe **„L"** mit Glow in der Portal-Ellipse) + Name **Lumio**, Navigation
**Startseite · Über uns · Unser Angebot · Unsere Arbeit** sowie ein **Kontakt**-Button.
Auf Mobilgeräten klappt das Menü über das Hamburger-Icon aus.

## „Unser Angebot" — Regelschieber
Auf `leistungen.html` schaltet ein Schieberegler zwischen zwei Welten um:
**Website-Erstellung** (Disziplinen + Pakete) und **AI Automation** (Coming-soon-Ansicht).
Der Angebots-Assistent fragt entsprechend als Erstes den **Bereich** ab und passt die
Folgeschritte an (bei AI Automation entfällt die Funktions-Auswahl).

## Aufbau
```
lumio/
├── index.html · ueber-uns.html · prozesse.html · leistungen.html · kontakt.html
├── css/style.css          # komplettes Design-System
├── js/scroll-scene.js     # Scroll-Engine: Video-Scrubbing + „Dive-in"-Zoom
└── assets/
    ├── moon-walk.mp4       # 4K-Hintergrundloop (Quelle: GetLayers)
    └── moon-walk.jpg       # Poster / Fallback-Standbild
```

## Lokal ansehen
Wegen Browser-Sicherheitsregeln das Video am besten über einen lokalen Server laden:

```bash
cd lumio
python3 -m http.server 8123
# dann http://localhost:8123 im Browser öffnen
```

(`index.html` lässt sich auch direkt per Doppelklick öffnen; je nach Browser kann
das Laden des Videos dabei eingeschränkt sein.)

## Wie die Scroll-Animation funktioniert (`js/scroll-scene.js`)
- Die Scroll-Position der Seite (0 – 100 %) wird auf die Video-Laufzeit gemappt:
  `video.currentTime = fortschritt × dauer`.
- Bei sichtbarer Seite wird die Zeit über wenige `requestAnimationFrame`-Frames
  geglättet (sanftes Scrubbing, kein Ruckeln des Decoders); wenn rAF nicht läuft,
  springt sie synchron mit – die Szene folgt dem Scrollen immer.
- Parallel skaliert/driftet der `.scene`-Container und hellt sich auf
  → der „Eintauch"-Effekt ins Tor.
- `prefers-reduced-motion` und ein fehlendes Video werden sauber abgefangen.

## Hinweis zur Performance
`moon-walk.mp4` ist ein 4K-Master (~29 MB). Das Scrubben in 4K kann auf
schwächeren Geräten ruckeln. Für den Produktiveinsatz empfiehlt sich eine
zusätzliche, web-optimierte Fassung (z. B. 1080p/720p, ~2–5 MB) –
z. B. mit ffmpeg:

```bash
ffmpeg -i moon-walk.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 24 \
  -preset slow -movflags +faststart -an moon-walk-720p.mp4
```
und im `<source>` der Seiten referenzieren.
