/* LUNA - duidingsmotor: zet berekende posities om in leesbare tekst en scores.
   Alles is deterministisch: dezelfde horoscoop op dezelfde dag geeft altijd
   hetzelfde resultaat. Er wordt niets verzonnen dat niet uit de stand volgt. */
(function (global) {
  'use strict';
  var C = global.LunaContent, A = global.LunaAstro;

  /* Extra kleur per planeet en element, zodat samengestelde teksten niet
     als invuloefening lezen. */
  var NUANCE = {
    mercurius: { vuur: 'Je denkt in vonken: snel, stellig, soms voordat de zin af is.',
                 aarde: 'Je denkt in stappen en gelooft pas iets als je het kunt gebruiken.',
                 lucht: 'Je denkt in verbanden en hebt gesprek nodig om helder te worden.',
                 water: 'Je denkt in beelden en stemmingen; feiten volgen later.' },
    venus:     { vuur: 'Je valt op durf en vuur, en verveelt je bij lauwheid.',
                 aarde: 'Je hecht langzaam, en dan met huid en haar aan het gewone leven.',
                 lucht: 'Je valt op een goed gesprek; aantrekking begint bij je oren.',
                 water: 'Je hecht diep en zonder terugweg, en voelt kleine verschuivingen meteen.' },
    mars:      { vuur: 'Je zet door met open vizier en gaat recht op de zaak af.',
                 aarde: 'Je zet door met uithoudingsvermogen in plaats van met kracht.',
                 lucht: 'Je vecht met argumenten en wint gesprekken die je niet had willen voeren.',
                 water: 'Je gaat indirect te werk en bent het sterkst als het persoonlijk wordt.' },
    jupiter:   { vuur: 'Je groeit door te durven, en gaat af en toe royaal te ver.',
                 aarde: 'Je groeit door te bouwen; vertrouwen komt bij jou uit resultaat.',
                 lucht: 'Je groeit door te leren en mensen aan elkaar te knopen.',
                 water: 'Je groeit door mee te leven; je vertrouwen komt van binnenuit.' },
    saturnus:  { vuur: 'Je moet leren doorzetten zonder meteen resultaat te zien.',
                 aarde: 'Je bouwt aan iets duurzaams en bent streng voor jezelf onderweg.',
                 lucht: 'Je moet leren je gedachten en woorden serieus te nemen.',
                 water: 'Je moet leren je gevoel toe te laten in plaats van te beheersen.' },
    uranus:    { vuur: 'Vernieuwing komt bij jou met een schok en een sprong.',
                 aarde: 'Je breekt met vormen die vastgeroest zijn, langzaam maar onherroepelijk.',
                 lucht: 'Je denkt structureel anders en weet dat zelf allang.',
                 water: 'Je gevoelsleven volgt eigen regels en verrast ook jou.' },
    neptunus:  { vuur: 'Je verlangen naar betekenis kleurt alles wat je onderneemt.',
                 aarde: 'Je zoekt het onzichtbare in het heel gewone en concrete.',
                 lucht: 'Je ideeen hebben een dromerige rand die anderen aantrekt.',
                 water: 'De grens tussen jou en de wereld is hier op zijn dunst.' },
    pluto:     { vuur: 'Verandering komt bij jou met kracht en laat weinig heel.',
                 aarde: 'Je verandert traag en grondig, tot op het fundament.',
                 lucht: 'Je overtuigingen gaan door de wringer en komen er anders uit.',
                 water: 'Je gaat het diepe in en komt eruit met iets wat je niet zocht.' },
    knoop:     { vuur: 'Je groeirichting vraagt om durven en initiatief nemen.',
                 aarde: 'Je groeirichting vraagt om aarden en volhouden.',
                 lucht: 'Je groeirichting vraagt om contact en uitwisseling.',
                 water: 'Je groeirichting vraagt om voelen en toelaten.' },
    mc:        { vuur: 'In de wereld wil je zichtbaar zijn als iemand die durft.',
                 aarde: 'In de wereld wil je bekendstaan als iemand op wie je kunt bouwen.',
                 lucht: 'In de wereld wil je gehoord worden om je ideeen.',
                 water: 'In de wereld wil je iets betekenen voor mensen.' }
  };

  function teken(i) { return C.TEKENS[((i % 12) + 12) % 12]; }
  function tekenNaam(i) { return teken(i).naam; }

  function graadTekst(lon, kort) {
    var t = Math.floor(A.norm360(lon) / 30);
    var rest = A.norm360(lon) % 30;
    var g = Math.floor(rest);
    var m = Math.round((rest - g) * 60);
    if (m === 60) { m = 0; g += 1; }
    if (kort) return g + '° ' + teken(t).naam;
    return g + '°' + (m < 10 ? '0' : '') + m + '′ ' + teken(t).naam;
  }

  function planeetNaam(k) { return (C.PLANETEN[k] || { naam: k }).naam; }

  /* Duiding van een planeet in een teken. Zon, maan en ascendant hebben eigen
     uitgeschreven teksten; de rest wordt opgebouwd uit planeetthema, tekenstijl
     en de nuance per element. */
  function planeetInTeken(planeet, tekenIdx) {
    var t = teken(tekenIdx);
    var p = C.PLANETEN[planeet];
    var titel = p.naam + ' in ' + t.naam;

    if (planeet === 'zon') {
      var z = C.ZON_IN_TEKEN[tekenIdx];
      return { titel: titel, kern: z.kern, tekst: z.tekst,
               kracht: z.kracht, valkuil: z.valkuil, thema: p.thema };
    }
    if (planeet === 'maan') {
      var m = C.MAAN_IN_TEKEN[tekenIdx];
      return { titel: titel, kern: m.citaat, tekst: m.tekst,
               detail: m, thema: p.thema };
    }
    if (planeet === 'asc') {
      return { titel: 'Ascendant in ' + t.naam, kern: t.kern,
               tekst: C.ASC_IN_TEKEN[tekenIdx], thema: p.thema };
    }

    var nuance = (NUANCE[planeet] || {})[t.element] || '';
    return {
      titel: titel,
      kern: p.domein.charAt(0).toUpperCase() + p.domein.slice(1) + '.',
      tekst: p.naam + ' gaat over ' + p.domein + '. In ' + t.naam +
             ' gebeurt dat ' + t.stijl + '. ' + nuance,
      thema: p.thema
    };
  }

  function planeetInHuis(planeet, huisNr) {
    var h = C.HUIZEN[huisNr - 1];
    var p = C.PLANETEN[planeet];
    return p.naam + ' staat in het ' + h.naam + ': ' + h.thema.toLowerCase() +
           '. ' + h.tekst;
  }

  /* Duiding van een aspect tussen twee punten in dezelfde horoscoop. */
  function aspectTekst(a, b, type) {
    var pa = C.PLANETEN[a], pb = C.PLANETEN[b], asp = C.ASPECTEN[type];
    var titel = pa.naam + ' ' + asp.naam + ' ' + pb.naam;
    var basis;
    if (asp.aard === 'harmonisch') {
      basis = 'Wat ' + pa.naam.toLowerCase() + ' wil (' + pa.thema + ') en wat ' +
              pb.naam.toLowerCase() + ' wil (' + pb.thema + ') werken samen. ';
    } else if (asp.aard === 'spanning') {
      basis = 'Wat ' + pa.naam.toLowerCase() + ' wil (' + pa.thema + ') botst met wat ' +
              pb.naam.toLowerCase() + ' wil (' + pb.thema + '). ';
    } else {
      basis = pa.thema.charAt(0).toUpperCase() + pa.thema.slice(1) + ' en ' + pb.thema +
              ' zijn bij jou niet los te koppelen. ';
    }
    return { titel: titel, aard: asp.aard, tekst: basis + asp.tekst };
  }

  /* Duiding van een lopende planeet die een punt in de geboortehoroscoop raakt. */
  function transitTekst(tr) {
    var pt = C.PLANETEN[tr.transit], pn = C.PLANETEN[tr.natal];
    var asp = C.ASPECTEN[tr.type];
    var terugkeer = tr.transit === tr.natal && tr.type === 'conjunctie';
    var titel = terugkeer ? pt.naam + 'terugkeer' : pt.naam + ' ' + asp.naam + ' ' + pn.naam;
    var duur = transitDuur(tr.transit);
    var richting = tr.aanlopend ? 'Het aspect wordt nog exacter.' : 'Het aspect loopt uit.';
    var kern;
    if (asp.aard === 'harmonisch') {
      kern = pt.naam + ' geeft ruimte aan ' + pn.domein +
             '. De opening is er; je moet er zelf iets mee doen.';
    } else if (asp.aard === 'spanning') {
      kern = pt.naam + ' zet druk op ' + pn.domein +
             '. Dat schuurt, en precies daar zit de beweging.';
    } else if (terugkeer) {
      kern = pt.naam + ' staat weer precies waar zij bij je geboorte stond. ' +
             'Een cyclus rond ' + pt.thema + ' begint opnieuw.';
    } else {
      kern = pt.naam + ' valt samen met ' + pn.domein +
             '. Dit thema staat vandaag scherp aan.';
    }
    return {
      titel: titel, aard: asp.aard, tekst: kern + ' ' + richting,
      duur: duur, sterkte: tr.sterkte, orb: tr.orb,
      invloed: tr.sterkte > 0.72 ? 'Sterke invloed'
             : tr.sterkte > 0.4 ? 'Gemiddelde invloed' : 'Lichte invloed'
    };
  }

  var TRANSIT_DUUR = {
    maan: 'enkele uren', zon: 'ongeveer twee dagen', mercurius: 'een paar dagen',
    venus: 'een paar dagen', mars: 'ongeveer een week', jupiter: 'enkele weken',
    saturnus: 'enkele maanden', uranus: 'maanden tot een jaar',
    neptunus: 'maanden tot een jaar', pluto: 'een jaar of langer'
  };
  function transitDuur(p) { return TRANSIT_DUUR[p] || ''; }

  /* ---------- scores ---------- */

  /* Hoe zwaar telt een lopende planeet mee? Trage planeten hebben meer gewicht,
     de maan het minst omdat ze binnen een dag weer weg is. */
  var GEWICHT_TRANSIT = { maan: 0.5, zon: 1.2, mercurius: 0.7, venus: 0.9, mars: 1.0,
                          jupiter: 1.3, saturnus: 1.4, uranus: 1.2, neptunus: 1.1, pluto: 1.4 };
  var GEWICHT_NATAAL = { zon: 1.4, maan: 1.3, asc: 1.2, mc: 1.0, mercurius: 0.8,
                         venus: 0.9, mars: 0.9, jupiter: 0.8, saturnus: 0.8,
                         uranus: 0.6, neptunus: 0.6, pluto: 0.6, knoop: 0.4 };
  /* Bij een conjunctie hangt de kleur af van de planeet zelf. */
  var AARD_CONJUNCTIE = { venus: 1, jupiter: 1, zon: 0.5, maan: 0.3, mercurius: 0.2,
                          uranus: -0.2, neptunus: -0.2, mars: -0.6, saturnus: -0.8, pluto: -0.6 };

  var DOMEINEN = {
    liefde:   { transit: ['venus', 'maan', 'neptunus', 'jupiter'], nataal: ['venus', 'maan', 'asc'] },
    carriere: { transit: ['saturnus', 'jupiter', 'mars', 'zon'],   nataal: ['mc', 'zon', 'saturnus'] },
    energie:  { transit: ['mars', 'zon', 'jupiter'],               nataal: ['zon', 'mars', 'asc'] },
    sociaal:  { transit: ['mercurius', 'venus', 'jupiter', 'maan'], nataal: ['mercurius', 'venus', 'asc'] },
    groei:    { transit: ['jupiter', 'uranus', 'pluto', 'saturnus'], nataal: ['zon', 'maan', 'mc', 'knoop'] }
  };

  function aspectWaarde(tr) {
    var asp = C.ASPECTEN[tr.type];
    var richting = asp.aard === 'harmonisch' ? 1 : asp.aard === 'spanning' ? -1
                 : (AARD_CONJUNCTIE[tr.transit] || 0);
    return richting * tr.sterkte *
           (GEWICHT_TRANSIT[tr.transit] || 0.5) * (GEWICHT_NATAAL[tr.natal] || 0.5);
  }

  function naarProcent(som, schaal) {
    return Math.round(50 + 50 * Math.tanh(som / (schaal || 2.2)));
  }

  function scores(transits) {
    var uit = {};
    Object.keys(DOMEINEN).forEach(function (d) {
      var def = DOMEINEN[d], som = 0;
      transits.forEach(function (tr) {
        if (def.transit.indexOf(tr.transit) < 0) return;
        if (def.nataal.indexOf(tr.natal) < 0) return;
        som += aspectWaarde(tr);
      });
      uit[d] = naarProcent(som, 1.6);
    });
    var totaal = 0;
    transits.forEach(function (tr) { totaal += aspectWaarde(tr); });
    uit.afstemming = naarProcent(totaal, 3.2);
    return uit;
  }

  /* ---------- dagelijks inzicht ---------- */

  function hashDatum(datum, extra) {
    var s = datum.toISOString().slice(0, 10) + '|' + (extra || '');
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
    return h;
  }

  function dagInzicht(natal, jd, datum) {
    var trs = A.transits(natal, jd).filter(function (t) { return t.sterkte > 0.15; });
    var fase = A.moonPhase(jd);
    var maanTeken = teken(fase.maanTeken);
    var sc = scores(trs);

    var top = trs.filter(function (t) { return t.transit !== 'maan'; })[0] || trs[0];
    var topTekst = top ? transitTekst(top) : null;

    var thema;
    if (topTekst && topTekst.aard === 'spanning') thema = 'Wrijving die iets losmaakt';
    else if (topTekst && topTekst.aard === 'harmonisch') thema = 'Een open deur';
    else thema = 'Een thema dat scherp aanstaat';

    var kop = fase.wassend
      ? 'De maan wast aan in ' + maanTeken.naam + '.'
      : 'De maan neemt af in ' + maanTeken.naam + '.';

    var basis = kop + ' ' + C.MAANFASEN[fase.index].tekst;
    if (topTekst) basis += ' Daarbovenop: ' + topTekst.titel.toLowerCase() + '. ' + topTekst.tekst;

    return {
      datum: datum,
      fase: fase,
      maanTeken: maanTeken,
      thema: thema,
      titel: C.MAANFASEN[fase.index].kern,
      tekst: basis,
      advies: C.ADVIEZEN[hashDatum(datum, natal.punten.zon.lon.toFixed(2)) % C.ADVIEZEN.length],
      scores: sc,
      transits: trs,
      topTransit: topTekst
    };
  }

  /* Korte zin voor het dashboard: waar gaat het vandaag om? */
  function energieZin(inzicht) {
    var m = inzicht.maanTeken;
    return 'De maan staat in ' + m.naam + '. ' + m.kern + ' ' +
           (inzicht.topTransit ? inzicht.topTransit.tekst : C.MAANFASEN[inzicht.fase.index].tekst);
  }

  /* ---------- compatibiliteit ---------- */

  var ELEMENT_KLIK = {
    'vuur|vuur': 'Twee keer vuur: veel warmte, veel tempo, en niemand die remt.',
    'vuur|aarde': 'Vuur en aarde: de een wil vooruit, de ander wil zekerheid. Dat werkt zodra je elkaars tempo respecteert.',
    'vuur|lucht': 'Vuur en lucht voeden elkaar. Ideeen worden plannen en plannen worden avonturen.',
    'vuur|water': 'Vuur en water vragen om vertaling. Directheid ontmoet gevoeligheid; beide kunnen zich onbegrepen voelen.',
    'aarde|aarde': 'Twee keer aarde: rustig, betrouwbaar, en soms te veel van hetzelfde.',
    'aarde|lucht': 'Aarde en lucht: de een wil het concreet, de ander wil het bespreken. Uitleg is hier het bindmiddel.',
    'aarde|water': 'Aarde en water horen bij elkaar. Zorg krijgt vorm, gevoel krijgt een bedding.',
    'lucht|lucht': 'Twee keer lucht: eindeloos goed gesprek, en soms te weinig gevoel op tafel.',
    'lucht|water': 'Lucht en water: denken ontmoet voelen. Verhelderend, mits geen van beiden de ander wegwuift.',
    'water|water': 'Twee keer water: een intuitief begrip zonder woorden, en het risico dat niemand iets uitspreekt.'
  };

  function elementKlik(e1, e2) {
    return ELEMENT_KLIK[e1 + '|' + e2] || ELEMENT_KLIK[e2 + '|' + e1] || '';
  }

  var PAAR_LIEFDE = ['venus|venus', 'venus|maan', 'maan|maan', 'venus|mars', 'mars|maan', 'venus|asc', 'maan|asc'];
  var PAAR_PRAAT = ['mercurius|mercurius', 'mercurius|maan', 'mercurius|zon', 'mercurius|asc', 'mercurius|jupiter'];
  var PAAR_TREK = ['mars|venus', 'mars|asc', 'pluto|venus', 'zon|maan', 'zon|asc', 'mars|zon', 'pluto|maan'];

  function paarIn(lijst, a, b) {
    return lijst.indexOf(a + '|' + b) >= 0 || lijst.indexOf(b + '|' + a) >= 0;
  }

  function compatibiliteit(chartA, chartB) {
    var syn = A.synastry(chartA, chartB);
    var tekenA = teken(chartA.punten.zon.teken), tekenB = teken(chartB.punten.zon.teken);

    function domein(lijst, schaal) {
      var som = 0, tel = 0;
      syn.forEach(function (s) {
        if (!paarIn(lijst, s.a, s.b)) return;
        var asp = C.ASPECTEN[s.type];
        var r = asp.aard === 'harmonisch' ? 1 : asp.aard === 'spanning' ? -0.6 : 0.8;
        som += r * s.sterkte;
        tel++;
      });
      if (!tel) return 50;
      return Math.round(50 + 50 * Math.tanh(som / (schaal || 1.4)));
    }

    var emotioneel = domein(PAAR_LIEFDE, 1.6);
    var communicatie = domein(PAAR_PRAAT, 1.1);
    var aantrekking = domein(PAAR_TREK, 1.5);

    // Elementen die bij elkaar passen tellen mee in het totaal.
    var elementBonus = 0;
    var e1 = tekenA.element, e2 = tekenB.element;
    if (e1 === e2) elementBonus = 6;
    else if ((e1 === 'vuur' && e2 === 'lucht') || (e1 === 'lucht' && e2 === 'vuur') ||
             (e1 === 'aarde' && e2 === 'water') || (e1 === 'water' && e2 === 'aarde')) elementBonus = 8;
    else elementBonus = -4;

    var totaal = Math.max(5, Math.min(99,
      Math.round((emotioneel * 0.4 + communicatie * 0.25 + aantrekking * 0.35) + elementBonus)));

    var sterkste = syn.filter(function (s) {
      return C.ASPECTEN[s.type].aard !== 'spanning' && s.sterkte > 0.4;
    }).slice(0, 3);
    var spanning = syn.filter(function (s) {
      return C.ASPECTEN[s.type].aard === 'spanning' && s.sterkte > 0.4;
    }).slice(0, 3);

    function beschrijf(lijst, kop) {
      if (!lijst.length) return kop + ' zijn er geen opvallende aspecten tussen jullie horoscopen; de klik zit dan meer in de elementen dan in de details.';
      return lijst.map(function (s) {
        var pa = C.PLANETEN[s.a], pb = C.PLANETEN[s.b];
        return pa.naam + ' ' + C.ASPECTEN[s.type].naam + ' ' + pb.naam + ' (' +
               pa.thema + ' tegenover ' + pb.thema + ')';
      }).join(', ') + '.';
    }

    var samenvatting;
    if (totaal >= 80) samenvatting = 'Diepe, vanzelfsprekende verbinding';
    else if (totaal >= 65) samenvatting = 'Sterke klik met werk aan de winkel';
    else if (totaal >= 50) samenvatting = 'Werkbaar, mits jullie praten';
    else if (totaal >= 35) samenvatting = 'Boeiend maar wrijvend';
    else samenvatting = 'Twee heel verschillende talen';

    return {
      totaal: totaal, emotioneel: emotioneel, communicatie: communicatie,
      aantrekking: aantrekking, samenvatting: samenvatting,
      elementTekst: elementKlik(e1, e2),
      waarom: 'Wat jullie bindt: ' + beschrijf(sterkste, 'Op het vlak van klik'),
      spanning: 'Waar het schuurt: ' + beschrijf(spanning, 'Qua wrijving'),
      aspecten: syn.slice(0, 12)
    };
  }

  /* ---------- hemel van vandaag ---------- */

  function hemelNu(jd) {
    var pos = A.positions(jd);
    var items = [];

    var fase = A.moonPhase(jd);
    var volle = A.nextPhaseJD(jd, 180), nieuwe = A.nextPhaseJD(jd, 0);
    if (volle) items.push({
      icoon: 'moon-full', label: 'Volle maan',
      titel: 'Volle Maan in ' + tekenNaam(Math.floor(A.moonPosition(volle).lon / 30)),
      datum: A.dateFromJD(volle),
      tekst: C.MAANFASEN[4].tekst
    });
    if (nieuwe) items.push({
      icoon: 'moon', label: 'Nieuwe maan',
      titel: 'Nieuwe Maan in ' + tekenNaam(Math.floor(A.moonPosition(nieuwe).lon / 30)),
      datum: A.dateFromJD(nieuwe),
      tekst: C.MAANFASEN[0].tekst
    });

    ['mercurius', 'venus', 'mars', 'jupiter', 'saturnus', 'uranus', 'neptunus', 'pluto']
      .forEach(function (p) {
        if (pos[p].retrograde) items.push({
          icoon: 'refresh', label: 'Retrograde',
          titel: C.PLANETEN[p].naam + ' retrograde in ' + tekenNaam(pos[p].teken),
          tekst: C.RETROGRADE[p]
        });
      });

    ['zon', 'mercurius', 'venus', 'mars'].forEach(function (p) {
      var w = A.nextSignChange(p, jd, p === 'zon' ? 35 : 60);
      if (w) items.push({
        icoon: 'compass', label: 'Tekenwissel',
        titel: C.PLANETEN[p].naam + ' gaat naar ' + tekenNaam(w.teken),
        datum: A.dateFromJD(w.jd),
        tekst: C.PLANETEN[p].naam + ' verlaat ' + tekenNaam(pos[p].teken) + '. ' +
               'Het thema ' + C.PLANETEN[p].thema + ' krijgt de kleur van ' +
               tekenNaam(w.teken) + ': ' + teken(w.teken).stijl + '.'
      });
    });

    return { fase: fase, posities: pos, items: items };
  }

  global.LunaDuiding = {
    teken: teken, tekenNaam: tekenNaam, graadTekst: graadTekst, planeetNaam: planeetNaam,
    planeetInTeken: planeetInTeken, planeetInHuis: planeetInHuis,
    aspectTekst: aspectTekst, transitTekst: transitTekst, transitDuur: transitDuur,
    scores: scores, dagInzicht: dagInzicht, energieZin: energieZin,
    compatibiliteit: compatibiliteit, elementKlik: elementKlik, hemelNu: hemelNu,
    hashDatum: hashDatum
  };
})(typeof window !== 'undefined' ? window : globalThis);
