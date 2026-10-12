/* LUNA - werkbladen.
   De zeven werkbladen uit de Horoscoop-analyse Toolkit, voorgevuld met wat uit
   de horoscoop volgt. Wat een mens zelf moet duiden (interpretatie, synthese,
   conclusie) is een invulveld. */
(function (global) {
  'use strict';

  var A = global.LunaAstro, C = global.LunaContent, AN = global.LunaAnalyse, G = global.LunaGids;

  var HUIS_GEBIEDEN = [
    ['Werk en roeping', [2, 6, 10]],
    ['Relaties en liefde', [5, 7, 8]],
    ['Thuis en familie', [4]],
    ['Communicatie en leren', [3, 9]],
    ['Vriendschap en netwerk', [11]],
    ['Innerlijk leven', [12]]
  ];

  var SAM_RIJEN = 6;

  function naam(k) { return AN.naamVan(k); }
  function teken(i) { return C.TEKENS[i].naam; }
  function lijst(a) { return a.length ? a.join(', ') : '–'; }
  function dec(x) { return x.toFixed(1).replace('.', ','); }

  function aspectenVan(chart, k, max) {
    return chart.aspecten.filter(function (a) { return a.a === k || a.b === k; })
      .sort(function (x, y) { return x.orb - y.orb; }).slice(0, max || 4)
      .map(function (a) {
        return C.ASPECTEN[a.type].teken + ' ' + naam(a.a === k ? a.b : a.a) + ' (' + dec(a.orb) + '°)';
      });
  }

  function bouw(chart, an, profiel, transits) {
    var p = chart.punten, tb = an.tijdBekend, bladen = [];
    var nu = new Date();
    function huis(k) { return tb && p[k] ? String(p[k].huis) : '–'; }

    // 1
    bladen.push({
      id: 'w1', titel: 'Basisgegevens', intro: 'Wie en wanneer. De betrouwbaarheid van de geboortetijd bepaalt of je huizen en ascendant mag gebruiken.',
      rijen: [
        { label: 'Naam', cellen: [{ k: 'Invulling', v: profiel.naam }] },
        { label: 'Datum, tijd, plaats', cellen: [{ k: 'Invulling', v: profiel.datum + (profiel.tijdBekend ? ', ' + profiel.tijd : ', tijd onbekend') + ', ' + profiel.plaats.naam }] },
        { label: 'Betrouwbaarheid (AA/A/B/C/X)', cellen: [{ k: 'Invulling', veld: 'w1-betrouwbaar', ph: 'AA = uit akte, X = onbekend' }] },
        { label: 'Huizensysteem', cellen: [{ k: 'Invulling', v: tb ? (chart.eigenHuizen ? 'Eigen cuspen' : 'Hele tekens') : 'Geen (geboortetijd onbekend)' }] },
        { label: 'Analysedatum', cellen: [{ k: 'Invulling', v: nu.toISOString().slice(0, 10) }] }
      ]
    });

    // 2
    var h = an.halfronden;
    bladen.push({
      id: 'w2', titel: 'Totaalbeeld', intro: 'Van groot naar klein: wat is sterk, wat ontbreekt, welke energie kleurt alles?',
      rijen: [
        { label: 'Sterkste element', cellen: [{ k: 'Bevinding', v: an.sterkEl }, { k: 'Thema', veld: 'w2-sterk-el', ph: G.ELEMENT[an.sterkEl.split(' en ')[0]].thema }] },
        { label: 'Zwakste / ontbrekend element', cellen: [{ k: 'Bevinding', v: an.zwakEl + (an.elementen[an.zwakEl.split(' en ')[0]] <= 1 ? ' (ontbrekend)' : '') }, { k: 'Thema', veld: 'w2-zwak-el', ph: G.ELEMENT[an.zwakEl.split(' en ')[0]].weinig }] },
        { label: 'Dominante kwaliteit', cellen: [{ k: 'Bevinding', v: an.sterkKw }, { k: 'Thema', veld: 'w2-kw', ph: G.KWALITEIT[an.sterkKw.split(' en ')[0]].thema }] },
        { label: 'Halfronden', cellen: [{ k: 'Bevinding', v: h ? 'boven ' + h.boven + ' / onder ' + h.onder + ', oost ' + h.oost + ' / west ' + h.west : 'Geen geboortetijd' }, { k: 'Thema', veld: 'w2-half', ph: 'Naar binnen of buiten? Zelfbepalend of op anderen gericht?' }] },
        { label: 'Maanfase', cellen: [{ k: 'Bevinding', v: an.maanfase.naam }, { k: 'Thema', veld: 'w2-fase', ph: G.MAANFASE[Math.floor(an.maanfase.hoek / 45) % 8] }] },
        { label: 'Patronen', cellen: [{ k: 'Bevinding', v: lijst(an.patronen.map(AN.patroonTekst)) }, { k: 'Thema', veld: 'w2-patroon' }] }
      ].concat(an.dominant.map(function (d, i) {
        return { label: 'Dominante planeet ' + (i + 1), cellen: [
          { k: 'Bevinding', v: naam(d.punt) + ' in ' + teken(p[d.punt].teken) + (tb ? ', huis ' + p[d.punt].huis : '') },
          { k: 'Thema', veld: 'w2-dom' + (i + 1), ph: G.PLANEET[d.punt].functie }] };
      }))
    });

    // 3
    function groteDrie(k, label) {
      return { label: label, cellen: [
        { k: 'Teken', v: teken(p[k].teken) }, { k: 'Huis', v: huis(k) },
        { k: 'Belangrijkste aspecten', v: lijst(aspectenVan(chart, k, 3)) },
        { k: 'Mijn interpretatie', veld: 'w3-' + k } ] };
    }
    var rij3 = [groteDrie('zon', 'Zon'), groteDrie('maan', 'Maan')];
    if (tb) {
      rij3.push({ label: 'Ascendant', cellen: [{ k: 'Teken', v: teken(p.asc.teken) }, { k: 'Huis', v: '–' },
        { k: 'Belangrijkste aspecten', v: lijst(aspectenVan(chart, 'asc', 3)) }, { k: 'Mijn interpretatie', veld: 'w3-asc' }] });
      rij3.push(groteDrie(an.heerser, 'Horoscoopheerser (' + naam(an.heerser) + ')'));
    }
    bladen.push({
      id: 'w3', titel: 'De grote drie en de horoscoopheerser', intro: tb ? 'Kern, gevoel, uitstraling en de regisseur van de horoscoop.' : 'Zonder geboortetijd zijn er geen ascendant en horoscoopheerser.',
      rijen: rij3,
      extra: { k: 'Samenspel: hoe werken deze samen? (3 tot 5 zinnen)', veld: 'w3-samenspel' }
    });

    // 4
    var rij4 = ['mercurius', 'venus', 'mars', 'jupiter', 'saturnus'].map(function (k) {
      var wd = an.waardigheden.filter(function (x) { return x.punt === k; })[0];
      var t = C.TEKENS[p[k].teken];
      var voorstel = G.PLANEET[k].functie + ' uit zich ' + t.stijl + (tb ? ' op het gebied van ' + AN.HUIS_DOMEIN[p[k].huis - 1] : '') + ', en …';
      return { label: naam(k), cellen: [
        { k: 'Teken (hoe)', v: t.naam }, { k: 'Huis (waar)', v: huis(k) },
        { k: 'Waardigheid', v: wd ? wd.label : '–' }, { k: 'Retrograde', v: p[k].retrograde ? 'ja' : 'nee' },
        { k: 'Aspecten (met wie, welk soort)', v: lijst(aspectenVan(chart, k, 4)) },
        { k: 'Synthese in één zin', veld: 'w4-' + k, ph: voorstel }] };
    });
    bladen.push({
      id: 'w4', titel: 'Planeet voor planeet', intro: 'Formule voor de synthesezin: "[Planeetfunctie] uit zich [tekenstijl] op het gebied van [huisdomein], en [aspect] met [planeet] zorgt voor [effect]." Het grijze voorbeeld in elk veld is het begin.',
      rijen: rij4
    });

    // 5
    bladen.push({
      id: 'w5', titel: 'Levensgebieden', intro: tb ? 'Lees elk gebied via teken op de cusp, bewoners en heersers.' : 'Levensgebieden lezen vraagt huizen, en die vragen een geboortetijd.',
      rijen: !tb ? [] : HUIS_GEBIEDEN.map(function (g) {
        var hs = an.huizen.filter(function (x) { return g[1].indexOf(x.huis) >= 0; });
        return { label: g[0] + ' (huis ' + g[1].join(', ') + ')', cellen: [
          { k: 'Cusp-tekens', v: lijst(hs.map(function (x) { return x.huis + ': ' + teken(x.teken); })) },
          { k: 'Bewoners', v: lijst([].concat.apply([], hs.map(function (x) { return x.bewoners.map(naam); }))) },
          { k: 'Heersers (staan in)', v: lijst(hs.map(function (x) { return naam(x.heerser) + (x.heerserHuis ? ' (huis ' + x.heerserHuis + ')' : ''); })) },
          { k: 'Conclusie', veld: 'w5-' + g[0] }] };
      })
    });

    // 6 en 7 zijn vrij: aantal rijen komt uit de opslag
    bladen.push({
      id: 'w6', titel: 'Themakaart (drievoudige bevestiging)', intro: G.DRIEVOUDIG, themakaart: true
    });

    var rij7 = (transits || []).filter(function (t) { return t.transit !== 'maan'; }).slice(0, 6).map(function (t, i) {
      var dd = G.TRANSIT_DUUR[t.transit];
      return { label: C.PLANETEN[t.transit].naam + ' ' + C.ASPECTEN[t.type].teken + ' ' + C.PLANETEN[t.natal].naam, cellen: [
        { k: 'Periode', v: 'nu' + (dd ? ' (' + dd[0].toLowerCase() + ')' : '') },
        { k: 'Natale factor', v: naam(t.natal) },
        { k: 'Thema', v: dd ? dd[1] : '–' },
        { k: 'Advies / reflectievraag', veld: global.LunaRapport.transitSleutel(t), ph: G.ASPECT[t.type].vraag }] };
    });
    bladen.push({
      id: 'w7', titel: 'Transits en timing', intro: rij7.length ? 'De sterkste lopende transits, voorgevuld. Wat vraagt nu aandacht?' : 'Op dit moment zijn er geen aspecten binnen orb.',
      rijen: rij7
    });

    bladen.push({
      id: 'w8', titel: 'Rapport', samenvatting: true,
      intro: 'Wat alleen jij kunt schrijven. Het rapport neemt dit over; laat je iets leeg, dan zet LUNA er een aanzet neer.',
      velden: [
        { k: 'Kernboodschap: de rode draad in 2 tot 3 zinnen', veld: 'r-kern', rijen: 3 },
        { k: 'Levensopdracht: het belangrijkste groeiadvies', veld: 'r-tip', rijen: 2 }
      ]
    });

    return bladen;
  }

  /* Markdown van alle werkbladen, met wat de gebruiker heeft ingevuld. */
  function markdown(bladen, waarden, profiel) {
    var r = ['# Werkbladen — ' + profiel.naam + '\n'];
    function val(veld) { return (waarden[veld] || '').replace(/\n/g, ' ').replace(/\|/g, '/'); }
    bladen.forEach(function (b, n) {
      r.push('## Werkblad ' + (n + 1) + ' — ' + b.titel + '\n');
      if (b.samenvatting) {
        b.velden.forEach(function (v) { r.push('**' + v.k + '** ' + val(v.veld) + '\n'); });
        r.push('| Thema | Kracht | Uitdaging | Tip |\n|:--|:--|:--|:--|');
        for (var s = 0; s < SAM_RIJEN; s++) {
          var rij = ['t', 'k', 'u', 'tip'].map(function (x) { return val('r-sam-' + s + '-' + x); });
          if (rij.join('')) r.push('| ' + rij.join(' | ') + ' |');
        }
        r.push('');
        return;
      }
      if (b.themakaart) {
        r.push('| Thema | Aanwijzing 1 | Aanwijzing 2 | Aanwijzing 3 | Kernthema? |\n|:--|:--|:--|:--|:--:|');
        var aantal = Math.max(3, +waarden['w6-aantal'] || 3);
        for (var i = 0; i < aantal; i++) {
          r.push('| ' + ['t', 'a1', 'a2', 'a3', 'k'].map(function (s) { return val('w6-' + i + '-' + s); }).join(' | ') + ' |');
        }
        r.push('');
        return;
      }
      if (!b.rijen.length) { r.push(b.intro + '\n'); return; }
      var kol = b.rijen[0].cellen.map(function (c) { return c.k; });
      r.push('| ' + [b.id === 'w1' ? 'Gegeven' : 'Factor'].concat(kol).join(' | ') + ' |');
      r.push('|' + new Array(kol.length + 2).join(':--|'));
      b.rijen.forEach(function (row) {
        r.push('| ' + [row.label].concat(row.cellen.map(function (c) { return c.veld ? val(c.veld) : String(c.v).replace(/\|/g, '/'); })).join(' | ') + ' |');
      });
      r.push('');
      if (b.extra) r.push('**' + b.extra.k + '** ' + val(b.extra.veld) + '\n');
    });
    return r.join('\n');
  }

  global.LunaWerkbladen = { bouw: bouw, markdown: markdown, SAM_RIJEN: SAM_RIJEN };
})(typeof window !== 'undefined' ? window : globalThis);
