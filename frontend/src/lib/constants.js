export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1639059851892-95c80412298c?crop=entropy&cs=srgb&fm=jpg&q=85";

export const DEFAULT_ROOMS = [
  {
    id: "A",
    name: "Zimmer A",
    color: "#84cc16",
  },
  {
    id: "B",
    name: "Zimmer B",
    color: "#0ea5e9",
  },
];

export const DEFAULT_CHECKIN_TEMPLATE = [
  "Schlüsselübergabe prüfen",
  "WLAN-Zugang mitteilen",
  "Fenster und Heizung kurz erklären",
  "Bad & Küche zeigen",
];

export const DEFAULT_CHECKOUT_TEMPLATE = [
  "Müll entsorgen",
  "Bettwäsche abziehen",
  "Fenster schließen",
  "Heizung runterdrehen",
  "Schlüssel zurücklegen",
];

export const DEMO_MANUALS = [
  {
    title: "Waschmaschine",
    description: "Kurzablauf für die Hauptprogramme und Dosierung.",
    steps:
      "1. Strom an, Tür öffnen und Wäsche einlegen.\n2. Waschmittel in Fach II geben.\n3. Programm Baumwolle oder Pflegeleicht wählen.\n4. Start drücken und nach Ende Flusensieb checken.",
    image_url:
      "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    title: "Kaffeemaschine",
    description: "Filtermaschine mit Timer und Warmhaltefunktion.",
    steps:
      "1. Filter einsetzen und Kaffee einfüllen.\n2. Wasserbehälter bis Markierung füllen.\n3. Timer einstellen oder Start drücken.\n4. Nach dem Brühen Warmhalteplatte ausschalten.",
    image_url:
      "https://images.unsplash.com/photo-1607273177147-e7304c4d5d6c?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    title: "WLAN",
    description: "Zugangsdaten und Neustart-Routine für den Router.",
    steps:
      "1. Netzwerknamen und Passwort im Flur aushängen.\n2. Bei Ausfall: Router 10 Sekunden vom Strom trennen.\n3. Nach dem Neustart 2 Minuten warten.\n4. Gerät neu verbinden.",
    image_url:
      "https://images.unsplash.com/photo-1643233963072-b38c7ff3e512?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
];
