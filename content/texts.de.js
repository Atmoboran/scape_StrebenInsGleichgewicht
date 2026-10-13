// Every visible text of the app. Edit or translate this file to adapt the
// exhibit; index.html only holds data-t="path.to.key" placeholders that
// js/texts.js fills from here. Entries written as functions build a sentence
// around runtime values. Lines marked LOCAL refer to SCAPE° or its region.
window.TEXTS = {
  lang: 'de',
  pageTitle: 'Das Streben nach Gleichgewicht',
  description: 'Das Streben nach Gleichgewicht: eine Simulation in drei Stufen. Unterschied, Gradient, Strömung, Ausgleich – vom Teilchenkasten über den Seewind bis zur Wetterkarte.',

  // Texts of the shared kit (js/view.js, js/kit.js).
  kit: {
    viewToDesktop: 'Desktop-Ansicht',
    viewToMobile: 'Handy-Ansicht',
    viewToDesktopAria: 'Zur Desktop-Ansicht wechseln',
    viewToMobileAria: 'Zur Handy-Ansicht wechseln',
    fullscreenEnter: 'Vollbild',
    fullscreenExit: 'Vollbild beenden',
    infoAria: 'Erklärung anzeigen',
    merke: 'Merke',
    tasks: 'Aufgaben',
    merkeLocked: 'Löse die Aufgaben – dann erscheint hier, was du herausgefunden hast.',
    devLink: '(dev)'
  },

  nav: {
    aria: 'Teile der Simulation',
    home: 'Zur Startseite',
    s1: 'Prinzip',
    s2: 'Seewind',
    s3: 'Wetterkarte',
    cmp: 'Vergleich'
  },

  // The chain shown in every poster; the steps light up as the simulation runs.
  chain: {
    aria: 'Das Prinzip',
    diff: 'Unterschied',
    grad: 'Gradient',
    flow: 'Strömung',
    eq: 'Ausgleich'
  },

  // The difference meter at the edge of every simulation.
  meter: {
    label: 'Unterschied',
    percent: v => v + '\u00a0%',
    hpa: v => v + ' hPa',
    none: '–'
  },

  // ---- Start page ----------------------------------------------------------
  start: {
    kicker: 'Eine Simulation in drei Stufen',
    headline: 'Das Streben nach Gleich–<br>gewicht',
    lead: 'Überall, wo es einen Unterschied gibt, kommt etwas in Bewegung – so lange, bis der Unterschied verschwunden ist. Das gilt für Teilchen in einem Kasten, für den Wind an der Küste und für das Wetter auf der ganzen Welt.',
    steps: {
      diff: 'Hier ist mehr, dort ist weniger: mehr Teilchen, mehr Wärme, mehr Farbe, mehr Luft.',
      grad: 'Der Unterschied verteilt sich über eine Strecke. Je steiler das Gefälle, desto stärker der Antrieb.',
      flow: 'Es fließt etwas – immer vom Mehr zum Weniger. Bei Luft nennen wir das Wind.',
      eq: 'Die Strömung baut den Unterschied ab. Das Messgerät am Rand läuft gegen null.'
    },
    partsTitle: 'Drei Stufen',
    parts: {
      s1: '<b>1 Teilchenkasten</b> – Zieh die Trennwand weg und sieh zu, wie sich Teilchen, Wärme und Farbe verteilen.',
      s2: '<b>2 Seewind</b> – Stell die Tageszeit ein. Die Sonne heizt das Land schneller als das Meer – und es weht.',
      s3: '<b>3 Wetterkarte</b> – Mal selbst Hochs und Tiefs auf die Karte und schalte die Erdrotation ein.',
      cmp: '<b>Vergleich</b> – Wärme, Wasser, Strom und Wind: vier Strömungen, ein Prinzip.'
    },
    next: 'Los geht’s: Stufe 1 →'
  },

  // ---- Stage 1: particle box -----------------------------------------------
  s1: {
    kicker: 'Stufe 1 von 3 · Das Prinzip',
    headline: 'Teilchen–<br>kasten',
    lead: 'Links drängeln sich viele Teilchen, rechts sind nur wenige. Was passiert, wenn du die Trennwand wegziehst?',
    modesAria: 'Versuch wählen',
    modes: { dichte: 'Dichte', waerme: 'Warm & kalt', farbe: 'Farbe in Wasser' },
    infoAria: 'Messgerät erklären',
    meterNote: '<p>Das Messgerät <b>Unterschied</b> zeigt, wie verschieden die linke und die rechte Seite noch sind. 100 % heißt: so verschieden wie am Anfang. 0 % heißt: alles ist ausgeglichen.</p>',
    canvasAria: 'Teilchenkasten mit Trennwand',
    badge: 'Zieh die Wand weg',
    left: 'LINKS',
    right: 'RECHTS',
    wallOpen: 'Wand wegziehen',
    wallClose: 'Wand einsetzen',
    reset: 'Neu starten',
    resetSub: 'Teilchen und Wand zurück',
    hints: {
      dichte: 'Links drängeln sich viele Teilchen, rechts sind nur wenige. Zieh die Wand weg (oder tippe auf die Wand)!',
      waerme: 'Wärme ist Bewegung: Links flitzen schnelle, warme Teilchen (rot), rechts trödeln langsame, kalte (blau). Wenn sie zusammenstoßen, geben die schnellen Schwung ab.',
      farbe: 'Ein Tropfen Farbe im Wasser. Die unsichtbar kleinen Wasserteilchen schubsen die Farbteilchen herum, bis das ganze Glas gleich gefärbt ist.'
    },
    readout: {
      dichte: (l, r) => 'Links ' + l + ' Teilchen · rechts ' + r + ' Teilchen',
      waerme: (l, r) => 'Tempo links Ø ' + l + ' · rechts Ø ' + r,
      farbe: (l, r) => 'Farbteilchen links ' + l + ' · rechts ' + r
    },
    tasks: {
      title: 'Aufgabe',
      intro: 'Bring in allen drei Versuchen den Unterschied unter 10 %.',
      dichte: 'Dichte: viele und wenige Teilchen',
      waerme: 'Wärme: schnelle und langsame Teilchen',
      farbe: 'Konzentration: Farbe im Wasser',
      one: 'Geschafft! Probier den nächsten Versuch.',
      all: 'Alle drei geschafft!'
    },
    merke: 'Ob Dichte, Wärme oder Konzentration: Jeder Unterschied baut sich von selbst ab. Andersherum passiert es nie – setz die Wand wieder ein, die Teilchen sortieren sich nicht zurück.',
    topics: {
      back: {
        title: 'Warum sortieren sich die Teilchen nie zurück?',
        body: '<p>Jedes Teilchen fliegt einfach geradeaus, bis es an die Wand oder an ein anderes Teilchen stößt. Keines „weiß“, wo es hin soll. Trotzdem verteilen sie sich gleichmäßig – weil es viel mehr Möglichkeiten gibt, gemischt zu sein, als sortiert.</p><p>Dass sich alle Teilchen zufällig wieder auf einer Seite sammeln, ist zwar nicht verboten, aber so unwahrscheinlich, dass man es nie beobachtet. Physikerinnen und Physiker nennen das den <b>zweiten Hauptsatz der Thermodynamik</b>: Von selbst werden Unterschiede kleiner, nicht größer.</p>'
      },
      model: {
        title: 'Was ist an dem Modell vereinfacht?',
        body: '<p>Die Teilchen sind hier riesig, und es sind nur wenige. In einem einzigen Kubikzentimeter Luft stecken etwa 25 Trillionen Teilchen, und sie fliegen mit rund 500 m/s viel schneller. Darum dauert der Ausgleich hier Sekunden – in einem echten Zimmer mischt sich Luft vor allem durch Luftbewegungen.</p>'
      }
    },
    next: 'Weiter zu Stufe 2: Seewind →'
  },

  // ---- Stage 2: sea breeze -------------------------------------------------
  s2: {
    kicker: 'Stufe 2 von 3 · Wie Wind entsteht',
    headline: 'See–<br>wind',
    lead: 'Ein Schnitt durch Meer, Küste und Luft. Die Sonne heizt das Land schneller als das Wasser. Was macht die Luft darüber?',
    canvasAria: 'Querschnitt durch Küste, Meer und Luft',
    badge: 'Schieb die Tageszeit',
    time: 'Tageszeit',
    clock: (hh, mm) => hh + ':' + mm + ' Uhr',
    playOn: 'Zeit läuft',
    playOff: 'Zeit angehalten',
    heatLand: 'Land heizen',
    heatSea: 'Meer heizen',
    sunOn: 'Sonne an',
    sunOff: 'Sonne aus',
    showAria: 'Was die Zeichnung zeigt',
    show: { arrows: 'Pfeile', isobars: 'Isobaren', smoke: 'Rauch', tracers: 'Luftteilchen' },
    infoAria: 'Isobaren, Hoch und Tief erklären',
    note: '<p>Die Isobaren sind Linien gleichen Luftdrucks. Über dem warmen Boden steigt die Luft auf, unten entsteht ein <b>Tief (T)</b>, über dem kühleren Boden ein <b>Hoch (H)</b>. Am Boden weht der Wind vom Hoch zum Tief.</p>',
    hint: 'Halte „Land heizen“ oder „Meer heizen“ gedrückt, um selbst nachzuhelfen. Am Boden weht der Wind vom Hoch (H) zum Tief (T).',
    canvas: {
      isobars: 'ISOBAREN',
      high: 'H',
      low: 'T',
      rising: 'WARME LUFT STEIGT AUF',
      sinking: 'KÜHLE LUFT SINKT AB',
      sea: t => 'MEER ' + t + ' °C',
      land: t => 'LAND ' + t + ' °C',
      landHeated: 'LAND WIRD GEHEIZT',
      seaHeated: 'MEER WIRD GEHEIZT',
      timer: s => '⏱ ' + s + ' S'
    },
    wind: {
      calm: 'Windstille',
      sea: 'Seewind (vom Meer zum Land)',
      land: 'Landwind (vom Land zum Meer)'
    },
    readout: (kind, ms, bft, dp) => kind + ' · ' + ms + ' m/s · Windstärke ' + bft + ' · Druckunterschied ' + dp + ' hPa',
    tasks: {
      title: 'Aufgabe',
      intro: 'Es ist frühmorgens, der Landwind treibt den Segler aufs Meer hinaus. <b>Bring ihn in 30 Sekunden ans Ufer!</b>',
      start: 'Aufgabe starten',
      boat: 'Segler ans Ufer gebracht',
      night: 'Nachts Landwind beobachtet (Zeit nach 21 Uhr)',
      go: s => 'Los! Noch ' + s + ' s',
      left: s => 'Noch ' + s + ' s',
      success: s => 'Geschafft! Noch ' + s + ' s übrig.',
      timeout: 'Zeit um! Tipp: Das Land muss wärmer werden als das Meer.'
    },
    merke: 'Wind ist Luft, die einen Druckunterschied ausgleicht. Tagsüber weht er vom kühlen Meer zum warmen Land (Seewind), nachts umgekehrt (Landwind).',
    topics: {
      why: {
        title: 'Warum wird das Land schneller warm als das Meer?',
        body: '<p>Die Sonne scheint auf Land und Meer gleich stark. Der Boden wird aber nur an der Oberfläche warm, und Gestein und Sand brauchen wenig Energie, um wärmer zu werden. Wasser dagegen kann sehr viel Wärme speichern, und Wellen mischen die warme Oberfläche mit kühlerem Wasser darunter.</p><p>Darum ist das Land am Nachmittag viel wärmer als das Meer und kühlt nachts auch schneller wieder ab. Das Meer bleibt den ganzen Tag fast gleich warm.</p>'
      },
      model: {
        title: 'Was ist an dem Modell vereinfacht?',
        body: '<p>Ein ganzer Tag dauert hier nur 48 Sekunden, und die Luft kreist in einer einzigen gleichmäßigen Walze. In Wirklichkeit reicht der Seewind meist nur einige Hundert Meter hoch und einige Kilometer weit ins Land. Temperaturen, Druck und Windstärke sind grob vereinfacht.</p>'
      }
    },
    next: 'Weiter zu Stufe 3: Wetterkarte →'
  },

  // ---- Stage 3: weather map ------------------------------------------------
  s3: {
    kicker: 'Stufe 3 von 3 · Das große Bild',
    headline: 'Wetter–<br>karte',
    lead: 'Mal mit dem Finger Hochs und Tiefs auf die Karte. Je enger die Isobaren liegen, desto stärker weht der Wind.',
    brushAria: 'Pinsel wählen',
    brushHigh: 'Hoch: Luft dazu',
    brushLow: 'Tief: Luft weg',
    canvasAria: 'Wetterkarte zum Malen von Hochs und Tiefs',
    badge: 'Halte den Finger auf die Karte',
    rot: 'Erdrotation',
    rotInfoAria: 'Erdrotation erklären',
    rotNote: '<p>Mit Erdrotation wird der Wind auf der Nordhalbkugel nach rechts abgelenkt. Er kreist dann gegen den Uhrzeigersinn um das Tief – und das Tief füllt sich langsamer.</p>',
    sunOn: 'Sonne an',
    sunOff: 'Sonne aus',
    arrows: 'Pfeile',
    reset: 'Karte leeren',
    hint: 'Halte den Finger oder die Maus auf die Karte: Mit „Hoch“ häufst du Luft an, mit „Tief“ nimmst du sie weg. Die Linien sind Isobaren.',
    canvas: {
      high: 'H',
      low: 'T',
      bft: b => 'BFT ' + b,
      rotOn: 'ERDROTATION AN',
      rotOff: 'ERDROTATION AUS',
      sunOn: 'SONNE AN',
      sunOff: 'SONNE AUS'
    },
    readout: (ms, bft, range) => 'Leuchtturm: ' + ms + ' m/s · Windstärke ' + bft + ' · größter Druckunterschied ' + range + ' hPa',
    tasks: {
      title: 'Aufgaben',
      bft6: 'Erzeuge Windstärke 6 am Leuchtturm an der Küste.',
      wirbel: 'Lass den Wind um ein kräftiges Tief kreisen.',
      still: 'Schalte die Sonne aus und warte auf Windstille.',
      one: 'Geschafft!',
      all: 'Alle Aufgaben geschafft!'
    },
    merke: 'Die Sonne erzeugt ständig neue Unterschiede, die Natur gleicht sie ständig aus. Wetter ist genau dieses Wechselspiel.',
    topics: {
      rot: {
        title: 'Warum kreist der Wind um das Tief?',
        body: '<p>Ohne Erdrotation würde die Luft auf dem kürzesten Weg vom Hoch ins Tief strömen, und das Tief wäre schnell aufgefüllt. Die Erde dreht sich aber unter der strömenden Luft weiter. Von der Erde aus gesehen wird der Wind darum abgelenkt – auf der Nordhalbkugel nach rechts. Diese Scheinkraft heißt <b>Corioliskraft</b>.</p><p>Am Ende weht der Wind fast parallel zu den Isobaren und kreist um das Tief, auf der Nordhalbkugel gegen den Uhrzeigersinn. Darum halten sich Tiefs tagelang, und darum zeigen Wetterkarten so schöne Wirbel.</p>'
      },
      model: {
        title: 'Was ist an dem Modell vereinfacht?',
        body: '<p>Die Karte ist ausgedacht. Echte Hochs und Tiefs sind Hunderte bis Tausende Kilometer groß und halten sich tagelang – hier entstehen und verschwinden sie in Sekunden. Die Sonne lässt hier zufällig Tiefs über dem warmen Land und Hochs über dem kühleren Meer entstehen.</p>'
      }
    },
    next: 'Zum Vergleich →'
  },

  // ---- Comparison ----------------------------------------------------------
  cmp: {
    kicker: 'Zum Schluss',
    headline: 'Immer das–<br>selbe',
    lead: 'Vier Dinge, die strömen – und alle tun das Gleiche: Sie fließen vom Mehr zum Weniger, bis der Unterschied weg ist.',
    heat: {
      aria: 'Wärme fließt durch einen Metallstab',
      title: 'Wärme',
      big: 'von warm nach kalt',
      text: 'Die schnellen Teilchen im warmen Ende stoßen die langsamen an, bis der ganze Stab gleich warm ist.',
      warm: 'WARM',
      cold: 'KALT'
    },
    water: {
      aria: 'Wasser fließt bergab zwischen zwei Becken',
      title: 'Wasser',
      big: 'fließt bergab',
      text: 'Vom hohen zum niedrigen Wasserstand, bis beide Becken gleich hoch stehen.',
      high: 'HOCH',
      low: 'NIEDRIG'
    },
    current: {
      aria: 'Strom fließt von Plus nach Minus',
      title: 'Strom',
      big: 'von + nach −',
      text: 'Eine Spannung ist ein Unterschied. Der Strom fließt, die Lampe leuchtet, bis die Spannung weg ist.',
      plus: '+',
      minus: '−'
    },
    wind: {
      aria: 'Wind weht vom Hoch zum Tief',
      title: 'Wind',
      big: 'vom Hoch zum Tief',
      text: 'Luft strömt dorthin, wo weniger Luft ist, bis der Druck überall gleich ist.',
      high: 'H',
      low: 'T'
    },
    foot: 'Unterschied → Gradient → Strömung → Ausgleich. Die Sonne sorgt dafür, dass dieses Spiel auf der Erde nie aufhört. Darum gibt es Wetter.',
    reset: 'Nochmal ansehen',
    resetSub: 'Alle vier von vorn',
    next: 'Zurück zum Anfang →'
  }
};
