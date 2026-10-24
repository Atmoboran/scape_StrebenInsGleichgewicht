// Every visible text of the app. Edit or translate this file to adapt the
// exhibit; index.html only holds data-t="path.to.key" placeholders that
// js/texts.js fills from here. Entries written as functions build a sentence
// around runtime values. Lines marked LOCAL refer to SCAPE° or its region.
window.TEXTS = {
  lang: 'de',
  pageTitle: 'Das Streben nach Gleichgewicht',
  description: 'Das Streben nach Gleichgewicht: eine Simulation in drei Stufen – vom Teilchenkasten über den Seewind bis zur Wetterkarte.',

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
    close: 'Schließen',
    howto: 'Anleitung',
    merkeLocked: 'Löse die Aufgaben – dann erscheint hier, was du herausgefunden hast.',
    devLink: 'Dev-Modus',
    devTitle: 'Dev-Modus'
  },

  nav: {
    aria: 'Teile der Simulation',
    home: 'Zur Startseite',
    s1: 'Prinzip',
    s2: 'Seewind',
    s3: 'Wetterkarte'
  },


  // The difference meter at the edge of every simulation.
  meter: {
    label: 'Unterschied',
    percent: v => v + '\u00a0%',
    none: '–'
  },

  // The small instrument bar above the sea-breeze and weather-map drawings.
  hud: {
    dirAria: 'Windrichtung',
    bftAria: 'Windstärke (Beaufort 0–12)',
    bftMaxAria: 'Stärkster Wind auf der Karte (Beaufort 0–12)',
    dpAria: 'Druckunterschied zwischen Meer und Land',
    dpMaxAria: 'Größter Druckunterschied auf der Karte',
    bft: b => 'Bft\u00a0' + b,
    hpa: v => v + '\u00a0hPa'
  },

  // ---- Start page ----------------------------------------------------------
  start: {
    kicker: 'Eine Simulation in drei Stufen',
    headline: 'Das Streben nach Gleich–<br>gewicht',
    lead: 'Überall, wo es einen Unterschied gibt, kommt etwas in Bewegung – so lange, bis der Unterschied verschwunden ist. Das gilt für Teilchen in einem Kasten, für den Wind an der Küste und für das Wetter auf der ganzen Welt.',
    partsTitle: 'Drei Stufen',
    parts: {
      s1: '<b>1 Teilchenkasten</b> – Zieh die Trennwand weg und sieh zu, wie sich Teilchen und Wärme verteilen.',
      s2: '<b>2 Seewind</b> – Stell die Tageszeit ein. Die Sonne heizt das Land schneller als das Meer – und es weht.',
      s3: '<b>3 Wetterkarte</b> – Mal selbst Hochs und Tiefs auf die Karte von Europa und schalte die Erdrotation ein.'
    },
    next: 'Los geht’s: Stufe 1 →'
  },

  // ---- Stage 1: particle box -----------------------------------------------
  s1: {
    kicker: 'Stufe 1 von 3 · Das Prinzip',
    headline: 'Teilchen–<br>kasten',
    lead: 'Links drängeln sich viele Teilchen, rechts sind nur wenige. Was passiert, wenn du die Trennwand wegziehst?',
    modesAria: 'Versuch wählen',
    modes: { dichte: 'Dichte', waerme: 'Warm & kalt' },
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
      waerme: 'Wärme ist Bewegung: Links flitzen schnelle, warme Teilchen (rot), rechts trödeln langsame, kalte (blau). Wenn sie zusammenstoßen, geben die schnellen Schwung ab.'
    },
    readout: {
      dichte: (l, r) => 'Links ' + l + ' Teilchen · rechts ' + r + ' Teilchen',
      waerme: (l, r) => 'Tempo links Ø ' + l + ' · rechts Ø ' + r
    },
    tasks: {
      title: 'Aufgabe',
      intro: 'Bring in beiden Versuchen den Unterschied unter 10 %.',
      dichte: 'Dichte: viele und wenige Teilchen',
      waerme: 'Wärme: schnelle und langsame Teilchen',
      one: 'Geschafft! Probier den anderen Versuch.',
      all: 'Beide geschafft!'
    },
    merke: 'Alles strebt ins Gleichgewicht: Die Natur gleicht Unterschiede immer von selbst aus – ob Dichte oder Wärme. Von allein kehrt sich das nie um: Die Teilchen sammeln sich nie wieder alle auf einer Seite.',
    // Info text: the same principle everywhere (replaces the former comparison screen).
    same: {
      title: 'Immer dasselbe',
      lead: 'Alles strebt ins Gleichgewicht. Die Natur ist immer bestrebt, Unterschiede auszugleichen – überall fließt etwas vom Mehr zum Weniger, bis der Unterschied weg ist:',
      heat: { title: 'Wärme', text: 'fließt von warm nach kalt, bis alles gleich warm ist.' },
      water: { title: 'Wasser', text: 'fließt bergab, bis alle Becken gleich hoch stehen.' },
      current: { title: 'Strom', text: 'fließt von + nach −, bis die Spannung weg ist.' },
      wind: { title: 'Wind', text: 'weht vom Hoch zum Tief, bis der Luftdruck überall gleich ist.' }
    },
    topics: {
      back: {
        title: 'Warum sortieren sich die Teilchen nie zurück?',
        body: '<p>Jedes Teilchen fliegt einfach geradeaus, bis es an die Wand oder an ein anderes Teilchen stößt. Keines „weiß“, wo es hin soll. Trotzdem verteilen sie sich gleichmäßig – weil es viel mehr Möglichkeiten gibt, gemischt zu sein, als sortiert.</p><p>Dass sich alle Teilchen zufällig wieder auf einer Seite sammeln, ist zwar nicht verboten, aber so unwahrscheinlich, dass man es nie beobachtet.</p><p>Physikerinnen und Physiker haben dafür ein Wort: <b>Entropie</b>. Sie misst, wie viele Möglichkeiten es gibt, die Teilchen anzuordnen – grob gesagt, wie gut etwas durchmischt ist. Der <b>zweite Hauptsatz der Thermodynamik</b> sagt: Von selbst nimmt die Entropie nur zu, nie ab. Darum werden Unterschiede von selbst kleiner und nicht größer.</p>'
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
    sunOn: 'Sonne an',
    sunOff: 'Sonne aus',
    showAria: 'Was die Zeichnung zeigt',
    show: { arrows: 'Pfeile', isobars: 'Isobaren', smoke: 'Rauch', tracers: 'Luftteilchen' },
    howto: '<p>Die Zeit läuft von selbst. Mit dem Regler <b>Tageszeit</b> stellst du sie selbst ein.</p><p>Die violetten Linien sind <b>Isobaren</b>, Linien gleichen Luftdrucks. Über dem warmen Boden steigt die Luft auf, unten entsteht ein <b>Tief (T)</b>, über dem kühleren Boden ein <b>Hoch (H)</b>. Am Boden weht der Wind vom Hoch zum Tief.</p><p>Die Leiste über der Zeichnung zeigt die <b>Windrichtung</b> (Pfeil), die <b>Windstärke</b> nach Beaufort (0 bis 12 Striche) und den <b>Druckunterschied Δp</b> zwischen Meer und Land.</p>',
    canvas: {
      isobars: 'ISOBAREN',
      high: 'H',
      low: 'T',
      rising: 'WARME LUFT STEIGT AUF',
      sinking: 'KÜHLE LUFT SINKT AB',
      sea: t => 'MEER ' + t + ' °C',
      land: t => 'LAND ' + t + ' °C',
      timer: s => '⏱ ' + s + ' S'
    },
    wind: {
      calm: 'Windstill',
      sea: 'Seewind',
      land: 'Landwind'
    },
    tasks: {
      title: 'Aufgabe',
      intro: 'Es ist frühmorgens, der Landwind treibt den Segler aufs Meer hinaus. <b>Bring ihn in 30 Sekunden ans Ufer!</b> Die Zeit steht dabei still – nur du kannst sie mit dem Regler verstellen.',
      start: 'Aufgabe starten',
      boat: 'Segler ans Ufer gebracht',
      night: 'Nachts Landwind beobachtet (Zeit nach 21 Uhr)',
      go: s => 'Los! Noch ' + s + ' s',
      left: s => 'Noch ' + s + ' s',
      success: s => 'Geschafft! Noch ' + s + ' s übrig.',
      timeout: 'Zeit um! Tipp: Wann ist das Land wärmer als das Meer?'
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
    lead: 'Mal mit dem Finger Hochs und Tiefs auf die Karte von Europa und dem Nordatlantik. Je enger die Isobaren liegen, desto stärker weht der Wind.',
    viewAria: 'Blickrichtung wählen',
    viewTop: 'Von oben',
    viewSide: 'Von der Seite',
    cut: 'Schnitt bei',
    cutVal: lat => lat + '° N',
    view: 'Ansicht',
    toolsAria: 'Werkzeug wählen',
    toolHigh: 'Hoch malen (Luft dazu)',
    toolLow: 'Tief malen (Luft weg)',
    toolProbe: 'Windmesser: Wind messen',
    size: 'Größe',
    pause: 'Ausgleich anhalten',
    resume: 'Ausgleich fortsetzen',
    speed: 'Ausgleich-Tempo',
    speedVal: v => v + '×',
    canvasAria: 'Wetterkarte zum Malen von Hochs und Tiefs',
    badge: 'Halte den Finger auf die Karte',
    rot: 'Erdrotation',
    sunOn: 'Sonne an',
    sunOff: 'Sonne aus',
    arrows: 'Pfeile',
    howto: '<p>Wähle <b>H</b> oder <b>T</b> und halte den Finger auf die Karte: Mit H häufst du Luft an (Hoch), mit T nimmst du sie weg (Tief). Mit <b>Größe</b> stellst du ein, wie groß das Hoch oder Tief wird.</p><p>Mit dem <b>Windmesser</b> (Fähnchen) fährst du wie mit einer Lupe über die Karte und misst Windrichtung und Windstärke.</p><p>Die Linien sind <b>Isobaren</b>: Je enger sie liegen, desto stärker weht der Wind. Die Leiste über der Karte zeigt den stärksten Wind und den größten Druckunterschied Δp.</p><p><b>Erdrotation</b>: Auf der Nordhalbkugel wird der Wind nach rechts abgelenkt. Er kreist dann gegen den Uhrzeigersinn um das Tief – und das Tief füllt sich langsamer.</p><p>Bei <b>Ansicht</b> kannst du <b>von der Seite</b> auf die Luft schauen und wählen, wo geschnitten wird: Im Hoch sinkt die Luft ab und der Himmel wird klar, im Tief steigt sie auf und es bilden sich Wolken.</p><p>Mit <b>Ausgleich anhalten</b> frierst du den Druckausgleich ein, um in Ruhe zu messen.</p>',
    canvas: {
      high: 'H',
      low: 'T',
      atlantic: 'NORDATLANTIK',
      europe: 'EUROPA',
      cut: lat => 'SCHNITT ' + lat + '° N',
      west: '← WESTEN',
      east: 'OSTEN →',
      height: 'HÖHE',
      sideIsobars: 'LINIEN GLEICHEN DRUCKS',
      sinking: 'LUFT SINKT AB',
      rising: 'LUFT STEIGT AUF',
      paused: 'AUSGLEICH ANGEHALTEN',
      probeMs: v => v + ' m/s',
      probeBft: (b, dir) => 'Bft ' + b + (dir ? ' · aus ' + dir : ''),
      probeCalm: 'WINDSTILL',
      probeRising: 'LUFT STEIGT',
      probeSinking: 'LUFT SINKT',
      probeEast: 'WIND NACH OSTEN',
      probeWest: 'WIND NACH WESTEN',
      dirs: ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'],
      sunOn: 'SONNE AN',
      sunOff: 'SONNE AUS'
    },
    tasks: {
      title: 'Aufgaben',
      sturm: 'Erzeuge einen Sturm: Windstärke 8 irgendwo auf der Karte.',
      wirbel: 'Schalte die Erdrotation ein und lass den Wind um ein kräftiges Tief kreisen.',
      still: 'Mal ein kräftiges Hoch oder Tief und warte, bis sich alles ausgeglichen hat (Windstille).',
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
        body: '<p>Die Karte zeigt die <b>synoptische Skala</b>: Hochs und Tiefs, die Hunderte bis Tausende Kilometer groß sind – so wie auf der Wetterkarte im Fernsehen. Echte Tiefs halten sich tagelang, hier gleichen sie sich in Sekunden aus. Am Anfang liegen ein <b>Islandtief</b> und ein <b>Azorenhoch</b> auf der Karte, die bekanntesten Druckgebilde über dem Nordatlantik.</p><p>In Wirklichkeit sorgt die Sonne ständig für neue Unterschiede, weil sie die Erde ungleich erwärmt. Darum hört das Wetter nie auf.</p>'
      }
    },
    next: 'Zurück zum Anfang →'
  }
};
