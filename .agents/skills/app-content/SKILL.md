---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, rounds, exercises, or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide: Zahlengitter

## Curriculum

Deutschland, Grundschule, Klasse 2. Orientierung: KMK-Bildungsstandards Mathematik für den Primarbereich (2022), Leitidee „Zahlen und Operationen", Zahlenraum bis 100.

## Competencies

Alle Kompetenzen werden in `src/app.yaml` unter `competencies` geführt.

- K1: Ich kann mich im Hunderterfeld von einer Zahl aus nach links und rechts bewegen (±1 bis ±9). → Modus `leicht`, nur horizontale Schritte.
- K2: Ich kann mich im Hunderterfeld von einer Zahl aus nach oben und unten bewegen (±10, ±20, ±30). → Modus `leicht`, nur vertikale Schritte.
- K3: Ich kann kombinierte Wege (links/rechts und oben/unten) von einer Startzahl zur Zielzahl finden. → Modus `mittel`.
- K4: Ich kann Umkehraufgaben lösen: von der Zielzahl rückwärts zur Startzahl navigieren. → Modus `schwer`.

## Content structure

Die App hat eine Übungsseite mit drei Routen (`leicht`, `mittel`, `schwer`). Jeder Modus liefert zufällig generierte Aufgaben (keine feste Datei). Eine Aufgabe besteht aus:
- Startzahl (Feld im Hunderterfeld, Position der Lernenden am Anfang)
- Zielzahl (das Zielfeld, das erreicht werden soll)
- Schrittvorgabe: bei `leicht` nur ein Richtungstyp (nur horizontal oder nur vertikal), bei `mittel` beides kombiniert, bei `schwer` wird die Umkehrrichtung gefragt

Ablauf einer Runde: 5 Aufgaben → Auswertung → neue Runde.

## Terminology

- „Hunderterfeld" / „Zahlengitter": das 11×11-Gitter mit den Zahlen 0–100
- „Startzahl": die Zahl, bei der die Lernenden beginnen
- „Zielzahl": die Zahl, die erreicht werden soll
- „Schritt nach rechts" = +1, „Schritt nach links" = −1
- „Schritt nach unten" = +10, „Schritt nach oben" = −10
- Kinder werden mit „du" angesprochen
- Keine Begriffe wie „Plus" oder „Minus" — stattdessen Richtungssprache: „nach rechts", „nach unten"

## Exercise patterns

**Muster: Gitter-Navigation**
- Kompetenz: bewegen, navigieren (K1–K4)
- Form: Lernende klicken Pfeilbuttons (←→↑↓) oder nutzen Pfeiltasten; jeder Klick bewegt die aktuelle Position um ±1 (horizontal) oder ±10 (vertikal)
- Was fix ist: das 11×11-Hunderterfeld; die Pfeilbuttons; Start- und Ziel-Markierung
- Was variiert: Startzahl, Zielzahl, Modus (zufällig per seed)
- Beispiel: Startzahl 23, Zielzahl 58 → 5× rechts, 3× unten
- Dateiformat: keine Datendatei — Aufgaben werden in `src/core/index.ts` per seed generiert

## Figures

Kein statisches Bildmaterial. Das Hunderterfeld ist eine DOM/SVG-Komponente in `src/ui/App.vue`:
- 11 Zeilen × 11 Spalten
- Zeile 0: Zahlen 0–10, Zeile 1: 11–20, …, Zeile 10: 100
- Farben: Startzahl grün, Zielzahl gelb/orange, aktuelle Position blau
- Randbehandlung: Schritte, die das Feld verlassen würden, werden ignoriert (kein Überlauf)
- Alt-Text: Das Gitter ist mit aria-label beschriftet; aktuelle Position wird per `announce` angekündigt

## Sources

- KMK-Bildungsstandards Mathematik Primarbereich (2022): https://www.kmk.org/themen/qualitaetssicherung-in-schulen/bildungsstandards.html — verifiziert, öffentlich zugänglich.
- Keine weiteren externen Quellen.

## Adding a chapter or round

Um einen neuen Modus oder eine neue Schwierigkeitsstufe hinzuzufügen:
1. Neue Route in `src/app.yaml` unter `routes` eintragen (id, label, competencies)
2. In `src/core/index.ts`: Route in `start(seed, route)` behandeln — `generateTask(seed, taskIndex, route)` anpassen
3. In `src/ui/App.vue`: neuen Modus-Text in `src/messages/de.json` ergänzen
4. Neuen Playthrough in `src/playthroughs/<modus>.yaml` schreiben
5. `npx --no -- lernapps check` ausführen, dann committen

## Rules learned from mistakes

None yet.
