/* LUNA - interpretatiegids.
   Teksten uit de Horoscoop-analyse Toolkit (deel 3, 4 en 8), als gegevens
   zodat de schermen ze kunnen tonen naast de berekende standen. Traditionele
   astrologie: symbooltaal, geen wetenschap. */
(function (global) {
  'use strict';

  var PLANEET = {
    zon: { functie: 'Identiteit, levenskracht, wil', vraag: 'Wie ben ik, waar straal ik?', kracht: 'Zelfbewustzijn, creativiteit', schaduw: 'Ego, hoogmoed', groep: 'persoonlijk' },
    maan: { functie: 'Gevoel, behoeften, veiligheid', vraag: 'Wat heb ik nodig om me thuis te voelen?', kracht: 'Zorg, intuïtie', schaduw: 'Stemmingen, afhankelijkheid', groep: 'persoonlijk' },
    mercurius: { functie: 'Denken, taal, leren', vraag: 'Hoe verwerk en deel ik informatie?', kracht: 'Helderheid, humor', schaduw: 'Onrust, oppervlakkigheid', groep: 'persoonlijk' },
    venus: { functie: 'Liefde, waarden, smaak', vraag: 'Wat waardeer ik, hoe verbind ik me?', kracht: 'Harmonie, schoonheid', schaduw: 'IJdelheid, conflictvermijding', groep: 'persoonlijk' },
    mars: { functie: 'Wil, actie, drive', vraag: 'Hoe kom ik in beweging en voor mezelf op?', kracht: 'Moed, energie', schaduw: 'Agressie, ongeduld', groep: 'persoonlijk' },
    jupiter: { functie: 'Groei, zin, vertrouwen', vraag: 'Waar groei ik en wat geeft betekenis?', kracht: 'Optimisme, ruimhartigheid', schaduw: 'Overdaad, zelfoverschatting', groep: 'sociaal' },
    saturnus: { functie: 'Structuur, grenzen, tijd', vraag: 'Waar moet ik volwassen worden?', kracht: 'Discipline, betrouwbaarheid', schaduw: 'Angst, starheid', groep: 'sociaal' },
    uranus: { functie: 'Vrijheid, vernieuwing', vraag: 'Waar wil ik anders zijn?', kracht: 'Originaliteit, inzicht', schaduw: 'Rebellie, onrust', groep: 'generatie' },
    neptunus: { functie: 'Verbeelding, overgave', vraag: 'Waar zoek ik het grenzeloze?', kracht: 'Inspiratie, compassie', schaduw: 'Illusie, vluchtgedrag', groep: 'generatie' },
    pluto: { functie: 'Transformatie, macht', vraag: 'Wat moet sterven om te herboren worden?', kracht: 'Diepgang, veerkracht', schaduw: 'Controle, obsessie', groep: 'generatie' },
    knoop: { functie: 'Groeirichting', vraag: 'Waar word ik naartoe getrokken?', kracht: 'Ontwikkeling', schaduw: 'Ongemak, onwennigheid', groep: 'knoop' }
  };

  var GROEPEN = {
    persoonlijk: 'Persoonlijke planeet: karakter en dagelijks gedrag, de zwaarste weging.',
    sociaal: 'Sociale planeet: je verhouding tot de samenleving, groei en grenzen.',
    generatie: 'Generatieplaneet: een collectief thema; persoonlijk vooral via huis en aspecten met persoonlijke planeten.',
    knoop: 'Knoop: de richting waarin je groeit.'
  };

  var ELEMENT = {
    vuur: { thema: 'Inspiratie, actie', sterk: 'Enthousiast, spontaan, soms ongeduldig', weinig: 'Moeite met motivatie of zelfvertrouwen' },
    aarde: { thema: 'Realiteit, materie', sterk: 'Praktisch, betrouwbaar, soms star', weinig: 'Moeite met structuur, geld, lichaam' },
    lucht: { thema: 'Denken, contact', sterk: 'Communicatief, objectief, soms afstandelijk', weinig: 'Moeite met afstand nemen en relativeren' },
    water: { thema: 'Gevoel, verbinding', sterk: 'Empathisch, intuïtief, soms overspoeld', weinig: 'Moeite met emoties herkennen en uiten' }
  };

  var KWALITEIT = {
    hoofd: { thema: 'Initiatief', sterk: 'Starter, neemt de leiding', weinig: 'Moeite met beginnen' },
    vast: { thema: 'Volharding', sterk: 'Doorzetter, loyaal, soms star', weinig: 'Moeite met afmaken en volhouden' },
    beweeglijk: { thema: 'Aanpassing', sterk: 'Flexibel, veelzijdig, soms wispelturig', weinig: 'Moeite met veranderen en loslaten' }
  };

  var VUISTREGEL = 'Een element met een score van 0 tot 1 is een ontbrekend element. Dat is vaak juist een ' +
    'levensthema: je compenseert het, of zoekt het bij anderen.';

  var TEKEN_VALKUIL = ['Ongeduldig, botsend', 'Koppig, bezitterig', 'Versnipperd, onrustig',
    'Lichtgeraakt, vastklampen', 'Dominant, behoefte aan applaus', 'Perfectionistisch, piekeren',
    'Besluiteloos, pleasen', 'Jaloers, controlerend', 'Overdrijven, rusteloos', 'Streng, somber',
    'Afstandelijk, eigenwijs', 'Vaag, grenzeloos'];

  /* Per huis: type en kernvraag. */
  var HUIS = [
    { type: 'Hoekhuis', vraag: 'Hoe kom ik over? Hoe begin ik dingen?' },
    { type: 'Opvolgend huis', vraag: 'Wat heb ik, wat ben ik waard?' },
    { type: 'Vallend huis', vraag: 'Hoe denk en praat ik?' },
    { type: 'Hoekhuis', vraag: 'Waar kom ik vandaan, wat is mijn basis?' },
    { type: 'Opvolgend huis', vraag: 'Waar geniet ik van, hoe druk ik me uit?' },
    { type: 'Vallend huis', vraag: 'Hoe richt ik mijn dagen in?' },
    { type: 'Hoekhuis', vraag: 'Wat zoek ik in de ander?' },
    { type: 'Opvolgend huis', vraag: 'Wat deel ik, wat laat ik los?' },
    { type: 'Vallend huis', vraag: 'Waar geloof ik in?' },
    { type: 'Hoekhuis', vraag: 'Wat wil ik bereiken in de wereld?' },
    { type: 'Opvolgend huis', vraag: 'Bij wie hoor ik, waar hoop ik op?' },
    { type: 'Vallend huis', vraag: 'Wat zit verborgen, waar laat ik los?' }
  ];

  var HUIS_LEZEN = [
    ['Teken op de cusp', 'de stijl waarmee je dit levensgebied benadert.'],
    ['Planeten in het huis', 'welke energie hier actief is; een vol huis is een levensthema.'],
    ['Heerser van het huis', 'waar die heerser staat, stroomt dit levensgebied naartoe. Heerser van 10 in 4: carrière verbonden met thuis of familie.'],
    ['Aspecten op heerser en bewoners', 'gemak of spanning in dit gebied.']
  ];
  var HUIS_LEEG = 'Een leeg huis is niet onbelangrijk: lees het via het teken op de cusp en de heerser.';

  var ASPECT = {
    conjunctie: { vraag: 'Wat gebeurt er als deze twee functies onlosmakelijk samengaan?', werking: 'Versmelting; de planeten werken als één geheel.' },
    sextiel: { vraag: 'Welk talent kan ik bewust inzetten?', werking: 'Kansen die activiteit vragen.' },
    vierkant: { vraag: 'Waar zit innerlijke strijd die me sterker maakt?', werking: 'Wrijving, motor voor actie.' },
    driehoek: { vraag: 'Wat gaat vanzelf (en neem ik misschien voor lief)?', werking: 'Natuurlijke stroming, gemak.' },
    oppositie: { vraag: 'Welke tegenpolen moet ik verbinden in plaats van kiezen?', werking: 'Polariteit, projectie op anderen.' }
  };

  var ASPECT_WEGING = [
    ['Orbis', 'Onder 2° (vrijwel exact) weegt zwaarder, boven 5° lichter.'],
    ['Betrokken planeten', 'Zon, Maan en horoscoopheerser wegen zwaarder; generatieplaneten onderling lichter.'],
    ['Richting', 'Applicerend (wordt exacter) weegt zwaarder dan separerend (wordt losser).'],
    ['Hoekpunten', 'Een aspect met ascendant of MC weegt zwaarder.']
  ];
  var ASPECT_GENERATIE = 'Uranus, Neptunus en Pluto onderling delen hele generaties. Lees ze alleen persoonlijk ' +
    'als er ook een persoonlijke planeet of hoekpunt bij betrokken is.';

  var WAARDIGHEID = {
    domicilie: 'Thuis: de planeet werkt vanzelfsprekend en krachtig.',
    exaltatie: 'Verheven: de planeet werkt vanzelfsprekend en krachtig.',
    detriment: 'Uit balans: de energie moet een omweg maken. Geen slechte plaatsing; juist hier ontstaat vaak bijzondere vaardigheid door bewuste ontwikkeling.',
    val: 'Verzwakt: de energie moet een omweg maken. Geen slechte plaatsing; juist hier ontstaat vaak bijzondere vaardigheid door bewuste ontwikkeling.'
  };

  var PATROON = {
    'stellium': { opbouw: '3 of meer planeten in één teken of huis', betekenis: 'Sterke focus, levensthema.', sleutel: 'Ruimte maken voor de rest van de horoscoop.' },
    'grote-driehoek': { opbouw: 'Drie planeten in onderling driehoeksaspect', betekenis: 'Groot talent, gemak in één element.', sleutel: 'Het talent actief inzetten in plaats van erop te leunen.' },
    't-vierkant': { opbouw: 'Oppositie plus twee vierkanten naar een brandpunt', betekenis: 'Grote drive en spanning.', sleutel: 'Het lege punt tegenover het brandpunt: daar ligt de uitweg.' },
    'groot-kruis': { opbouw: 'Twee opposities en vier vierkanten', betekenis: 'Veel spanning in alle richtingen.', sleutel: 'Rust en prioriteit vinden.' },
    'vlieger': { opbouw: 'Grote driehoek plus een oppositie', betekenis: 'Talent met richting.', sleutel: 'De oppositie geeft de drive om het talent te gebruiken.' }
  };

  var RETROGRADE = {
    mercurius: 'Denkt eerst na voor iets te zeggen, origineel denken, leert anders.',
    venus: 'Eigen, minder conventionele waarden in liefde en smaak; zelfwaardering ontwikkelt later.',
    mars: 'Woede en drive worden eerst naar binnen gericht; strategisch in plaats van impulsief.',
    buiten: 'Zeer gebruikelijk (een groot deel van het jaar retrograde); het thema wordt meer innerlijk beleefd.'
  };
  function retrograde(k) {
    if (RETROGRADE[k]) return RETROGRADE[k];
    return ['jupiter', 'saturnus', 'uranus', 'neptunus', 'pluto'].indexOf(k) >= 0 ? RETROGRADE.buiten : null;
  }

  /* Hoek zon-maan in stappen van 45 graden. */
  var MAANFASE = [
    'Instinctief, spontaan, nieuw begin.', 'Doorzettend, losmaken van het oude.',
    'Daadkrachtig, bouwen door crises heen.', 'Verfijnen, analyseren, perfectioneren.',
    'Relationeel, bewustwording, balans.', 'Delen, onderwijzen, inspireren.',
    'Herwaarderen, heroriënteren.', 'Afronden, visionair, loslaten.'
  ];

  var TRANSIT_DUUR = {
    mars: ['Enkele dagen', 'Energie, actie, conflict'],
    jupiter: ['Weken tot maanden', 'Kansen, groei, verruiming'],
    saturnus: ['Maanden', 'Verantwoordelijkheid, toetsing, structuur'],
    uranus: ['1 tot 2 jaar', 'Doorbraak, verrassing, vrijheid'],
    neptunus: ['2 tot 3 jaar', 'Inspiratie, onzekerheid, overgave'],
    pluto: ['2 tot 3 jaar', 'Diepe transformatie']
  };

  /* leeftijd = [van, tot] in jaren; bij een herhaling meerdere paren. */
  var CYCLI = [
    { naam: 'Saturnusretour', leeftijd: [[28, 30], [57, 60]], thema: 'Volwassenheid, balans opmaken' },
    { naam: 'Jupiterretour', leeftijd: [[12, 12], [24, 24], [36, 36], [48, 48], [60, 60], [72, 72]], thema: 'Een nieuwe groeicyclus, elke 12 jaar' },
    { naam: 'Uranus oppositie Uranus', leeftijd: [[40, 42]], thema: 'Midlife, eigenheid herontdekken' },
    { naam: 'Chironretour', leeftijd: [[49, 51]], thema: 'Helen van oude pijn, wijsheid' }
  ];

  var STAPPEN = [
    ['Betrouwbaarheid geboortetijd', 'Kan ik huizen en ascendant gebruiken?'],
    ['Totaalbeeld wiel', 'Waar clusteren planeten? Veel spanningsaspecten of harmonische?'],
    ['Elementen en kwaliteiten', 'Wat is sterk, wat ontbreekt?'],
    ['Halfronden', 'Naar binnen (onder) of naar buiten (boven) gericht? Zelfbepalend (oost) of op anderen gericht (west)?'],
    ['Maanfase', 'Welke levenshouding?'],
    ['De grote drie', 'Hoe verhouden kern, gevoel en uitstraling zich?'],
    ['Horoscoopheerser', 'Waar staat de regisseur van de horoscoop (teken, huis, aspecten)?'],
    ['Dominante planeten en patronen', 'Welke energie kleurt alles?'],
    ['Strakste aspecten (orbis onder 3°)', 'Welke kernspanningen en talenten?'],
    ['Persoonlijke planeten', 'Denken, liefhebben, handelen.'],
    ['Levensgebieden via huizen', 'Werk, relaties, thuis, zingeving.'],
    ['Levensrichting en transits', 'Waar groei ik naartoe, wat vraagt nu aandacht?']
  ];

  var DRIEVOUDIG = 'Neem een thema pas als hoofdthema op als je het minstens drie keer vindt in verschillende ' +
    'factoren. Bijvoorbeeld "behoefte aan zekerheid" bij Zon in Stier, Maan in huis 4 en Saturnus op de ascendant. ' +
    'Eén losse aanwijzing is een nuance, drie aanwijzingen vormen een kernthema.';

  var TEGENSTRIJDIG = 'Elke horoscoop bevat tegenstrijdigheden, bijvoorbeeld Zon in Stier en Maan in Boogschutter: ' +
    'zekerheid en vrijheid. Formuleer ze niet als of-of maar als en-en: hoe kunnen beide kanten samen bestaan, en ' +
    'in welke situaties komt welke kant naar voren?';

  var FOUTEN = [
    ['Alleen naar het zonneteken kijken', 'Kijk minstens naar de grote drie en de horoscoopheerser.'],
    ['Losse kookboekzinnen achter elkaar zetten', 'Werk met thema\'s en drievoudige bevestiging.'],
    ['Alle aspecten even zwaar wegen', 'Een aspect van 7° werkt veel zwakker dan een van 0,5°; begin met de strakste.'],
    ['Vierkanten en opposities slecht noemen', 'Spanning is ook motor; benoem talent en valkuil van elk aspect.'],
    ['Huizen duiden bij een onzekere geboortetijd', 'Huizen verschuiven snel met de tijd; zonder betrouwbare tijd geen huizen.'],
    ['Zomertijd vergeten', 'Een uur verschil verschuift de ascendant ongeveer 15°.'],
    ['Een taalmodel laten rekenen', 'Taalmodellen maken rekenfouten in posities: reken hier, interpreteer daar.'],
    ['Voorspellingen doen', 'Spreek in thema\'s, kansen en reflectievragen.']
  ];

  var BEGRIPPEN = [
    ['Applicerend', 'Aspect dat exacter wordt (de snellere planeet nadert).'],
    ['Ascendant (AC)', 'Teken dat op het moment van geboorte aan de oostelijke horizon opkwam.'],
    ['Aspect', 'Hoekafstand tussen twee punten die een betekenisvolle relatie aangeeft.'],
    ['Cusp', 'Beginpunt van een huis.'],
    ['Descendant (DC)', 'Punt tegenover de ascendant; begin van huis 7.'],
    ['Hoekhuizen', 'Huizen 1, 4, 7 en 10; planeten hier werken sterk naar buiten.'],
    ['Horoscoopheerser', 'Heerser van het teken op de ascendant.'],
    ['IC (Imum Coeli)', 'Laagste punt van de horoscoop; begin van huis 4.'],
    ['MC (Medium Coeli)', 'Hoogste punt van de horoscoop; begin van huis 10.'],
    ['Orbis', 'Afwijking ten opzichte van het exacte aspect, in graden.'],
    ['Retrograde (℞)', 'Planeet die vanaf de aarde gezien schijnbaar achteruit beweegt.'],
    ['Separerend', 'Aspect dat losser wordt.'],
    ['Stellium', 'Drie of meer planeten in één teken of huis.'],
    ['Synastrie', 'Vergelijking van twee horoscopen.'],
    ['Transit', 'Huidige planeetstand in aspect met een geboortepositie.'],
    ['Tropische dierenriem', 'Dierenriem gekoppeld aan de seizoenen (0° Ram is het lentepunt); westerse standaard.']
  ];

  global.LunaGids = {
    PLANEET: PLANEET, GROEPEN: GROEPEN, ELEMENT: ELEMENT, KWALITEIT: KWALITEIT, VUISTREGEL: VUISTREGEL,
    TEKEN_VALKUIL: TEKEN_VALKUIL, HUIS: HUIS, HUIS_LEZEN: HUIS_LEZEN, HUIS_LEEG: HUIS_LEEG,
    ASPECT: ASPECT, ASPECT_WEGING: ASPECT_WEGING, ASPECT_GENERATIE: ASPECT_GENERATIE,
    WAARDIGHEID: WAARDIGHEID, PATROON: PATROON, retrograde: retrograde, MAANFASE: MAANFASE,
    TRANSIT_DUUR: TRANSIT_DUUR, CYCLI: CYCLI, STAPPEN: STAPPEN, DRIEVOUDIG: DRIEVOUDIG,
    TEGENSTRIJDIG: TEGENSTRIJDIG, FOUTEN: FOUTEN, BEGRIPPEN: BEGRIPPEN
  };
})(typeof window !== 'undefined' ? window : globalThis);
