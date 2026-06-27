# Lumio — Website

Cinematic, mehrseitige Website für das fiktive Digital- & Brandstudio **Lumio**.
Im Hintergrund jeder Seite läuft die `moon-walk`-Aufnahme als **scroll-gesteuerte
Animation**: Beim Scrollen wird die Video-Zeitleiste vorgespult und die „Kamera"
zoomt tiefer in das Tor hinein – man stößt Stück für Stück weiter in die Welt.

## Seiten
| Datei | Inhalt |
|-------|--------|
| `index.html` | Hauptseite mit Hero, Kennzahlen, Leistungs-Vorschau und CTA |
| `ueber-uns.html` | Über uns – Haltung, Arbeitsweise, Werte |
| `prozesse.html` | Prozesse – 4 Etappen (Entdecken → Launch) |
| `leistungen.html` | Leistungen – Disziplinen und Pakete |
| `kontakt.html` | Kontaktformular (öffnet das Mailprogramm) |

## Header
Logo + Name **Lumio**, Navigation **Über uns · Prozesse · Leistungen** sowie ein
**Kontakt**-Button. Auf Mobilgeräten klappt das Menü über das Hamburger-Icon aus.

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
