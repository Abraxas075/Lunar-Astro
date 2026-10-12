/* LUNA - rapport volgens de rapporttemplate van de Horoscoop-analyse Toolkit.

   Eén model (een lijst blokken) met twee weergaven: HTML voor het scherm en de
   printer, en Pandoc-Markdown om zelf verder te bewerken. Wat je in de
   werkbladen hebt geschreven gaat voor; waar je niets schreef, vult LUNA een
   aanzet in uit de berekening. */
(function (global) {
  'use strict';

  var C = global.LunaContent, D = global.LunaDuiding, AN = global.LunaAnalyse, G = global.LunaGids;

  var GEBIEDEN = [
    { titel: 'Werk en roeping', huizen: [2, 6, 10], werkblad: ['Werk en roeping'] },
    { titel: 'Relaties', huizen: [5, 7, 8], werkblad: ['Relaties en liefde'] },
    { titel: 'Thuis en familie', huizen: [4], werkblad: ['Thuis en familie'] },
    { titel: 'Groei en zingeving', huizen: [9, 12], werkblad: ['Communicatie en leren', 'Innerlijk leven'] }
  ];

  function naam(k) { return AN.naamVan(k); }
  function teken(i) { return C.TEKENS[i].naam; }
  function dec(x) { return x.toFixed(1).replace('.', ','); }
  function hoofd(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function lijst(a) { return a.length ? a.join(', ') : '–'; }

  /* Sleutel van een transit in werkblad 7; blijft gelijk zolang de transit loopt. */
  function transitSleutel(t) { return 'w7-' + t.transit + '-' + t.type + '-' + t.natal; }

  /* ctx: { natal, an, profiel, transits, waarden, datum } */
  function model(ctx) {
    var ch = ctx.natal, an = ctx.an, pr = ctx.profiel, w = ctx.waarden || {}, p = ch.punten;
    var tb = an.tijdBekend, b = [];
    function eigen(k) { return (w[k] || '').trim(); }
    function pos(k) { return AN.positieTekst(k, p[k]) + (tb && p[k].huis ? ', huis ' + p[k].huis : ''); }
    function aspectenVan(k, max) {
      return ch.aspecten.filter(function (a) { return a.a === k || a.b === k; })
        .sort(function (x, y) { return x.orb - y.orb; }).slice(0, max)
        .map(function (a) { return C.ASPECTEN[a.type].naam + ' ' + naam(a.a === k ? a.b : a.a) + ' (' + dec(a.orb) + '°)'; });
    }
    function para(eigenTekst, aanzet) {
      if (eigenTekst) b.push({ t: 'p', v: eigenTekst });
      else if (aanzet) b.push({ t: 'p', v: aanzet, aanzet: true });
    }

    b.push({ t: 'titel', v: 'Horoscoopanalyse', sub: pr.naam + ' — geboren ' + pr.datum +
      (pr.tijdBekend ? ', ' + pr.tijd : '') + ', ' + pr.plaats.naam, datum: ctx.datum });

    // Kernboodschap
    var dom = an.dominant[0];
    b.push({ t: 'h1', v: 'Kernboodschap' });
    b.push({ t: 'kader', soort: 'kern', v: eigen('r-kern') ||
      ('Een ' + teken(p.zon.teken) + '-zon met een maan in ' + teken(p.maan.teken) +
       (tb ? ' en ' + teken(p.asc.teken) + ' rijzend' : '') + '. ' + naam(dom.punt) +
       ' kleurt de horoscoop het sterkst, en het element ' + an.sterkEl + ' overheerst. ' +
       C.TEKENS[p.zon.teken].kern), aanzet: !eigen('r-kern') });
    b.push({ t: 'wiel' });
    var kern = [['Zon', pos('zon')], ['Maan', pos('maan')]];
    if (tb) {
      kern.push(['Ascendant', AN.positieTekst('asc', p.asc)]);
      kern.push(['Horoscoopheerser', naam(an.heerser) + ' in ' + teken(p[an.heerser].teken) + ', huis ' + p[an.heerser].huis]);
    }
    kern.push(['Dominante planeet', naam(dom.punt) + ' in ' + teken(p[dom.punt].teken)]);
    kern.push(['Maanfase', an.maanfase.naam]);
    b.push({ t: 'tabel', kop: ['Factor', 'Positie'], rijen: kern, bijschrift: 'Kerngegevens in één oogopslag' });

    // Totaalbeeld
    b.push({ t: 'h1', v: 'Totaalbeeld' });
    b.push({ t: 'h2', v: 'Elementen en kwaliteiten' });
    var sterk = an.sterkEl.split(' en ')[0], zwak = an.zwakEl.split(' en ')[0], kw = an.sterkKw.split(' en ')[0];
    b.push({ t: 'tabel', kop: ['Element', 'Score'], rijen: AN.ELEMENTEN.map(function (e) { return [hoofd(e), dec(an.elementen[e])]; }) });
    b.push({ t: 'tabel', kop: ['Kwaliteit', 'Score'], rijen: AN.KWALITEITEN.map(function (k) { return [hoofd(k), dec(an.kwaliteiten[k])]; }) });
    para([eigen('w2-sterk-el'), eigen('w2-zwak-el'), eigen('w2-kw')].filter(Boolean).join(' '),
      'Sterkste element: ' + an.sterkEl + ' (' + G.ELEMENT[sterk].sterk.toLowerCase() + '). Zwakste: ' + an.zwakEl +
      ' (' + G.ELEMENT[zwak].weinig.toLowerCase() + ').' + (an.elementen[zwak] <= 1 ? ' ' + G.VUISTREGEL : '') +
      ' Dominante kwaliteit: ' + an.sterkKw + ' (' + G.KWALITEIT[kw].sterk.toLowerCase() + ').');
    b.push({ t: 'h2', v: 'Halfronden en patronen' });
    var h = an.halfronden;
    var halfAanzet = h
      ? 'Boven de horizon ' + h.boven + ', eronder ' + h.onder + ' planeten: ' +
        (h.boven > h.onder ? 'naar buiten gericht' : h.boven < h.onder ? 'naar binnen gericht' : 'in evenwicht') +
        '. Oost ' + h.oost + ', west ' + h.west + ': ' +
        (h.oost > h.west ? 'zelfbepalend' : h.oost < h.west ? 'op anderen gericht' : 'in evenwicht') + '. '
      : 'Zonder geboortetijd zijn de halfronden niet te bepalen. ';
    var pat = an.patronen.length
      ? an.patronen.map(function (x) { return AN.patroonTekst(x) + ' (' + G.PATROON[x.soort].betekenis.toLowerCase().replace(/\.$/, '') + ')'; }).join('; ') + '.'
      : 'Geen stellium, grote driehoek of T-vierkant.';
    para([eigen('w2-half'), eigen('w2-patroon')].filter(Boolean).join(' '), halfAanzet + pat);
    para(eigen('w2-fase'), 'Geboren bij ' + an.maanfase.naam.toLowerCase() + ': ' + G.MAANFASE[Math.floor(an.maanfase.hoek / 45) % 8].toLowerCase());

    // De grote drie
    b.push({ t: 'h1', v: 'De grote drie' });
    [['zon', 'Zon'], ['maan', 'Maan']].forEach(function (x) {
      b.push({ t: 'h2', v: x[1] + ': ' + teken(p[x[0]].teken) + (tb ? ', huis ' + p[x[0]].huis : '') });
      var d = D.planeetInTeken(x[0], p[x[0]].teken);
      para(eigen('w3-' + x[0]), d.tekst);
    });
    if (tb) {
      b.push({ t: 'h2', v: 'Ascendant: ' + teken(p.asc.teken) });
      var asc = C.ASC_IN_TEKEN ? C.ASC_IN_TEKEN[p.asc.teken] : null;
      para(eigen('w3-asc'), asc && asc.tekst ? asc.tekst : 'Uitstraling: ' + C.TEKENS[p.asc.teken].stijl + '.');
      b.push({ t: 'h2', v: 'Samenspel' });
      para(eigen('w3-samenspel') || eigen('w3-' + an.heerser),
        'Horoscoopheerser ' + naam(an.heerser) + ' staat in ' + teken(p[an.heerser].teken) + ', huis ' + p[an.heerser].huis +
        ': ' + G.PLANEET[an.heerser].functie.toLowerCase() + ' is de rode draad. Strakste verbindingen: ' +
        lijst(aspectenVan(an.heerser, 3)) + '.');
    } else {
      b.push({ t: 'h2', v: 'Samenspel' });
      para(eigen('w3-samenspel'), 'Zonder geboortetijd zijn er geen ascendant en horoscoopheerser; lees zon en maan samen.');
    }

    // Dominante planeten en kernaspecten
    b.push({ t: 'h1', v: 'Dominante planeten en kernaspecten' });
    b.push({ t: 'tabel', kop: ['Planeet', 'Score', 'Kracht', 'Schaduw'], rijen: an.dominant.map(function (d) {
      return [naam(d.punt) + ' in ' + teken(p[d.punt].teken), dec(d.score), G.PLANEET[d.punt].kracht, G.PLANEET[d.punt].schaduw];
    }) });
    var strak = ch.aspecten.filter(function (a) { return G.PLANEET[a.a] && G.PLANEET[a.b]; })
      .sort(function (x, y) { return x.orb - y.orb; }).slice(0, 5);
    b.push({ t: 'tabel', kop: ['Aspect', 'Orbis', 'Talent', 'Valkuil'], rijen: strak.map(function (a) {
      return [naam(a.a) + ' ' + C.ASPECTEN[a.type].naam + ' ' + naam(a.b), dec(a.orb) + '°',
        G.PLANEET[a.a].kracht.toLowerCase() + ' met ' + G.PLANEET[a.b].kracht.toLowerCase(),
        G.PLANEET[a.a].schaduw.toLowerCase() + ' met ' + G.PLANEET[a.b].schaduw.toLowerCase()];
    }), bijschrift: 'De vijf sterkste aspecten' });

    // Persoonlijke planeten
    b.push({ t: 'h1', v: 'Persoonlijke planeten' });
    [['mercurius', 'denken en communiceren'], ['venus', 'liefde en waarden'], ['mars', 'daadkracht en drive']].forEach(function (x) {
      var k = x[0], t = C.TEKENS[p[k].teken];
      b.push({ t: 'h2', v: naam(k) + ': ' + x[1] });
      var r = G.retrograde(k);
      para(eigen('w4-' + k), hoofd(G.PLANEET[k].functie.toLowerCase()) + ' in ' + t.naam + (tb ? ', huis ' + p[k].huis : '') +
        ': ' + t.stijl + (tb ? ', vooral op het gebied van ' + AN.HUIS_DOMEIN[p[k].huis - 1] : '') + '.' +
        (aspectenVan(k, 2).length ? ' Verbonden met: ' + lijst(aspectenVan(k, 2)) + '.' : '') +
        (p[k].retrograde && r ? ' Retrograde: ' + r.charAt(0).toLowerCase() + r.slice(1) : ''));
    });

    // Levensgebieden
    b.push({ t: 'h1', v: 'Levensgebieden' });
    GEBIEDEN.forEach(function (g) {
      b.push({ t: 'h2', v: g.titel });
      var eigenTekst = g.werkblad.map(function (n) { return eigen('w5-' + n); }).filter(Boolean).join(' ');
      if (!tb) { para(eigenTekst, 'Levensgebieden vragen huizen, en huizen vragen een geboortetijd.'); return; }
      var hs = an.huizen.filter(function (x) { return g.huizen.indexOf(x.huis) >= 0; });
      para(eigenTekst, hs.map(function (x) {
        return 'Huis ' + x.huis + ' (' + AN.HUIS_DOMEIN[x.huis - 1] + ') begint in ' + teken(x.teken) +
          (x.bewoners.length ? ', met ' + x.bewoners.map(naam).join(' en ') + ' erin' : ', leeg') +
          '; heerser ' + naam(x.heerser) + (x.heerserHuis ? ' staat in huis ' + x.heerserHuis : '') + '.';
      }).join(' '));
    });

    // Levensopdracht
    b.push({ t: 'h1', v: 'Levensopdracht' });
    var zk = (p.knoop.teken + 6) % 12;
    b.push({ t: 'p', v: 'Noordknoop in ' + teken(p.knoop.teken) + (tb ? ', huis ' + p.knoop.huis : '') +
      ': de groeirichting is ' + C.TEKENS[p.knoop.teken].stijl + '. Zuidknoop in ' + teken(zk) +
      ': wat je al (te) goed kent is ' + C.TEKENS[zk].stijl + '. Saturnus in ' + teken(p.saturnus.teken) +
      (tb ? ', huis ' + p.saturnus.huis : '') + ' wijst de levensles: ' + G.PLANEET.saturnus.vraag.toLowerCase() });
    b.push({ t: 'kader', soort: 'tip', v: eigen('r-tip') ||
      'Groei ligt in ' + C.TEKENS[p.knoop.teken].kernwoorden.slice(0, 2).join(' en ') +
      ', zonder ' + C.TEKENS[zk].kernwoorden.slice(0, 2).join(' en ') + ' los te laten.', aanzet: !eigen('r-tip') });

    // Actuele periode
    b.push({ t: 'h1', v: 'Actuele periode (transits)' });
    var trs = (ctx.transits || []).filter(function (t) { return t.transit !== 'maan'; }).slice(0, 6);
    if (trs.length) {
      b.push({ t: 'tabel', kop: ['Periode', 'Transit', 'Thema', 'Reflectievraag'], rijen: trs.map(function (t) {
        var dd = G.TRANSIT_DUUR[t.transit];
        return [dd ? dd[0] : 'kort', naam(t.transit) + ' ' + C.ASPECTEN[t.type].naam + ' ' + naam(t.natal),
          dd ? dd[1] : G.PLANEET[t.transit] ? G.PLANEET[t.transit].functie : '–',
          eigen(transitSleutel(t)) || G.ASPECT[t.type].vraag];
      }), bijschrift: 'Transits rond ' + ctx.datum + ' en hun thema\'s' });
    } else b.push({ t: 'p', v: 'Op dit moment staan er geen transits binnen orb.' });

    // Samenvatting
    b.push({ t: 'h1', v: 'Samenvatting' });
    var sam = [];
    for (var i = 0; i < 6; i++) {
      var rij = ['t', 'k', 'u', 'tip'].map(function (s) { return eigen('r-sam-' + i + '-' + s); });
      if (rij.some(Boolean)) sam.push(rij);
    }
    if (!sam.length) {
      sam = an.dominant.map(function (d) {
        return [hoofd(G.PLANEET[d.punt].functie.toLowerCase()), G.PLANEET[d.punt].kracht, G.PLANEET[d.punt].schaduw, G.PLANEET[d.punt].vraag];
      });
    }
    b.push({ t: 'tabel', kop: ['Thema', 'Kracht', 'Uitdaging', 'Tip'], rijen: sam, bijschrift: 'Overzicht van kernthema\'s',
      aanzet: !eigen('r-sam-0-t') });

    // Verantwoording
    b.push({ t: 'h1', v: 'Verantwoording' });
    b.push({ t: 'p', v: 'Berekend door LUNA met eigen formules (Meeus, Schlyter, Standish/JPL), tropische dierenriem, ' +
      (tb ? (ch.eigenHuizen ? 'aangeleverde huiscuspen' : 'hele-tekenhuizen') : 'zonder huizen (geboortetijd onbekend)') +
      '. Betrouwbaarheid geboortetijd: ' + (eigen('w1-betrouwbaar') || 'niet opgegeven') +
      '. Astrologie is een symbolisch reflectie-instrument en geen voorspelling van vaststaande feiten.' });
    return b;
  }

  /* ---------- weergaven ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function html(blokken, wielHTML) {
    return blokken.map(function (x) {
      var aanzet = x.aanzet ? ' aanzet' : '';
      switch (x.t) {
        case 'titel': return '<header class="rapport-kop"><p class="label-caps">Horoscoopanalyse</p>' +
          '<h1>' + esc(x.sub.split(' — ')[0]) + '</h1><p>' + esc(x.sub.split(' — ')[1]) + '</p>' +
          '<p class="rapport-datum">Analyse van ' + esc(x.datum) + '</p></header>';
        case 'h1': return '<h2 class="rapport-h1">' + esc(x.v) + '</h2>';
        case 'h2': return '<h3 class="rapport-h2">' + esc(x.v) + '</h3>';
        case 'p': return '<p class="rapport-p' + aanzet + '">' + esc(x.v) + '</p>';
        case 'kader': return '<div class="rapport-kader ' + x.soort + aanzet + '">' + esc(x.v) + '</div>';
        case 'wiel': return '<div class="rapport-wiel">' + (wielHTML || '') + '</div>';
        case 'tabel': return '<div class="rapport-tabel-wrap"><table class="rapport-tabel' + aanzet + '"><thead><tr>' +
          x.kop.map(function (k) { return '<th>' + esc(k) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          x.rijen.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table>' + (x.bijschrift ? '<p class="rapport-bijschrift">' + esc(x.bijschrift) + '</p>' : '') + '</div>';
      }
      return '';
    }).join('');
  }

  function cel(s) { return String(s).replace(/\|/g, '/').replace(/\n+/g, ' '); }

  /* Pandoc-Markdown volgens de template, met optioneel een bijlage. */
  function markdown(blokken, wielBestand, bijlage) {
    var r = [];
    blokken.forEach(function (x) {
      switch (x.t) {
        case 'titel':
          r.push('---', 'title: "Horoscoopanalyse"', 'subtitle: "' + x.sub.replace(/"/g, "'") + '"',
            'date: "' + x.datum + '"', 'lang: nl-NL', '---', ''); break;
        case 'h1': r.push('# ' + x.v, ''); break;
        case 'h2': r.push('## ' + x.v, ''); break;
        case 'p': r.push(x.v, ''); break;
        case 'kader': r.push('::: ' + x.soort, x.v, ':::', ''); break;
        case 'wiel': r.push('![Horoscoopwiel](' + wielBestand + '){width=85%}', ''); break;
        case 'tabel':
          r.push('| ' + x.kop.join(' | ') + ' |', '|' + x.kop.map(function () { return ':--'; }).join('|') + '|');
          x.rijen.forEach(function (row) { r.push('| ' + row.map(cel).join(' | ') + ' |'); });
          r.push('');
          if (x.bijschrift) r.push(': ' + x.bijschrift, '');
          break;
      }
    });
    if (bijlage) {
      r.push('# Bijlage: berekende gegevens', '');
      // het datarapport begint met een eigen titel; die laten we weg
      r.push(bijlage.replace(/^# .*\n+/, ''));
    }
    return r.join('\n');
  }

  global.LunaRapport = { model: model, html: html, markdown: markdown, transitSleutel: transitSleutel };
})(typeof window !== 'undefined' ? window : globalThis);
