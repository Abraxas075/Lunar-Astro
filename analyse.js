/* LUNA - verdiepende analyse van een geboortehoroscoop.

   Rekent de samenhang uit die losse planeetstanden niet laten zien: balans van
   elementen en kwaliteiten, halfronden, dominante planeten, aspectpatronen
   (stellium, grote driehoek, T-vierkant), waardigheden en huisheersers.
   Daarnaast een Markdown-rapport en een kant-en-klare prompt voor een
   taalmodel. De methode volgt de Horoscoop-analyse Toolkit. */
(function (global) {
  'use strict';

  var A = global.LunaAstro, C = global.LunaContent;

  var KERN = ['zon', 'maan', 'mercurius', 'venus', 'mars', 'jupiter', 'saturnus'];
  var BUITEN = ['uranus', 'neptunus', 'pluto'];
  var TIEN = KERN.concat(BUITEN);
  var GEWICHT = { zon: 2, maan: 2, mercurius: 1, venus: 1, mars: 1, jupiter: 1, saturnus: 1,
                  uranus: 0.5, neptunus: 0.5, pluto: 0.5 };

  var ELEMENTEN = ['vuur', 'aarde', 'lucht', 'water'];
  var KWALITEITEN = ['hoofd', 'vast', 'beweeglijk'];

  /* Indexen van de tekens: 0 Ram ... 11 Vissen. */
  var DOMICILIE = {
    zon: [4], maan: [3], mercurius: [2, 5], venus: [1, 6], mars: [0, 7],
    jupiter: [8, 11], saturnus: [9, 10], uranus: [10], neptunus: [11], pluto: [7]
  };
  var EXALTATIE = { zon: 0, maan: 1, mercurius: 5, venus: 11, mars: 9, jupiter: 3, saturnus: 6 };

  var FASEN = [
    ['Nieuwe maan', 'instinctief, nieuw begin, leeft vanuit intuïtie'],
    ['Wassende sikkel', 'doorzettend, wil zich losmaken van het oude'],
    ['Eerste kwartier', 'daadkrachtig, bouwt op door crises heen'],
    ['Wassende maan', 'perfectionistisch, analyseert en verfijnt'],
    ['Volle maan', 'relationeel, bewust, zoekt balans tussen tegenpolen'],
    ['Afnemende maan', 'deelt kennis, wil anderen inspireren'],
    ['Laatste kwartier', 'herwaarderend, durft los te laten en te heroriënteren'],
    ['Balsamische maan', 'afrondend, visionair, gericht op de toekomst']
  ];

  var HUIS_DOMEIN = [
    'zelfbeeld, uiterlijk en hoe je het leven tegemoet treedt',
    'geld, bezit, eigenwaarde en talenten',
    'communicatie, leren, broers/zussen en directe omgeving',
    'thuis, familie, roots en innerlijke basis',
    'creativiteit, plezier, romantiek en kinderen',
    'werk, dagelijkse routines, gezondheid en dienstbaarheid',
    'partnerschap, samenwerking en open tegenstanders',
    'intimiteit, gedeelde middelen, crises en transformatie',
    'levensvisie, studie, reizen en geloof',
    'carrière, status, publiek imago en roeping',
    'vriendschap, groepen, netwerken en toekomstidealen',
    'het onbewuste, terugtrekking, spiritualiteit en verborgen zaken'
  ];

  var ASPECT_BETEKENIS = {
    conjunctie: 'versmelten en versterken elkaar',
    sextiel: 'bieden kansen die je actief kunt benutten',
    vierkant: 'botsen en dwingen tot actie en groei',
    driehoek: 'stromen moeiteloos samen (natuurlijk talent)',
    oppositie: 'staan tegenover elkaar en vragen om balans'
  };

  var PLANEET_FUNCTIE = {
    zon: 'je kernidentiteit, levenskracht en wil',
    maan: 'je emoties, behoeften en gevoel van veiligheid',
    mercurius: 'je denken, leren en communiceren',
    venus: 'je manier van liefhebben, waarderen en genieten',
    mars: 'je daadkracht, drive en manier van opkomen voor jezelf',
    jupiter: 'je groei, vertrouwen en zoektocht naar zingeving',
    saturnus: 'je verantwoordelijkheid, grenzen en levenslessen',
    uranus: 'je drang naar vrijheid, vernieuwing en eigenheid',
    neptunus: 'je verbeelding, idealen en spirituele gevoeligheid',
    pluto: 'je transformatiekracht, diepgang en omgang met macht',
    knoop: 'je groeirichting en levensopdracht',
    asc: 'je eerste indruk, uitstraling en levensbenadering',
    mc: 'je roeping, maatschappelijke rol en ambitie'
  };

  function naamVan(k) {
    if (k === 'asc') return 'Ascendant';
    if (k === 'mc') return 'MC';
    return C.PLANETEN[k] ? C.PLANETEN[k].naam : k;
  }
  function tekenVan(i) { return C.TEKENS[i]; }
  function nl(x, n) { return x.toFixed(n == null ? 1 : n).replace('.', ','); }

  /* ---------- waardigheid ---------- */

  function waardigheid(planeet, teken) {
    var dom = DOMICILIE[planeet];
    if (dom && dom.indexOf(teken) >= 0) return { soort: 'domicilie', label: 'Domicilie (thuis)' };
    if (EXALTATIE[planeet] === teken) return { soort: 'exaltatie', label: 'Exaltatie (verheven)' };
    if (dom && dom.some(function (t) { return (t + 6) % 12 === teken; }))
      return { soort: 'detriment', label: 'Detriment (uit balans)' };
    if (EXALTATIE[planeet] != null && (EXALTATIE[planeet] + 6) % 12 === teken)
      return { soort: 'val', label: 'Val (verzwakt)' };
    return null;
  }

  /* ---------- hoofdberekening ---------- */

  function analyseer(chart) {
    var p = chart.punten;
    var tijd = !!(chart.huizen && p.asc);
    var uit = { tijdBekend: tijd };

    // Balans van elementen en kwaliteiten
    var el = {}, kw = {};
    ELEMENTEN.forEach(function (e) { el[e] = 0; });
    KWALITEITEN.forEach(function (k) { kw[k] = 0; });
    function tel(k, gew) {
      var t = tekenVan(p[k].teken);
      el[t.element] += gew; kw[t.kwaliteit] += gew;
    }
    TIEN.forEach(function (k) { if (p[k]) tel(k, GEWICHT[k]); });
    if (tijd) { tel('asc', 2); if (p.mc) tel('mc', 1); }
    uit.elementen = el; uit.kwaliteiten = kw;
    function uiterste(lijst, w, sterk) {
      var best = lijst.reduce(function (m, k) { return sterk ? Math.max(m, w[k]) : Math.min(m, w[k]); }, sterk ? -1 : 1e9);
      return lijst.filter(function (k) { return w[k] === best; }).join(' en ');
    }
    uit.sterkEl = uiterste(ELEMENTEN, el, true);
    uit.zwakEl = uiterste(ELEMENTEN, el, false);
    uit.sterkKw = uiterste(KWALITEITEN, kw, true);

    // Halfronden (alleen met huizen)
    if (tijd) {
      var boven = 0, oost = 0;
      TIEN.forEach(function (k) {
        var h = p[k].huis;
        if (h >= 7) boven++;
        if (h >= 10 || h <= 3) oost++;
      });
      uit.halfronden = { boven: boven, onder: 10 - boven, oost: oost, west: 10 - oost };
    }

    // Waardigheden
    uit.waardigheden = [];
    TIEN.forEach(function (k) {
      var w = waardigheid(k, p[k].teken);
      if (w) uit.waardigheden.push({ punt: k, soort: w.soort, label: w.label });
    });

    // Horoscoopheerser en dominantie
    uit.heerser = tijd ? tekenVan(p.asc.teken).heerser : null;
    var zonHeerser = tekenVan(p.zon.teken).heerser;
    var score = {};
    TIEN.forEach(function (k) { score[k] = 0; });
    TIEN.forEach(function (k) {
      var pk = p[k];
      if (k === uit.heerser) score[k] += 3;
      if (k === zonHeerser) score[k] += 1.5;
      if (pk.huis === 1 || pk.huis === 4 || pk.huis === 7 || pk.huis === 10) score[k] += 2;
      var w = waardigheid(k, pk.teken);
      if (w && (w.soort === 'domicilie' || w.soort === 'exaltatie')) score[k] += 2;
      if (tijd && (Math.abs(A.norm180(pk.lon - p.asc.lon)) <= 8 ||
                   (p.mc && Math.abs(A.norm180(pk.lon - p.mc.lon)) <= 8))) score[k] += 3;
    });
    chart.aspecten.forEach(function (a) {
      [a.a, a.b].forEach(function (k) {
        if (k in score) score[k] += a.aard === 'neutraal' ? 1 : 0.5;
      });
    });
    uit.dominant = TIEN.map(function (k) { return { punt: k, score: score[k] }; })
      .sort(function (a, b) { return b.score - a.score; }).slice(0, 3);

    // Patronen
    uit.patronen = patronen(chart, tijd);

    // Huizen met heersers
    if (tijd) {
      uit.huizen = chart.huizen.map(function (cusp, i) {
        var t = Math.floor(cusp / 30);
        var heer = tekenVan(t).heerser;
        return {
          huis: i + 1, cusp: cusp, teken: t, heerser: heer,
          heerserHuis: p[heer] ? p[heer].huis : null,
          bewoners: TIEN.concat(['knoop']).filter(function (k) { return p[k] && p[k].huis === i + 1; })
        };
      });
    }

    // Maanfase bij de geboorte
    var hoek = A.norm360(p.maan.lon - p.zon.lon);
    var f = FASEN[Math.floor(hoek / 45) % 8];
    uit.maanfase = { naam: f[0], uitleg: f[1], hoek: hoek };

    return uit;
  }

  function patronen(chart, tijd) {
    var p = chart.punten, out = [];
    var asp = chart.aspecten;

    // Stellium: drie of meer planeten (zon t/m pluto) in één teken of huis
    [['teken', function (k) { return p[k].teken; }],
     ['huis', function (k) { return p[k].huis; }]].forEach(function (g) {
      if (g[0] === 'huis' && !tijd) return;
      var telling = {};
      TIEN.forEach(function (k) {
        var w = g[1](k);
        (telling[w] = telling[w] || []).push(k);
      });
      Object.keys(telling).forEach(function (w) {
        if (telling[w].length >= 3) {
          out.push({
            soort: 'stellium', punten: telling[w],
            plaats: g[0] === 'huis' ? 'huis ' + w : tekenVan(+w).naam
          });
        }
      });
    });

    function heeft(a, b, soort) {
      return asp.some(function (x) {
        return x.type === soort && ((x.a === a && x.b === b) || (x.a === b && x.b === a));
      });
    }

    // Groot kruis: twee opposities die elkaar in vier vierkanten snijden
    var kruisGezien = {};
    TIEN.forEach(function (a) { TIEN.forEach(function (b) {
      if (a >= b || !heeft(a, b, 'oppositie')) return;
      TIEN.forEach(function (c) { TIEN.forEach(function (d) {
        if (c >= d || c <= a || !heeft(c, d, 'oppositie')) return;
        if (heeft(a, c, 'vierkant') && heeft(a, d, 'vierkant') && heeft(b, c, 'vierkant') && heeft(b, d, 'vierkant')) {
          var sl = [a, b, c, d].sort().join();
          if (!kruisGezien[sl]) { kruisGezien[sl] = 1; out.push({ soort: 'groot-kruis', punten: [a, b, c, d] }); }
        }
      }); });
    }); });

    // Grote driehoek, vlieger en T-vierkant
    var gezien = {};
    for (var i = 0; i < TIEN.length; i++) {
      for (var j = i + 1; j < TIEN.length; j++) {
        var a = TIEN[i], b = TIEN[j];
        for (var m = j + 1; m < TIEN.length; m++) {
          var c = TIEN[m];
          if (heeft(a, b, 'driehoek') && heeft(b, c, 'driehoek') && heeft(a, c, 'driehoek'))
            out.push({ soort: 'grote-driehoek', punten: [a, b, c] });
          [[a, b, c], [b, a, c], [c, a, b]].forEach(function (t) {
            TIEN.forEach(function (d) {
              if (t.indexOf(d) >= 0 || !(heeft(a, b, 'driehoek') && heeft(b, c, 'driehoek') && heeft(a, c, 'driehoek'))) return;
              if (heeft(t[0], d, 'oppositie') && heeft(t[1], d, 'sextiel') && heeft(t[2], d, 'sextiel'))
                out.push({ soort: 'vlieger', punten: [a, b, c], punt: d });
            });
          });
        }
        if (heeft(a, b, 'oppositie')) {
          TIEN.forEach(function (c2) {
            if (c2 === a || c2 === b) return;
            if (heeft(a, c2, 'vierkant') && heeft(b, c2, 'vierkant')) {
              var sl = [a, b, c2].sort().join();
              if (!gezien[sl]) { gezien[sl] = 1; out.push({ soort: 't-vierkant', punten: [a, b], brandpunt: c2 }); }
            }
          });
        }
      }
    }
    return out;
  }

  function patroonTekst(pt) {
    var n = pt.punten.map(naamVan);
    if (pt.soort === 'stellium') return 'Stellium in ' + pt.plaats + ': ' + n.join(', ');
    if (pt.soort === 'groot-kruis') return 'Groot kruis: ' + n.join(', ');
    if (pt.soort === 'vlieger') return 'Vlieger: grote driehoek ' + n.join(', ') + ', met ' + naamVan(pt.punt) + ' als tegenpool';
    if (pt.soort === 'grote-driehoek') return 'Grote driehoek: ' + n.join(', ');
    return 'T-vierkant: ' + n[0] + ' ☍ ' + n[1] + ', met ' + naamVan(pt.brandpunt) + ' als brandpunt';
  }

  function patroonUitleg(soort) {
    var g = global.LunaGids && global.LunaGids.PATROON[soort];
    return g ? g.betekenis + ' Sleutel: ' + g.sleutel : '';
  }

  /* ---------- Markdown-rapport ---------- */

  function balk(w, max) {
    var n = max ? Math.round(10 * w / max) : 0, s = '';
    for (var i = 0; i < 10; i++) s += i < n ? '█' : '░';
    return s;
  }

  function positieTekst(k, pk) {
    var g = Math.floor(pk.graad), m = Math.round((pk.graad - g) * 60);
    if (m === 60) { g++; m = 0; }
    return (g < 10 ? '0' : '') + g + '°' + (m < 10 ? '0' : '') + m + '′ ' + tekenVan(pk.teken).naam;
  }

  function rapport(chart, an, profiel) {
    var p = chart.punten, tb = an.tijdBekend, r = [];
    var namen = TIEN.concat(['knoop']);
    r.push('# Horoscoopanalyse — ' + profiel.naam + '\n');
    r.push('## Geboortegegevens\n');
    r.push('| Gegeven | Waarde |\n|:--|:--|');
    r.push('| Datum | ' + profiel.datum.slice(0, 10) + (profiel.tijdBekend ? ', ' + profiel.tijd : ', tijd onbekend') + ' |');
    r.push('| Plaats | ' + profiel.plaats.naam + ' |');
    r.push('| Huizensysteem | ' + (chart.eigenHuizen ? 'Eigen cuspen' : 'Hele tekens') + ' |');
    r.push('| Zodiak | Tropisch |\n');
    if (!tb) r.push('> **Let op:** geen geboortetijd. Huizen, ascendant en MC zijn weggelaten; de Maan kan tot ±7° afwijken.\n');

    r.push('## De grote drie\n');
    r.push('| Factor | Positie | Betekenis |\n|:--|:--|:--|');
    r.push('| Zon | ' + positieTekst('zon', p.zon) + (tb ? ' (huis ' + p.zon.huis + ')' : '') +
      ' | Kern: ' + tekenVan(p.zon.teken).stijl + ' |');
    r.push('| Maan | ' + positieTekst('maan', p.maan) + (tb ? ' (huis ' + p.maan.huis + ')' : '') +
      ' | Gevoel: ' + tekenVan(p.maan.teken).stijl + ' |');
    if (tb) {
      r.push('| Ascendant | ' + positieTekst('asc', p.asc) + ' | Uitstraling: ' + tekenVan(p.asc.teken).stijl + ' |');
      if (p[an.heerser]) r.push('| Horoscoopheerser | ' + naamVan(an.heerser) + ' in ' +
        tekenVan(p[an.heerser].teken).naam + ', huis ' + p[an.heerser].huis + ' | Rode draad van de horoscoop |');
    }
    r.push('');

    r.push('## Planeetposities\n');
    r.push('| Punt | Positie |' + (tb ? ' Huis |' : '') + ' Element | Kwaliteit | Waardigheid | R |');
    r.push('|:--|:--|' + (tb ? ':--:|' : '') + ':--|:--|:--|:--:|');
    namen.forEach(function (k) {
      var pk = p[k]; if (!pk) return;
      var t = tekenVan(pk.teken), w = waardigheid(k, pk.teken);
      r.push('| ' + C.PLANETEN[k].symbool + ' ' + naamVan(k) + ' | ' + positieTekst(k, pk) + ' |' +
        (tb ? ' ' + pk.huis + ' |' : '') + ' ' + t.element + ' | ' + t.kwaliteit + ' | ' +
        (w ? w.label : '–') + ' | ' + (pk.retrograde && k !== 'knoop' ? '℞' : '') + ' |');
    });
    if (tb) {
      r.push('| Ascendant | ' + positieTekst('asc', p.asc) + ' | – | – | – | – | |');
      r.push('| MC | ' + positieTekst('mc', p.mc) + ' | – | – | – | – | |');
    }
    r.push('');

    if (tb) {
      r.push('## Huizen en huisheersers\n');
      r.push('| Huis | Cusp | Heerser | Heerser staat in | Bewoners | Levensgebied |');
      r.push('|:--:|:--|:--|:--:|:--|:--|');
      an.huizen.forEach(function (h) {
        r.push('| ' + h.huis + ' | ' + positieTekst('', { graad: h.cusp % 30, teken: h.teken }) + ' | ' +
          naamVan(h.heerser) + ' | ' + (h.heerserHuis || '–') + ' | ' +
          (h.bewoners.map(naamVan).join(', ') || '–') + ' | ' + HUIS_DOMEIN[h.huis - 1] + ' |');
      });
      r.push('');
    }

    r.push('## Balans van elementen en kwaliteiten\n');
    var me = Math.max.apply(null, ELEMENTEN.map(function (e) { return an.elementen[e]; }));
    var mk = Math.max.apply(null, KWALITEITEN.map(function (k) { return an.kwaliteiten[k]; }));
    r.push('| Element | Score | Verdeling |\n|:--|--:|:--|');
    ELEMENTEN.forEach(function (e) { r.push('| ' + e + ' | ' + nl(an.elementen[e]) + ' | `' + balk(an.elementen[e], me) + '` |'); });
    r.push('\n| Kwaliteit | Score | Verdeling |\n|:--|--:|:--|');
    KWALITEITEN.forEach(function (k) { r.push('| ' + k + ' | ' + nl(an.kwaliteiten[k]) + ' | `' + balk(an.kwaliteiten[k], mk) + '` |'); });
    r.push('\nSterkste element: **' + an.sterkEl + '**, zwakste: **' + an.zwakEl + '**. Dominante kwaliteit: **' +
      an.sterkKw + '**. (Weging: Zon, Maan en Ascendant 2; Mercurius t/m Saturnus en MC 1; Uranus, Neptunus, Pluto 0,5.)\n');
    if (an.halfronden) {
      var h = an.halfronden;
      r.push('| Halfrond | Aantal planeten |\n|:--|--:|');
      r.push('| boven (huis 7–12) | ' + h.boven + ' |\n| onder (huis 1–6) | ' + h.onder + ' |');
      r.push('| oost (huis 10–3) | ' + h.oost + ' |\n| west (huis 4–9) | ' + h.west + ' |\n');
    }

    r.push('## Dominante planeten en patronen\n');
    r.push('| Rang | Planeet | Score |\n|:--:|:--|--:|');
    an.dominant.forEach(function (d, i) { r.push('| ' + (i + 1) + ' | ' + naamVan(d.punt) + ' | ' + nl(d.score) + ' |'); });
    r.push('');
    if (an.patronen.length) an.patronen.forEach(function (pt) { r.push('- ' + patroonTekst(pt)); });
    else r.push('- Geen stelliums, grote driehoeken of T-vierkanten gevonden.');
    r.push('\n**Geboortemaanfase:** ' + an.maanfase.naam + ' (' + nl(an.maanfase.hoek) + '° na de Zon) — ' +
      an.maanfase.uitleg + '.\n');

    r.push('## Aspecten\n');
    r.push('| Aspect | Orbis | Aard |\n|:--|--:|:--|');
    chart.aspecten.slice().sort(function (a, b) { return a.orb - b.orb; }).forEach(function (a) {
      r.push('| ' + naamVan(a.a) + ' ' + C.ASPECTEN[a.type].teken + ' ' + naamVan(a.b) + ' (' + a.type + ') | ' +
        nl(a.orb, 2) + '° | ' + a.aard + ' |');
    });
    r.push('\n: Gesorteerd op nauwkeurigheid (kleinste orbis = sterkste werking)\n');

    r.push('## Interpretatiebouwstenen\n');
    r.push('Automatisch samengestelde basiszinnen. Gebruik ze als startpunt.\n');
    TIEN.forEach(function (k) {
      var pk = p[k], t = tekenVan(pk.teken), w = waardigheid(k, pk.teken);
      var zin = '**' + naamVan(k) + ' in ' + t.naam + (tb ? ', huis ' + pk.huis : '') + ':** ' +
        PLANEET_FUNCTIE[k].charAt(0).toUpperCase() + PLANEET_FUNCTIE[k].slice(1) + ' uit zich ' + t.stijl +
        (tb ? ', vooral op het gebied van ' + HUIS_DOMEIN[pk.huis - 1] : '') + '.';
      if (pk.retrograde && k !== 'zon' && k !== 'maan') zin += ' Retrograde: deze energie werkt meer naar binnen en wordt vaak later in het leven bewust.';
      if (w) zin += ' Waardigheid: ' + w.label.toLowerCase() + '.';
      var g = global.LunaGids && global.LunaGids.PLANEET[k];
      if (g) zin += ' Kracht: ' + g.kracht.toLowerCase() + '; schaduw: ' + g.schaduw.toLowerCase() + '.';
      r.push(zin + '\n');
    });
    r.push('### Belangrijkste aspecten\n');
    chart.aspecten.slice().sort(function (a, b) { return a.orb - b.orb; }).slice(0, 10).forEach(function (a) {
      r.push('**' + naamVan(a.a) + ' ' + a.type + ' ' + naamVan(a.b) + '** (orbis ' + nl(a.orb) + '°): ' +
        PLANEET_FUNCTIE[a.a] + ' en ' + PLANEET_FUNCTIE[a.b] + ' ' + ASPECT_BETEKENIS[a.type] + '.\n');
    });
    r.push('> Astrologie is een symbolische traditie en niet wetenschappelijk bevestigd. ' +
      'Gebruik dit rapport voor zelfreflectie, niet voor medische of financiële beslissingen.\n');
    return r.join('\n');
  }

  /* ---------- prompt voor een taalmodel ---------- */

  function gegevens(chart, an, profiel) {
    var p = chart.punten, tb = an.tijdBekend;
    var data = {
      invoer: {
        naam: profiel.naam, datum: profiel.datum.slice(0, 10),
        tijd: profiel.tijdBekend ? profiel.tijd : 'onbekend', plaats: profiel.plaats.naam,
        huizensysteem: chart.eigenHuizen ? 'eigen cuspen' : 'hele tekens'
      },
      posities: TIEN.concat(['knoop']).filter(function (k) { return p[k]; }).map(function (k) {
        return { naam: naamVan(k), positie: positieTekst(k, p[k]), huis: tb ? p[k].huis : null,
                 retrograde: !!(p[k].retrograde && k !== 'knoop'),
                 waardigheid: (waardigheid(k, p[k].teken) || { label: '–' }).label };
      }),
      hoekpunten: tb ? [{ naam: 'Ascendant', positie: positieTekst('asc', p.asc) },
                        { naam: 'MC', positie: positieTekst('mc', p.mc) }] : [],
      huizen: tb ? an.huizen.map(function (h) {
        return { huis: h.huis, cusp: positieTekst('', { graad: h.cusp % 30, teken: h.teken }),
                 heerser: naamVan(h.heerser), heerser_in_huis: h.heerserHuis,
                 bewoners: h.bewoners.map(naamVan) };
      }) : [],
      aspecten: chart.aspecten.slice().sort(function (a, b) { return a.orb - b.orb; }).map(function (a) {
        return naamVan(a.a) + ' ' + a.type + ' ' + naamVan(a.b) + ' (' + nl(a.orb, 2) + '°)';
      }),
      elementen: an.elementen, kwaliteiten: an.kwaliteiten, halfronden: an.halfronden || null,
      horoscoopheerser: an.heerser ? naamVan(an.heerser) : null,
      dominant: an.dominant.map(function (d) { return naamVan(d.punt) + ' (' + nl(d.score) + ')'; }),
      patronen: an.patronen.map(patroonTekst),
      maanfase: { naam: an.maanfase.naam, uitleg: an.maanfase.uitleg, hoek: +an.maanfase.hoek.toFixed(1) }
    };
    return data;
  }

  function prompt(chart, an, profiel) {
    var data = gegevens(chart, an, profiel);
    return '# ROL\n' +
      'Je bent een ervaren psychologisch astrologe (moderne, humanistische school) die\n' +
      'helder, warm en concreet schrijft in het Nederlands. Je gebruikt astrologie als\n' +
      'symbolische taal voor zelfreflectie, niet als voorspelling van vaststaande feiten.\n\n' +
      '# CONTEXT\n' +
      'Hieronder staan de berekende gegevens van de geboortehoroscoop van ' + profiel.naam + '.\n' +
      'Gebruik UITSLUITEND deze gegevens. Verzin geen posities of aspecten die er niet in staan.\n\n' +
      '# TAAK\n' +
      'Schrijf een gedetailleerde horoscoopanalyse (± 2.500 woorden) met deze hoofdstukken:\n' +
      '1. Kernboodschap (3 zinnen: de rode draad van deze horoscoop)\n' +
      '2. Algemene indruk: elementen, kwaliteiten, halfronden, maanfase\n' +
      '3. De grote drie: Zon, Maan, Ascendant en de horoscoopheerser, en hoe ze samenwerken\n' +
      '4. Dominante planeten en aspectpatronen\n' +
      '5. Persoonlijke planeten: Mercurius, Venus, Mars (teken, huis, aspecten)\n' +
      '6. Levensgebieden: werk & roeping (huis 2, 6, 10), relaties (huis 5, 7, 8),\n' +
      '   thuis & familie (huis 4), groei & zingeving (huis 9, 12)\n' +
      '7. De vijf belangrijkste aspecten, elk met talent, valkuil en groeitip\n' +
      '8. Levensopdracht: Maansknoop en Saturnus\n' +
      '9. Reflectievragen\n' +
      '10. Samenvatting in een tabel: | Thema | Kracht | Uitdaging | Tip |\n\n' +
      '# VORM\n' +
      '- Markdown, koppen met ##, geen emoji\'s.\n' +
      '- Begin elk hoofdstuk met één vetgedrukte kernzin.\n' +
      '- Noem bij elke uitspraak tussen haakjes de astrologische onderbouwing,\n' +
      '  bijv. "(Maan in Kreeft, huis 4)".\n' +
      '- Weeg aspecten met kleine orbis zwaarder dan aspecten met grote orbis.\n' +
      '- Benoem tegenstrijdigheden expliciet en laat zien hoe ze samen kunnen gaan.\n' +
      '- Schrijf in de jij-vorm, positief maar eerlijk; geen medische, financiële of\n' +
      '  fatalistische uitspraken.\n\n' +
      '# DATA\n```json\n' + JSON.stringify(data, null, 1) + '\n```\n';
  }

  global.LunaAnalyse = {
    analyseer: analyseer, rapport: rapport, prompt: prompt, gegevens: gegevens,
    patroonTekst: patroonTekst, patroonUitleg: patroonUitleg,
    ELEMENTEN: ELEMENTEN, KWALITEITEN: KWALITEITEN, HUIS_DOMEIN: HUIS_DOMEIN,
    naamVan: naamVan, positieTekst: positieTekst
  };
})(typeof window !== 'undefined' ? window : globalThis);
