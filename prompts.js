/* LUNA - promptbibliotheek.
   De prompts H-01 t/m H-13 uit de Horoscoop-analyse Toolkit. H-00 (de
   volledige analyse) bouwt LunaAnalyse.prompt. Bij elke prompt hoort wat de app
   zelf kan meeleveren: jouw gegevens, de transits van vandaag of een relatie.
   Laat een taalmodel nooit posities rekenen: dat doet LUNA, het model duidt. */
(function (global) {
  'use strict';

  var AN = global.LunaAnalyse;

  /* inhoud: wat er achter de prompt geplakt wordt.
     geen | data | transits | tweeen | tekst (de gebruiker plakt zelf iets) */
  var LIJST = [
    { id: 'H-01', titel: 'Rode draad', inhoud: 'data',
      uitleg: 'Zoekt thema\'s die minstens drie keer terugkomen en vat de horoscoop samen in vijf zinnen.',
      tekst: 'Je bent een ervaren psychologisch astrologe. Lees de horoscoopgegevens hieronder.\n' +
        'Pas de drievoudige-bevestigingsregel toe: zoek thema\'s die minstens drie keer\n' +
        'terugkomen in verschillende factoren (teken, huis, aspect, dominantie, balans).\n' +
        'Lever een tabel | Thema | Aanwijzing 1 | Aanwijzing 2 | Aanwijzing 3 |, en vat daarna\n' +
        'de rode draad van de horoscoop samen in 5 zinnen.\n' +
        'Verzin geen posities die niet in de data staan.' },
    { id: 'H-02', titel: 'De grote drie in samenspel', inhoud: 'data',
      uitleg: 'Zon, Maan, ascendant en horoscoopheerser: waar ze elkaar versterken en waar ze botsen.',
      tekst: 'Analyseer het samenspel tussen Zon, Maan, Ascendant en horoscoopheerser\n' +
        '(± 600 woorden). Beschrijf: 1) elk afzonderlijk in teken en huis, 2) waar ze\n' +
        'elkaar versterken, 3) waar ze botsen, 4) hoe iemand met deze combinatie zich\n' +
        'voelt op een goede dag en op een slechte dag, 5) drie tips om de spanning te benutten.\n' +
        'Noem bij elke uitspraak de astrologische onderbouwing tussen haakjes.' },
    { id: 'H-03', titel: 'Aspectanalyse in de diepte', inhoud: 'data',
      uitleg: 'De vijf strakste aspecten met kern, gedrag, talent, valkuil en groeivraag.',
      tekst: 'Neem de vijf aspecten met de kleinste orbis. Geef per aspect:\n' +
        '- Kern (1 zin)\n' +
        '- Hoe het zich kan uiten in gedrag (2–3 voorbeelden uit het dagelijks leven)\n' +
        '- Talent\n- Valkuil\n- Groeivraag voor zelfreflectie\n' +
        'Sluit af met hoe deze vijf aspecten samen een patroon vormen.' },
    { id: 'H-04', titel: 'Werk en roeping', inhoud: 'data',
      uitleg: 'Werkstijl, omgevingen waarin je floreert en passende werkrichtingen.',
      tekst: 'Analyseer werk en roeping op basis van: MC (teken en aspecten), heerser van huis 10\n' +
        'en zijn positie, planeten in huis 10, huis 6 (dagelijks werk) en huis 2 (inkomen),\n' +
        'Saturnus, en de dominante planeten. Lever:\n' +
        '1. Werkstijl in 5 punten\n' +
        '2. Omgevingen waarin deze persoon floreert en waar niet (tabel)\n' +
        '3. Tien passende werkrichtingen met astrologische onderbouwing (tabel)\n' +
        '4. Valkuilen in werk en hoe ermee om te gaan\n' +
        'Formuleer als mogelijkheden, niet als vaststaande feiten.' },
    { id: 'H-05', titel: 'Relaties en liefde', inhoud: 'data',
      uitleg: 'Liefdestaal, wat je zoekt in een partner en terugkerende patronen.',
      tekst: 'Analyseer relaties via: Venus, Mars, Maan, de Descendant (teken op cusp 7),\n' +
        'planeten in huis 5, 7 en 8, de heerser van huis 7, en aspecten tussen Venus/Mars/Maan\n' +
        'en Saturnus/Uranus/Neptunus/Pluto. Beschrijf: liefdestaal, wat deze persoon zoekt\n' +
        'in een partner, wat ze zelf meebrengt, terugkerende relatiepatronen, en drie\n' +
        'reflectievragen. Respectvol en zonder oordeel; geen uitspraken over wanneer iemand\n' +
        'een partner "zal" vinden.' },
    { id: 'H-06', titel: 'Elementen, kwaliteiten en halfronden', inhoud: 'data',
      uitleg: 'Wat de balans zegt over temperament, met vijf praktische oefeningen voor het zwakste element.',
      tekst: 'Interpreteer de balans van elementen en kwaliteiten en de halfronden (± 400 woorden).\n' +
        'Wat betekent het sterkste element voor temperament en energie? Hoe uit het zwakste\n' +
        'of ontbrekende element zich en hoe kan de persoon het bewust ontwikkelen\n' +
        '(geef 5 concrete, praktische oefeningen)? Wat zegt de verdeling over halfronden\n' +
        'over de levensoriëntatie?' },
    { id: 'H-07', titel: 'Levensopdracht (knopen en Saturnus)', inhoud: 'data',
      uitleg: 'De knopenas en Saturnus als ontwikkelingsweg, met zes gedragsvoorbeelden.',
      tekst: 'Analyseer de as Noordknoop–Zuidknoop (teken en huis), de heersers van beide knopen,\n' +
        'aspecten op de knopen, en Saturnus (teken, huis, aspecten).\n' +
        'Beschrijf: wat de persoon van nature meebrengt (Zuidknoop), waar de groei ligt\n' +
        '(Noordknoop), welke levenslessen Saturnus aangeeft, en hoe deze drie samen een\n' +
        'ontwikkelingsweg vormen. Sluit af met een tabel | Van (Zuidknoop) | Naar (Noordknoop) |\n' +
        'met 6 concrete gedragsvoorbeelden.' },
    { id: 'H-08', titel: 'Transits en de komende periode', inhoud: 'transits',
      uitleg: 'Per lopende transit het thema, de kans, de uitdaging en een reflectievraag. Gebruikt de transits van vandaag.',
      tekst: 'Hieronder staan de natale gegevens en de transits voor {DATUM}.\n' +
        'Leg per transit uit: welk natale thema wordt geactiveerd, wat het kan vragen,\n' +
        'en hoe je er constructief mee omgaat. Prioriteer: Pluto, Neptunus, Uranus, Saturnus\n' +
        'eerst. Lever een tabel | Transit | Thema | Kans | Uitdaging | Reflectievraag |.\n' +
        'Geen voorspellingen van concrete gebeurtenissen; beschrijf thema\'s en mogelijkheden.' },
    { id: 'H-09', titel: 'Huis voor huis', inhoud: 'data',
      uitleg: 'Alle twaalf huizen in een vaste structuur. Vraagt een geboortetijd.',
      tekst: 'Bespreek alle twaalf huizen in een vaste structuur per huis:\n' +
        '**Huis [n] — [levensgebied]**: cusp-teken (stijl), bewoners (energie), heerser en waar\n' +
        'die staat (waar het naartoe stroomt), samenvatting in één zin.\n' +
        'Lege huizen kort (2 zinnen), volle huizen uitgebreid (5–8 zinnen).' },
    { id: 'H-10', titel: 'Kind of leerling', inhoud: 'data',
      uitleg: 'Pedagogisch perspectief: leerstijl, emotionele behoeften en tips voor ouders en leerkrachten.',
      tekst: 'Je bent onderwijskundige met kennis van astrologie als reflectie-instrument.\n' +
        'Beschrijf op basis van de horoscoop van een kind van {LEEFTIJD}: mogelijke\n' +
        'leerstijl (Mercurius, huis 3 en 9), emotionele behoeften (Maan, huis 4), wat het\n' +
        'kind helpt om zich veilig te voelen, hoe het kind energie opdoet en verliest,\n' +
        'en tips voor ouders of leerkrachten. Gebruik dit uitsluitend als inspiratie voor\n' +
        'observatie en gesprek; observatie in de praktijk gaat altijd voor.' },
    { id: 'H-11', titel: 'Twee horoscopen vergelijken (synastrie)', inhoud: 'tweeen',
      uitleg: 'Jouw horoscoop naast die van een relatie uit je lijst bij Match.',
      tekst: 'Hieronder staan de gegevens van twee horoscopen (A en B), beide berekend door LUNA.\n' +
        'Bereken zelf GEEN nieuwe posities. Vergelijk:\n' +
        '1. Elementen- en kwaliteitenbalans naast elkaar (tabel) en hoe ze elkaar aanvullen\n' +
        '2. Zon, Maan, Venus, Mars en Ascendant van A naast die van B (tabel)\n' +
        '3. Overeenkomsten in tekens en elementen\n' +
        '4. Belangrijkste aandachtspunten in de samenwerking of relatie\n' +
        '5. Vijf tips voor goede communicatie tussen A en B\n' +
        'Let op: exacte onderlinge aspecten kun je alleen noemen als de gradentallen dat\n' +
        'aantoonbaar laten zien (verschil berekenen uit de gegeven posities).' },
    { id: 'H-12', titel: 'Kwaliteitscontrole van een analyse', inhoud: 'controle',
      uitleg: 'Controleert een bestaande analyse tegen de gegevens. Plak zelf de analyse achter de prompt.',
      tekst: 'Controleer onderstaande horoscoopanalyse tegen de gegevens:\n' +
        '1. Staan er posities, huizen of aspecten in die niet in de data voorkomen? (tabel)\n' +
        '2. Worden aspecten met een grote orbis te zwaar gewogen?\n' +
        '3. Worden generatie-aspecten (Uranus/Neptunus/Pluto onderling) te persoonlijk geduid?\n' +
        '4. Zijn er fatalistische, medische of financiële uitspraken die eruit moeten?\n' +
        '5. Is de tekst een samenhangend verhaal of een opsomming?\n' +
        'Lever een lijst met verbeteringen en daarna de gecorrigeerde tekst.' },
    { id: 'H-13', titel: 'Rapport opmaken als PDF', inhoud: 'opmaak',
      uitleg: 'Zet een analyse om in Pandoc-Markdown voor een verzorgd PDF-rapport. Plak zelf de analyse erachter.',
      tekst: 'Zet onderstaande horoscoopanalyse om in Pandoc-Markdown volgens de rapporttemplate:\n' +
        'YAML-blok bovenaan, elk hoofdstuk begint met een\n' +
        '::: kern-kader met de kernboodschap, tabellen met bijschrift, geen emoji\'s.\n' +
        'Voeg het horoscoopwiel in met ![Horoscoopwiel](wiel.png){width=85%}.\n' +
        'Lever alleen het Markdown-codeblok.' }
  ];

  function blok(label, data) {
    return label + ': """\n' + (typeof data === 'string' ? data : JSON.stringify(data, null, 1)) + '\n"""';
  }

  /* ctx: { natal, an, profiel, transits: [tekst], partner: {natal, an, profiel} | null, datum, leeftijd } */
  function bouw(id, ctx) {
    if (id === 'H-00') return AN.prompt(ctx.natal, ctx.an, ctx.profiel);
    var p = LIJST.filter(function (x) { return x.id === id; })[0];
    if (!p) return '';
    var tekst = p.tekst.replace('{DATUM}', ctx.datum).replace('{LEEFTIJD}', ctx.leeftijd);
    var mijn = AN.gegevens(ctx.natal, ctx.an, ctx.profiel);

    if (p.inhoud === 'data') return tekst + '\nDATA:\n```json\n' + JSON.stringify(mijn, null, 1) + '\n```\n';
    if (p.inhoud === 'transits') {
      mijn.transits = ctx.transits;
      return tekst + '\nDATA:\n```json\n' + JSON.stringify(mijn, null, 1) + '\n```\n';
    }
    if (p.inhoud === 'tweeen') {
      var b = ctx.partner ? AN.gegevens(ctx.partner.natal, ctx.partner.an, ctx.partner.profiel) : '[kies eerst een relatie bij Match]';
      return tekst + '\n' + blok('DATA A', mijn) + '\n' + blok('DATA B', b) + '\n';
    }
    // controle en opmaak: de gebruiker plakt de tekst zelf
    return tekst + '\nANALYSE: """\n[plak hier de analyse]\n"""\n' +
      (p.inhoud === 'controle' ? blok('DATA', mijn) + '\n' : '');
  }

  global.LunaPrompts = { LIJST: LIJST, bouw: bouw };
})(typeof window !== 'undefined' ? window : globalThis);
