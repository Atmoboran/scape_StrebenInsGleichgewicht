# Das Streben nach Gleichgewicht – SCAPE°

Interaktive Simulation in drei Stufen für SCAPE° (Wetter Klima Mensch, Offenbach am Main).
Jede Stufe zeigt dasselbe Prinzip in größerem Maßstab: **Unterschied → Gradient → Strömung → Ausgleich**.
Ein Messgerät am Rand zeigt immer die Größe des Unterschieds.

- **Stufe 1 – Teilchenkasten** (`#stufe-1`): Dichte, Wärme (schnelle/langsame Teilchen) und Farbe in Wasser.
- **Stufe 2 – Seewind** (`#stufe-2`): Querschnitt Küste/Meer/Luft mit Tageszeit-Regler, Isobaren, Pfeilen, Rauch; Aufgabe „Bring den Segler ans Ufer“.
- **Stufe 3 – Wetterkarte** (`#stufe-3`): Hochs und Tiefs malen, Erdrotation, „Sonne aus“; Aufgabe „Windstärke 6 an der Küste“.
- **Vergleich** (`#vergleich`): Wärme, Wasser, Strom und Wind nebeneinander.

## Benutzung
`index.html` im Browser öffnen – keine Abhängigkeiten, kein Build, funktioniert offline und auf dem Handy.
Jede Stufe ist über ihren Anker direkt aufrufbar (z. B. `index.html#stufe-2`).

## Layout
- **Handy:** Versuchsauswahl, Simulation, Bedienung und Aufgaben untereinander. Beschriftungen in den Simulationen wachsen mit, damit sie nie kleiner als gut 11 px werden.
- **Desktop (ab 1000 px):** Simulation links, nur so groß, dass sie ohne Scrollen ganz sichtbar ist; Versuchsauswahl, Bedienung, Aufgaben und Erkenntnis rechts daneben. Der Plakatkopf der Stufen wird schmal.

## Gestaltung
Nach dem SCAPE°-Corporate-Design (Bureau Mitte): Farbfelder, Flächenformen, Linienillustrationen, Versalien für Überschriften.
Die Gestaltung liegt getrennt vom übrigen Code im Ordner `theme/`: Schrift, Palette, Rollenfarben, Wortmarke, Claim und Adresse sowie die Farbthemen der Stufen und Kacheln (`theme/theme.css`) und die Zeichenfarben der Simulationen (`theme/theme.js`). Für eine Version mit anderem Erscheinungsbild genügt es, `theme/` anzupassen (siehe `theme/README.md`).
Hausschrift ist Founders Grotesk (lizenzpflichtig, nicht im Repository); ist sie weder installiert noch unter `theme/fonts/` abgelegt, wird ersatzweise Helvetica Neue / Inter / Arial verwendet.
