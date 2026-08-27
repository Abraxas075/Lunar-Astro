/* LUNA - schermen, navigatie en opslag.
   Alles draait in de browser. Er gaat geen enkel gegeven naar een server. */
(function () {
  'use strict';

  var A = window.LunaAstro, C = window.LunaContent,
      D = window.LunaDuiding, PL = window.LunaPlaatsen, E = window.LunaEigenData;

  var scherm = document.getElementById('scherm');
  var navigatie = document.getElementById('navigatie');
  var knopTerug = document.getElementById('knop-terug');
  var knopMeldingen = document.getElementById('knop-meldingen');

  /* ================= opslag ================= */

  var SLEUTEL = 'luna.v1';

  var standaard = {
    profiel: null,
    relaties: [],
    bewaard: [],
    instellingen: {
      dagelijks: true, tijd: '08:00', transits: true, vollemaan: true,
      nieuwemaan: true, retrograde: true, relaties: false
    }
  };

  function laden() {
    try {
      var ruw = localStorage.getItem(SLEUTEL);
      if (!ruw) return JSON.parse(JSON.stringify(standaard));
      var s = JSON.parse(ruw);
      return {
        profiel: s.profiel || null,
        relaties: s.relaties || [],
        bewaard: s.bewaard || [],
        instellingen: Object.assign({}, standaard.instellingen, s.instellingen || {})
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(standaard));
    }
  }

  function bewaren() {
    try { localStorage.setItem(SLEUTEL, JSON.stringify(staat)); }
    catch (e) { toon('Opslaan lukte niet. Is de opslag van je browser vol?'); }
  }

  var staat = laden();

  /* ================= hulpjes ================= */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function ico(naam, klasse) {
    return '<svg class="icoon ' + (klasse || '') + '" aria-hidden="true"><use href="#i-' + naam + '"></use></svg>';
  }

  var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli',
                 'augustus', 'september', 'oktober', 'november', 'december'];
  var MAANDEN_KORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  function datumLang(d) {
    return DAGEN[d.getDay()] + ' ' + d.getDate() + ' ' + MAANDEN[d.getMonth()];
  }
  function datumKort(d) {
    return d.getDate() + ' ' + MAANDEN_KORT[d.getMonth()];
  }
  function datumTijd(d) {
    return datumKort(d) + ' ' + String(d.getHours()).padStart(2, '0') + ':' +
           String(d.getMinutes()).padStart(2, '0');
  }
  /* Hetzelfde, maar in wereldtijd. De gewone versie geeft de tijd van het
     apparaat; bij een controle op UT zou dat de vraag ontwijken. */
  function datumTijdUTC(d) {
    return d.getUTCDate() + ' ' + MAANDEN_KORT[d.getUTCMonth()] + ' ' +
           d.getUTCFullYear() + ' ' +
           String(d.getUTCHours()).padStart(2, '0') + ':' +
           String(d.getUTCMinutes()).padStart(2, '0');
  }
  function groet(d) {
    var u = d.getHours();
    if (u < 6) return 'Goedenacht';
    if (u < 12) return 'Goedemorgen';
    if (u < 18) return 'Goedemiddag';
    return 'Goedenavond';
  }

  function toon(bericht) {
    var el = document.createElement('div');
    el.className = 'melding';
    el.textContent = bericht;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }

  function bezit(naam) {
    var n = String(naam || '').trim();
    if (!n) return '';
    var laatste = n.slice(-1).toLowerCase();
    if ('sxz'.indexOf(laatste) >= 0) return n + '\u2019';
    if ('aeiouy'.indexOf(laatste) >= 0) return n + '\u2019s';
    return n + 's';
  }

  function idNieuw() {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ================= horoscopen ================= */

  /* Zet opgeslagen geboortegegevens om in een berekende horoscoop. */
  function horoscoopVan(gegevens) {
    if (!gegevens || !gegevens.datum) return null;
    var d = gegevens.datum.split('-');
    var t = (gegevens.tijdBekend && gegevens.tijd ? gegevens.tijd : '12:00').split(':');
    var plaats = gegevens.plaats || { lat: 52.3676, lon: 4.9041, tz: 'Europe/Amsterdam' };
    var moment = A.zonedTimeToUTC(+d[0], +d[1], +d[2], +t[0], +t[1], plaats.tz, plaats.offset);
    return A.chart({
      jd: A.jdFromDate(moment),
      lat: plaats.lat, lon: plaats.lon,
      tijdBekend: !!gegevens.tijdBekend,
      overschrijf: E ? E.overschrijfVoor(gegevens.naam) : null,
      huizen: E ? E.huizenVoor(gegevens.naam) : null
    });
  }

  var _cache = {};
  function horoscoop(gegevens, sleutel) {
    var k = sleutel + '|' + JSON.stringify(gegevens);
    if (!_cache[k]) _cache[k] = horoscoopVan(gegevens);
    return _cache[k];
  }

  function mijnHoroscoop() {
    return staat.profiel ? horoscoop(staat.profiel, 'ik') : null;
  }

  function nuJD() { return A.jdFromDate(new Date()); }

  /* ================= onderdelen ================= */

  /* Laat zien wanneer een scherm niet op de ingebouwde formules leunt. */
  function eigenMerk(chart) {
    var stukken = [];
    if (chart && chart.overschreven) stukken.push('eigen standen');
    if (chart && chart.eigenHuizen) stukken.push('eigen huizen');
    if (A.heeftBron()) stukken.push('eigen tabel');
    if (!stukken.length) return '';
    return '<a href="#/eigen-data" class="chip neutraal" style="text-decoration:none;cursor:pointer">' +
      ico('check', 'icoon-klein') + ' ' + stukken.join(' + ') + '</a>';
  }

  function ring(percentage, maat, label) {
    var r = (maat || 64) / 2 - 3;
    var omtrek = 2 * Math.PI * r;
    var vol = omtrek * (percentage / 100);
    return '<div style="position:relative;width:' + (maat || 64) + 'px;height:' + (maat || 64) + 'px;flex:none">' +
      '<svg class="ring-svg" width="' + (maat || 64) + '" height="' + (maat || 64) + '">' +
      '<circle class="ring-achter" cx="' + (maat || 64) / 2 + '" cy="' + (maat || 64) / 2 + '" r="' + r + '" stroke-width="3"/>' +
      '<circle class="ring-voor" cx="' + (maat || 64) / 2 + '" cy="' + (maat || 64) / 2 + '" r="' + r +
      '" stroke-width="3" stroke-dasharray="' + vol.toFixed(1) + ' ' + omtrek.toFixed(1) + '"/></svg>' +
      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
      'font-size:13px;font-weight:600;color:var(--primary)">' + percentage +
      '<span style="font-size:9px">%</span></div>' +
      (label ? '<span class="body-sm zacht">' + esc(label) + '</span>' : '') + '</div>';
  }

  function balkje(label, waarde, kleur) {
    return '<div class="kolom" style="gap:6px">' +
      '<div class="rij-tussen"><span class="body-sm zacht">' + esc(label) + '</span>' +
      '<span class="body-sm" style="color:' + (kleur || 'var(--primary)') + '">' + waarde + '%</span></div>' +
      '<div class="balk"><i style="width:' + waarde + '%;background:' + (kleur || 'linear-gradient(90deg,var(--primary-dim),var(--primary))') + '"></i></div></div>';
  }

  function driehoekje(punten) {
    // Zon / maan / ascendant naast elkaar, zoals op het dashboard.
    return '<section class="glas vulling rij" style="justify-content:space-around;text-align:center">' +
      punten.map(function (p, i) {
        return (i ? '<div class="verticale-lijn"></div>' : '') +
          '<div class="kolom" style="align-items:center;gap:6px;flex:1">' +
          '<span style="color:' + p.kleur + '">' + ico(p.icoon, 'icoon-groot') + '</span>' +
          '<span class="body-sm gedempt">' + esc(p.label) + '</span>' +
          '<strong style="font-weight:600">' + esc(p.waarde) + '</strong></div>';
      }).join('') + '</section>';
  }

  /* ---- horoscoopwiel ---- */

  function wielSVG(chart, maat) {
    var S = maat || 340, cx = S / 2, cy = S / 2;
    var rBuiten = S * 0.47, rTeken = S * 0.40, rBinnen = S * 0.335, rAspect = S * 0.30;
    var draai = chart.punten.asc ? chart.punten.asc.lon : 0;

    function hoek(lon) { return (180 - (lon - draai)) * Math.PI / 180; }
    function px(lon, r) { return [cx + r * Math.cos(hoek(lon)), cy - r * Math.sin(hoek(lon))]; }

    var o = ['<svg class="wiel" viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="Geboortehoroscoop">'];
    o.push('<defs><radialGradient id="wielgloed"><stop offset="0%" stop-color="rgba(87,27,193,.35)"/>' +
           '<stop offset="100%" stop-color="rgba(17,20,23,0)"/></radialGradient></defs>');
    o.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + rBuiten + '" fill="url(#wielgloed)"/>');
    [rBuiten, rTeken, rBinnen].forEach(function (r) {
      o.push('<circle class="ring" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>');
    });

    // Sectoren en glyfen van de twaalf tekens.
    for (var i = 0; i < 12; i++) {
      var lon = i * 30;
      var a = px(lon, rTeken), b = px(lon, rBuiten);
      o.push('<line class="sectorlijn" x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) +
             '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '"/>');
      var m = px(lon + 15, (rTeken + rBuiten) / 2);
      o.push('<text class="tekenglyf" x="' + m[0].toFixed(1) + '" y="' + (m[1] + 4).toFixed(1) + '">' +
             C.TEKENS[i].symbool + '</text>');
    }

    // Huizen.
    if (chart.huizen) {
      chart.huizen.forEach(function (cusp, idx) {
        var a = px(cusp, 0), b = px(cusp, rBinnen);
        o.push('<line class="huislijn" x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) +
               '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '"/>');
        var n = px(cusp + 15, rBinnen * 0.92);
        o.push('<text class="huisnr" x="' + n[0].toFixed(1) + '" y="' + (n[1] + 3).toFixed(1) + '">' + (idx + 1) + '</text>');
      });
      // De twee assen: ascendant en midhemel. In het hele-tekensysteem vallen
      // die niet samen met een huiscusp, dus ze krijgen hun eigen lijn.
      [['AC', chart.punten.asc.lon], ['MC', chart.punten.mc.lon]].forEach(function (as) {
        var a = px(as[1], 0), b = px(as[1], rTeken);
        o.push('<line class="as" x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) +
               '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '"/>');
        var l = px(as[1], rTeken - 14);
        o.push('<text class="planeetglyf" x="' + l[0].toFixed(1) + '" y="' + (l[1] + 5).toFixed(1) +
               '" style="font-size:12px">' + as[0] + '</text>');
      });
    }

    // Aspectlijnen in het midden.
    chart.aspecten.forEach(function (asp) {
      if (asp.a === 'asc' || asp.b === 'asc' || asp.a === 'mc' || asp.b === 'mc') return;
      if (asp.sterkte < 0.25) return;
      var a = px(chart.punten[asp.a].lon, rAspect), b = px(chart.punten[asp.b].lon, rAspect);
      o.push('<line class="aspectlijn" stroke="' + C.ASPECTEN[asp.type].kleur + '" x1="' + a[0].toFixed(1) +
             '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '"/>');
    });

    // Planeten, met een kleine spreiding als ze te dicht op elkaar staan.
    var lijst = chart.namen.filter(function (n) { return n !== 'mc' && n !== 'asc'; })
      .map(function (n) { return { naam: n, lon: chart.punten[n].lon }; })
      .sort(function (p, q) { return p.lon - q.lon; });
    var vorige = -99, laag = 0;
    lijst.forEach(function (p) {
      var verschil = Math.abs(A.norm180(p.lon - vorige));
      laag = verschil < 9 ? laag + 1 : 0;
      if (laag > 2) laag = 0;
      vorige = p.lon;
      var r = rBinnen - 16 - laag * 20;
      var pos = px(p.lon, r);
      var glyf = (C.PLANETEN[p.naam] || {}).symbool || '?';
      o.push('<text class="planeetglyf" x="' + pos[0].toFixed(1) + '" y="' + (pos[1] + 5).toFixed(1) + '">' + glyf + '</text>');
      var gpos = px(p.lon, r - 15);
      o.push('<text class="graadtekst" x="' + gpos[0].toFixed(1) + '" y="' + (gpos[1] + 3).toFixed(1) + '">' +
             Math.floor(p.lon % 30) + '°</text>');
    });

    o.push('</svg>');
    return o.join('');
  }

  /* ---- maanschijf ---- */

  function maanSVG(verlichting, wassend, maat) {
    var S = maat || 180, R = S / 2 - 6, cx = S / 2, cy = S / 2;
    var k = Math.max(0, Math.min(1, verlichting));
    var rx = Math.abs(R * (1 - 2 * k));
    // Bij een gibbeuze maan buigt de terminator naar de donkere kant (sweep 1),
    // bij een sikkel juist mee met de verlichte rand (sweep 0).
    var sweep2 = k < 0.5 ? 0 : 1;
    var pad = 'M ' + cx + ' ' + (cy - R) +
              ' A ' + R + ' ' + R + ' 0 0 1 ' + cx + ' ' + (cy + R) +
              ' A ' + rx.toFixed(2) + ' ' + R + ' 0 0 ' + sweep2 + ' ' + cx + ' ' + (cy - R) + ' Z';
    return '<svg class="maanschijf" width="' + S + '" height="' + S + '" viewBox="0 0 ' + S + ' ' + S + '" role="img">' +
      '<defs><radialGradient id="maanlicht" cx="35%" cy="30%">' +
      '<stop offset="0%" stop-color="#fff8e6"/><stop offset="70%" stop-color="#e8dcc0"/>' +
      '<stop offset="100%" stop-color="#b9ad92"/></radialGradient></defs>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#16181d" stroke="rgba(255,255,255,.12)"/>' +
      '<g transform="' + (wassend ? '' : 'translate(' + S + ',0) scale(-1,1)') + '">' +
      '<path d="' + pad + '" fill="url(#maanlicht)"/></g>' +
      '<circle cx="' + (cx - R * 0.3) + '" cy="' + (cy - R * 0.25) + '" r="' + (R * 0.13) + '" fill="rgba(0,0,0,.07)"/>' +
      '<circle cx="' + (cx + R * 0.25) + '" cy="' + (cy + R * 0.3) + '" r="' + (R * 0.1) + '" fill="rgba(0,0,0,.06)"/>' +
      '<circle cx="' + (cx + R * 0.05) + '" cy="' + (cy + R * 0.05) + '" r="' + (R * 0.17) + '" fill="rgba(0,0,0,.05)"/>' +
      '</svg>';
  }

  /* ================= navigatie ================= */

  var TABS = [
    { pad: '#/vandaag', label: 'Vandaag', icoon: 'moon' },
    { pad: '#/geboorte', label: 'Geboorte', icoon: 'sun' },
    { pad: '#/ontdekken', label: 'Ontdekken', icoon: 'compass' },
    { pad: '#/match', label: 'Match', icoon: 'heart' },
    { pad: '#/profiel', label: 'Profiel', icoon: 'person' }
  ];

  function tekenNav(actief) {
    navigatie.innerHTML = TABS.map(function (t) {
      return '<a href="' + t.pad + '" class="' + (t.pad === actief ? 'actief' : '') + '">' +
        ico(t.icoon) + '<span>' + t.label + '</span></a>';
    }).join('');
    navigatie.hidden = false;
  }

  function ga(pad) { location.hash = pad; }

  /* ================= schermen ================= */

  var schermen = {};

  /* ---- onboarding ---- */

  schermen.welkom = function () {
    navigatie.hidden = true;
    return '<div style="min-height:70dvh;display:flex;flex-direction:column;justify-content:center;gap:32px" class="opduiken">' +
      '<div class="kolom" style="gap:20px;text-align:center">' +
      '<div style="font-size:56px;line-height:1">☾</div>' +
      '<h1 class="display gloed">Het universum is persoonlijker dan je denkt.</h1>' +
      '<p class="body-lg zacht">Ontdek hoe planeten, sterrenbeelden en kosmische cycli samenhangen met je ' +
      'persoonlijkheid, je relaties en je dagelijks leven.</p></div>' +
      '<div class="kolom" style="gap:12px">' +
      '<button class="knop knop-primair knop-vol" data-actie="start">Beginnen</button>' +
      '<p class="hint" style="text-align:center">LUNA rekent alles uit op je eigen toestel. ' +
      'Je geboortegegevens blijven in deze browser.</p></div></div>';
  };

  /* ---- geboortegegevens ---- */

  var formulier = null;

  function startFormulier(doel) {
    var bron = doel === 'profiel' ? staat.profiel
             : staat.relaties.filter(function (r) { return r.id === doel; })[0];
    formulier = {
      doel: doel,
      naam: bron ? bron.naam : '',
      datum: bron ? bron.datum : '',
      tijd: bron ? bron.tijd : '',
      tijdBekend: bron ? bron.tijdBekend !== false : true,
      plaats: bron ? bron.plaats : null,
      zoekterm: bron && bron.plaats ? bron.plaats.naam : '',
      handmatig: false
    };
  }

  schermen.gegevens = function (params) {
    var doel = params[0] || 'profiel';
    if (!formulier || formulier.doel !== doel) startFormulier(doel);
    var f = formulier;
    var isRelatie = doel !== 'profiel';
    var suggesties = f.plaats || !f.zoekterm ? [] : PL.zoek(f.zoekterm);

    return '<section class="kolom opduiken" style="gap:8px">' +
      '<p class="label-caps goud">' + (isRelatie ? 'Iemand toevoegen' : 'Jouw geboortemoment') + '</p>' +
      '<h1 class="headline-lg">Geboortegegevens</h1>' +
      '<p class="body-lg zacht">' + (isRelatie
        ? 'Met de geboortegegevens van iemand anders kun je de dynamiek tussen jullie horoscopen bekijken.'
        : 'Ontdek de blauwdruk van je geboortemoment.') + '</p></section>' +

      '<form class="glas vulling kolom" style="gap:22px" data-formulier>' +
      '<div class="veld"><label for="v-naam">Naam</label>' +
      '<input id="v-naam" data-veld="naam" value="' + esc(f.naam) + '" placeholder="Hoe heet je?" autocomplete="name"></div>' +

      '<div class="veld"><label for="v-datum">Geboortedatum</label>' +
      '<input id="v-datum" type="date" data-veld="datum" value="' + esc(f.datum) + '" min="1900-01-01" max="2100-12-31"></div>' +

      '<div class="veld"><label for="v-tijd">Exacte geboortetijd</label>' +
      '<input id="v-tijd" type="time" data-veld="tijd" value="' + esc(f.tijd) + '"' + (f.tijdBekend ? '' : ' disabled') + '></div>' +

      '<label class="rij" style="gap:10px;cursor:pointer">' +
      '<input type="checkbox" data-veld="tijdOnbekend" ' + (f.tijdBekend ? '' : 'checked') +
      ' style="width:18px;height:18px;accent-color:var(--primary)">' +
      '<span class="body-sm zacht">Ik weet mijn geboortetijd niet</span></label>' +

      '<div class="rij" style="gap:10px;align-items:flex-start">' + ico('info', 'icoon-klein') +
      '<p class="hint">Met de exacte geboortetijd kunnen ascendant, midhemel en huizen worden berekend. ' +
      'Zonder tijd rekenen we met 12:00 en tonen we alleen de planeetstanden.</p></div>' +

      '<hr class="deelbalk">' +

      '<div class="veld"><label for="v-plaats">Geboorteplaats</label>' +
      '<input id="v-plaats" data-veld="plaats" value="' + esc(f.zoekterm) + '" placeholder="Zoek een stad" autocomplete="off"></div>' +
      (suggesties.length
        ? '<div class="glas" style="overflow:hidden">' + suggesties.map(function (p) {
            return '<button type="button" class="lijst-rij" data-kies-plaats="' + esc(p.naam) + '">' +
              ico('compass', 'icoon-klein') + '<span>' + esc(p.naam) + '</span>' +
              '<span class="gedempt body-sm">' + esc(p.land) + '</span></button>';
          }).join('') + '</div>'
        : '') +
      (f.plaats
        ? '<div class="rij" style="gap:8px;color:var(--primary)">' + ico('check', 'icoon-klein') +
          '<span class="body-sm">' + esc(f.plaats.naam) + ' — ' + f.plaats.lat.toFixed(2) + '°, ' +
          f.plaats.lon.toFixed(2) + '° (' + esc(f.plaats.tz) + ')</span></div>'
        : '') +
      '<button type="button" class="knop knop-spook" data-actie="handmatig" style="align-self:flex-start;padding:8px 16px;font-size:13px">' +
      (f.handmatig ? 'Verberg handmatige invoer' : 'Plaats staat er niet bij') + '</button>' +
      (f.handmatig
        ? '<div class="kolom" style="gap:14px">' +
          '<div class="veld"><label for="v-lat">Breedtegraad (noord is positief)</label>' +
          '<input id="v-lat" data-veld="lat" inputmode="decimal" placeholder="52.37" value="' + (f.plaats ? f.plaats.lat : '') + '"></div>' +
          '<div class="veld"><label for="v-lon">Lengtegraad (oost is positief)</label>' +
          '<input id="v-lon" data-veld="lon" inputmode="decimal" placeholder="4.90" value="' + (f.plaats ? f.plaats.lon : '') + '"></div>' +
          '<div class="veld"><label for="v-tz">Tijdzone</label><select id="v-tz" data-veld="tz">' +
          tijdzoneOpties(f.plaats ? f.plaats.tz : null) + '</select></div>' +
          '<button type="button" class="knop knop-spook" data-actie="handmatig-opslaan">Deze plaats gebruiken</button></div>'
        : '') +

      '<button type="button" class="knop knop-primair knop-vol" data-actie="opslaan"' +
      (f.naam && f.datum && f.plaats ? '' : ' disabled') + '>' +
      (isRelatie ? 'Toevoegen' : 'Mijn horoscoop berekenen') + '</button>' +
      '</form>';
  };

  function tijdzoneOpties(gekozen) {
    var zones = ['Europe/Amsterdam', 'Europe/Brussels', 'Europe/Berlin', 'Europe/London',
      'Europe/Paris', 'Europe/Madrid', 'Europe/Rome', 'Europe/Warsaw', 'Europe/Istanbul',
      'Europe/Moscow', 'Africa/Casablanca', 'Africa/Cairo', 'Africa/Lagos',
      'Africa/Nairobi', 'Africa/Johannesburg', 'America/New_York', 'America/Chicago',
      'America/Denver', 'America/Los_Angeles', 'America/Toronto', 'America/Mexico_City',
      'America/Bogota', 'America/Lima', 'America/Sao_Paulo', 'America/Paramaribo',
      'America/Curacao', 'America/Argentina/Buenos_Aires', 'Asia/Jerusalem', 'Asia/Dubai',
      'Asia/Karachi', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Singapore',
      'Asia/Manila', 'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Seoul', 'Asia/Tokyo',
      'Australia/Sydney', 'Pacific/Auckland', 'UTC'];
    var eigen = null;
    try { eigen = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    if (eigen && zones.indexOf(eigen) < 0) zones.unshift(eigen);
    return zones.map(function (z) {
      return '<option value="' + esc(z) + '"' + (z === (gekozen || eigen) ? ' selected' : '') + '>' + esc(z) + '</option>';
    }).join('');
  }

  /* ---- vandaag ---- */

  schermen.vandaag = function () {
    var nu = new Date(), jd = nuJD();
    var natal = mijnHoroscoop();
    var inzicht = D.dagInzicht(natal, jd, nu);
    var s = inzicht.scores;
    var p = natal.punten;

    var kop = '<section class="kolom opduiken" style="gap:8px">' +
      '<p class="label-caps goud">' + esc(datumLang(nu)) + '</p>' +
      '<h1 class="display">' + groet(nu) + ',<br>' + esc(staat.profiel.naam.split(' ')[0]) + '</h1>' +
      (eigenMerk(natal) ? '<div>' + eigenMerk(natal) + '</div>' : '') + '</section>';

    var trio = driehoekje([
      { icoon: 'sun', kleur: 'var(--primary)', label: 'Zon', waarde: D.tekenNaam(p.zon.teken) },
      { icoon: 'moon', kleur: 'var(--secondary)', label: 'Maan', waarde: D.tekenNaam(p.maan.teken) },
      p.asc
        ? { icoon: 'arrow-up', kleur: 'var(--tertiary)', label: 'Ascendant', waarde: D.tekenNaam(p.asc.teken) }
        : { icoon: 'clock', kleur: 'var(--outline)', label: 'Ascendant', waarde: 'tijd onbekend' }
    ]);

    var energie = '<section class="glas vulling kolom opduiken" style="gap:16px;overflow:hidden;cursor:pointer" data-ga="#/inzicht">' +
      '<div style="position:absolute;inset:0;background:radial-gradient(120% 90% at 80% 20%,rgba(229,195,102,.16),rgba(17,20,23,0) 60%),' +
      'radial-gradient(90% 80% at 10% 90%,rgba(87,27,193,.28),rgba(17,20,23,0) 65%);pointer-events:none"></div>' +
      '<div class="rij-tussen" style="align-items:flex-start;position:relative">' +
      '<div class="kolom" style="gap:6px"><p class="label-caps goud">Jouw energie vandaag</p>' +
      '<h2 class="headline-lg gloed">' + esc(inzicht.titel) + '</h2></div>' +
      '<span class="goud">' + ico('sparkle') + '</span></div>' +
      '<p class="body-lg zacht" style="position:relative">' + esc(D.energieZin(inzicht)) + '</p>' +
      '<div class="rij" style="gap:16px;position:relative">' + ring(s.afstemming, 64) +
      '<span>Kosmische afstemming</span></div></section>';

    var gebieden = [
      { label: 'Liefde', icoon: 'heart', kleur: 'var(--rose)', waarde: s.liefde },
      { label: 'Carrière', icoon: 'briefcase', kleur: 'var(--secondary)', waarde: s.carriere },
      { label: 'Energie', icoon: 'bolt', kleur: 'var(--primary)', waarde: s.energie },
      { label: 'Sociaal', icoon: 'users', kleur: 'var(--tertiary)', waarde: s.sociaal },
      { label: 'Groei', icoon: 'growth', kleur: 'var(--plum)', waarde: s.groei }
    ];

    var focus = '<section class="sectie opduiken"><h3 class="headline-sm">Focusgebieden</h3>' +
      '<div class="strook">' + gebieden.map(function (g) {
        return '<div class="glas vulling-klein kolom" style="min-width:140px;gap:10px">' +
          '<div class="rij-tussen"><span style="color:' + g.kleur + '">' + ico(g.icoon) + '</span>' +
          '<span class="body-sm" style="color:' + g.kleur + '">' + g.waarde + '%</span></div>' +
          '<div>' + g.label + '</div></div>';
      }).join('') + '</div>' +
      '<p class="hint">De percentages volgen uit de aspecten die de lopende planeten vandaag maken met je ' +
      'geboortehoroscoop. Harmonische aspecten tellen op, spanningsaspecten af.</p></section>';

    var fase = inzicht.fase;
    var maankaart = '<section class="glas vulling rij opduiken" style="gap:18px;cursor:pointer" data-ga="#/maan">' +
      maanSVG(fase.verlichting, fase.wassend, 72) +
      '<div class="kolom" style="gap:4px;flex:1"><p class="label-caps goud">' + esc(fase.naam) + '</p>' +
      '<strong>Maan in ' + esc(D.tekenNaam(fase.maanTeken)) + '</strong>' +
      '<span class="body-sm zacht">Verlichting ' + Math.round(fase.verlichting * 100) + '%</span></div>' +
      '<span class="gedempt">' + ico('chevron-right') + '</span></section>';

    var topTransits = inzicht.transits.slice(0, 3).map(function (t) {
      var tt = D.transitTekst(t);
      return '<div class="glas vulling-klein kolom" style="gap:8px">' +
        '<div class="rij" style="gap:8px"><span class="chip ' + tt.aard + '">' + esc(tt.invloed) + '</span>' +
        (t.aanlopend ? '<span class="chip">wordt exacter</span>' : '') + '</div>' +
        '<strong class="headline-sm">' + esc(tt.titel) + '</strong>' +
        '<span class="body-sm zacht">' + esc(tt.tekst) + '</span></div>';
    }).join('');

    var transits = '<section class="sectie opduiken">' +
      '<div class="rij-tussen"><h3 class="headline-sm">Wat speelt er nu</h3>' +
      '<a href="#/transits" class="body-sm goud" style="text-decoration:none">Alles bekijken</a></div>' +
      (topTransits || '<p class="hint">Op dit moment maken de lopende planeten geen sterke aspecten met je horoscoop. ' +
       'Een rustige dag, astrologisch gezien.</p>') + '</section>';

    return kop + trio + energie + focus + maankaart + transits;
  };

  /* ---- dagelijks inzicht ---- */

  schermen.inzicht = function () {
    var nu = new Date();
    var natal = mijnHoroscoop();
    var inz = D.dagInzicht(natal, nuJD(), nu);
    var s = inz.scores;

    var domeinen = [
      { titel: 'Liefde', icoon: 'heart', waarde: s.liefde,
        tekst: duidingDomein('liefde', s.liefde) },
      { titel: 'Carrière', icoon: 'briefcase', waarde: s.carriere,
        tekst: duidingDomein('carriere', s.carriere) },
      { titel: 'Energie', icoon: 'bolt', waarde: s.energie,
        tekst: duidingDomein('energie', s.energie) }
    ];

    return '<section class="kolom opduiken" style="gap:10px">' +
      '<p class="label-caps goud">' + esc(datumLang(nu)) + '</p>' +
      '<h1 class="headline-lg">Jouw dagelijkse inzicht</h1>' +
      '<p class="body-lg zacht">Een diepere blik op de kosmische stromen die vandaag door je horoscoop lopen.</p></section>' +

      '<section class="glas vulling kolom opduiken" style="gap:12px">' +
      '<div class="rij" style="gap:8px"><span class="goud">' + ico('sparkle') + '</span>' +
      '<span class="label-caps goud">Hoofdthema</span></div>' +
      '<h2 class="headline-md">' + esc(inz.thema) + '</h2>' +
      '<p class="body-lg zacht">' + esc(inz.tekst) + '</p></section>' +

      domeinen.map(function (d) {
        return '<section class="glas vulling kolom opduiken" style="gap:10px">' +
          '<div class="rij-tussen"><div class="rij" style="gap:10px"><span class="goud">' + ico(d.icoon) + '</span>' +
          '<strong class="headline-sm">' + d.titel + '</strong></div>' +
          '<span class="goud body-sm">' + d.waarde + '%</span></div>' +
          '<div class="balk"><i style="width:' + d.waarde + '%"></i></div>' +
          '<p class="body-sm zacht">' + esc(d.tekst) + '</p></section>';
      }).join('') +

      '<section class="glas vulling kolom opduiken" style="gap:12px;text-align:center">' +
      '<p class="label-caps goud">Jouw kosmische advies</p>' +
      '<p class="headline-md gloed">&bdquo;' + esc(inz.advies) + '&rdquo;</p>' +
      '<button class="knop knop-spook" data-actie="bewaar-inzicht">' + ico('bookmark', 'icoon-klein') +
      ' Inzicht bewaren</button></section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">De standen waar dit op gebaseerd is</h3>' +
      '<div class="glas" style="overflow:hidden">' + inz.transits.slice(0, 8).map(function (t) {
        var tt = D.transitTekst(t);
        return '<div class="lijst-rij" style="cursor:default"><span class="glyf goud">' +
          (C.PLANETEN[t.transit].symbool) + '</span>' +
          '<div class="kolom" style="gap:2px;flex:1"><span>' + esc(tt.titel) + '</span>' +
          '<span class="body-sm gedempt">orb ' + t.orb.toFixed(1) + '° · ' + esc(tt.duur) + '</span></div>' +
          '<span class="chip ' + tt.aard + '">' + C.ASPECTEN[t.type].teken + '</span></div>';
      }).join('') + '</div></section>';
  };

  function duidingDomein(domein, waarde) {
    var teksten = {
      liefde: ['Contact vraagt vandaag geduld; neem niet alles persoonlijk.',
               'Een gewone dag voor liefde: niets forceren, wel aandacht geven.',
               'Kwetsbaarheid is vandaag je grootste kracht. Een open gesprek gaat verder dan je verwacht.'],
      carriere: ['Weerstand op je werk vraagt om bijstellen, niet om harder duwen.',
                 'Werk gaat zijn gang. Doe het saaie deel eerst, dan loopt de rest vanzelf.',
                 'Focus op afronden. Wat je vandaag aanpakt, krijgt medewind.'],
      energie: ['Je reserves zijn beperkt. Plan minder dan je zou willen en rust bewust.',
                'Je energie is stabiel: goed voor langere taken, minder voor pieken.',
                'Er is fysiek veel beschikbaar. Gebruik het, anders wordt het onrust.'],
      sociaal: ['Gesprekken lopen stroef; luister meer dan je zegt.',
                'Sociaal gezien een neutrale dag.',
                'Mensen zoeken je op. Een goed moment om iets te vragen of te delen.'],
      groei: ['Groei zit vandaag in stilstaan en kijken wat er eigenlijk speelt.',
              'Rustige dag voor ontwikkeling: geen doorbraak, wel voortgang.',
              'Er is beweging in een thema waar je al langer aan werkt.']
    };
    var i = waarde < 42 ? 0 : waarde < 62 ? 1 : 2;
    return teksten[domein][i];
  }

  /* ---- geboortehoroscoop ---- */

  schermen.geboorte = function () {
    var natal = mijnHoroscoop();
    var p = natal.punten;
    var volgorde = ['zon', 'maan', 'asc', 'mercurius', 'venus', 'mars', 'jupiter',
                    'saturnus', 'uranus', 'neptunus', 'pluto', 'mc', 'knoop'];

    var rijen = volgorde.filter(function (k) { return p[k]; }).map(function (k) {
      var d = D.planeetInTeken(k, p[k].teken);
      return '<a class="lijst-rij" href="#/punt/' + k + '">' +
        '<span class="bol goud"><span class="glyf">' + C.PLANETEN[k].symbool + '</span></span>' +
        '<div class="kolom" style="gap:2px;flex:1">' +
        '<span class="headline-sm">' + esc(d.titel) + '</span>' +
        '<span class="body-sm zacht">' + esc(C.PLANETEN[k].thema) +
        (p[k].huis ? ' · ' + p[k].huis + 'e huis' : '') +
        (p[k].retrograde && k !== 'knoop' ? ' · retrograde' : '') + '</span></div>' +
        '<span class="pijl">' + ico('chevron-right') + '</span></a>';
    }).join('');

    var aspecten = natal.aspecten.slice(0, 10).map(function (a) {
      var t = D.aspectTekst(a.a, a.b, a.type);
      return '<details class="uitklap glas" style="margin-bottom:10px"><summary>' +
        '<span class="chip ' + t.aard + '">' + C.ASPECTEN[a.type].teken + '</span>' +
        '<div class="kolom" style="gap:2px;flex:1"><span>' + esc(t.titel) + '</span>' +
        '<span class="body-sm gedempt">orb ' + a.orb.toFixed(1) + '°</span></div>' +
        '<span class="chevron">' + ico('chevron-down') + '</span></summary>' +
        '<div class="inhoud"><p class="body-sm zacht">' + esc(t.tekst) + '</p></div></details>';
    }).join('');

    return '<section class="kolom opduiken" style="gap:10px;text-align:center">' +
      '<h1 class="display goud">Jouw kosmische blauwdruk</h1>' +
      '<p class="body-lg zacht">De stand van de hemel op het moment van je geboorte.</p></section>' +

      '<section class="glas vulling kolom opduiken" style="gap:12px;align-items:center">' +
      wielSVG(natal, 340) +
      (eigenMerk(natal) ? '<div>' + eigenMerk(natal) + '</div>' : '') +
      '<p class="label-caps gedempt">' + esc(staat.profiel.naam) + ' · ' +
      esc(datumKort(new Date(staat.profiel.datum))) + ' ' + new Date(staat.profiel.datum).getFullYear() +
      (staat.profiel.tijdBekend ? ' · ' + esc(staat.profiel.tijd) : '') +
      ' · ' + esc(staat.profiel.plaats.naam) + '</p>' +
      (natal.eigenHuizen
        ? '<p class="hint">Huizen volgens de cuspen die je zelf hebt aangeleverd.</p>'
        : natal.huizen ? '<p class="hint">Huizen volgens het hele-tekensysteem: elk huis beslaat precies een sterrenbeeld, ' +
        'te beginnen bij je ascendant.</p>'
        : '<p class="hint">Zonder geboortetijd geen ascendant, midhemel of huizen. ' +
          'Vul je tijd aan in je profiel als je die alsnog vindt.</p>') +
      '</section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Je planeten</h3>' +
      '<div class="glas" style="overflow:hidden">' + rijen + '</div></section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Sterkste aspecten</h3>' + aspecten +
      '<p class="hint">Aspecten zijn de hoeken tussen twee punten. Ze vertellen hoe die twee delen van jou ' +
      'zich tot elkaar verhouden.</p></section>';
  };

  /* ---- detail van een punt ---- */

  schermen.punt = function (params) {
    var k = params[0];
    var natal = mijnHoroscoop();
    var punt = natal.punten[k];
    if (!punt) return '<div class="leeg">Dit punt staat niet in je horoscoop.</div>';
    var d = D.planeetInTeken(k, punt.teken);
    var t = C.TEKENS[punt.teken];

    var kop = '<section class="kolom opduiken" style="gap:12px">' +
      '<div class="rij" style="gap:14px">' +
      '<span class="bol goud" style="width:56px;height:56px"><span class="glyf" style="font-size:26px">' +
      C.PLANETEN[k].symbool + '</span></span>' +
      '<div class="kolom" style="gap:2px"><h1 class="headline-lg">' + esc(d.titel) + '</h1>' +
      '<span class="body-sm zacht">' + esc(C.PLANETEN[k].thema) + '</span></div></div>' +
      '<div class="rij" style="gap:8px;flex-wrap:wrap">' +
      '<span class="chip">' + esc(D.graadTekst(punt.lon)) + '</span>' +
      (punt.huis ? '<span class="chip">' + punt.huis + 'e huis</span>' : '') +
      '<span class="chip">' + esc(t.element) + '</span>' +
      '<span class="chip">' + esc(t.kwaliteit) + '</span>' +
      (punt.retrograde && k !== 'knoop' ? '<span class="chip spanning">retrograde</span>' : '') +
      '</div></section>' +
      '<section class="glas vulling opduiken"><p class="headline-md gloed" style="text-align:center">' +
      '&bdquo;' + esc(d.kern) + '&rdquo;</p></section>' +
      '<section class="glas vulling opduiken"><p class="body-lg zacht">' + esc(d.tekst) + '</p></section>';

    var extra = '';
    if (k === 'zon') {
      extra = '<section class="glas vulling kolom opduiken" style="gap:14px">' +
        '<div class="rij" style="gap:10px"><span class="goud">' + ico('star') + '</span>' +
        '<strong class="headline-sm">Je kracht</strong></div>' +
        '<p class="body-sm zacht">' + esc(d.kracht) + '</p><hr class="deelbalk">' +
        '<div class="rij" style="gap:10px"><span style="color:var(--rose)">' + ico('warning') + '</span>' +
        '<strong class="headline-sm">Je valkuil</strong></div>' +
        '<p class="body-sm zacht">' + esc(d.valkuil) + '</p></section>';
    } else if (k === 'maan' && d.detail) {
      var m = d.detail;
      extra =
        '<section class="sectie opduiken"><div class="rij" style="gap:10px"><span class="goud">' + ico('sparkle') +
        '</span><h3 class="headline-sm">Sterke punten</h3></div>' +
        m.sterk.map(function (s) {
          return '<div class="glas vulling-klein rij" style="gap:12px;align-items:flex-start">' +
            '<span class="goud">' + ico('star', 'icoon-klein') + '</span>' +
            '<div class="kolom" style="gap:2px"><strong>' + esc(s.titel) + '</strong>' +
            '<span class="body-sm zacht">' + esc(s.tekst) + '</span></div></div>';
        }).join('') + '</section>' +

        '<section class="sectie opduiken"><div class="rij" style="gap:10px">' +
        '<span style="color:var(--secondary)">' + ico('drop') + '</span>' +
        '<h3 class="headline-sm">Kernbehoeften</h3></div>' +
        '<p class="body-sm zacht">Om emotioneel in balans te blijven vraagt jouw maan om een paar ankers:</p>' +
        '<div class="glas" style="overflow:hidden">' + m.behoeften.map(function (b) {
          return '<div class="lijst-rij" style="cursor:default">' + ico(b.icoon) +
            '<span>' + esc(b.tekst) + '</span></div>';
        }).join('') + '</div></section>' +

        '<section class="sectie opduiken"><div class="rij" style="gap:10px">' +
        '<span style="color:var(--rose)">' + ico('warning') + '</span>' +
        '<h3 class="headline-sm">Uitdagingen</h3></div>' +
        m.uitdagingen.map(function (u) {
          return '<div class="glas vulling-klein kolom" style="gap:4px">' +
            '<strong>' + esc(u.titel) + '</strong>' +
            '<span class="body-sm zacht">' + esc(u.tekst) + '</span></div>';
        }).join('') + '</section>' +

        '<section class="glas vulling kolom opduiken" style="gap:10px">' +
        '<div class="rij" style="gap:10px"><span style="color:var(--rose)">' + ico('heart') + '</span>' +
        '<strong class="headline-sm">In relaties</strong></div>' +
        '<p class="body-sm zacht">' + esc(m.relaties) + '</p>' +
        '<p class="body-lg goud" style="text-align:center;margin-top:8px">&bdquo;' + esc(m.slot) + '&rdquo;</p></section>';
    }

    var huis = punt.huis
      ? '<section class="glas vulling kolom opduiken" style="gap:8px">' +
        '<div class="rij" style="gap:10px"><span class="goud">' + ico('home') + '</span>' +
        '<strong class="headline-sm">' + esc(C.HUIZEN[punt.huis - 1].naam) + ': ' +
        esc(C.HUIZEN[punt.huis - 1].thema) + '</strong></div>' +
        '<p class="body-sm zacht">' + esc(D.planeetInHuis(k, punt.huis)) + '</p></section>'
      : '';

    var aspecten = natal.aspecten.filter(function (a) { return a.a === k || a.b === k; });
    var aspectBlok = aspecten.length
      ? '<section class="sectie opduiken"><h3 class="headline-sm">Aspecten met ' + esc(C.PLANETEN[k].naam) + '</h3>' +
        aspecten.map(function (a) {
          var ander = a.a === k ? a.b : a.a;
          var tt = D.aspectTekst(k, ander, a.type);
          return '<div class="glas vulling-klein kolom" style="gap:6px">' +
            '<div class="rij" style="gap:8px"><span class="chip ' + tt.aard + '">' +
            C.ASPECTEN[a.type].teken + '</span><strong>' + esc(tt.titel) + '</strong></div>' +
            '<span class="body-sm zacht">' + esc(tt.tekst) + '</span></div>';
        }).join('') + '</section>'
      : '';

    return kop + extra + huis + aspectBlok;
  };

  /* ---- maanfase ---- */

  schermen.maan = function () {
    var jd = nuJD();
    var fase = A.moonPhase(jd);
    var info = C.MAANFASEN[fase.index];
    var volle = A.nextPhaseJD(jd, 180), nieuwe = A.nextPhaseJD(jd, 0);
    var natal = mijnHoroscoop();
    var maanNataal = natal.punten.maan;
    var iconen = ['check', 'self', 'palette', 'chat'];

    var wissel = A.nextSignChange('maan', jd, 3);

    return '<section class="kolom opduiken" style="gap:18px;align-items:center;text-align:center">' +
      maanSVG(fase.verlichting, fase.wassend, 200) +
      '<h1 class="display goud gloed">' + esc(fase.naam) + '</h1>' +
      '<div class="rij" style="gap:8px;justify-content:center">' + ico('moon-full', 'icoon-klein') +
      '<span class="zacht">Verlichting: ' + Math.round(fase.verlichting * 100) + '%</span></div>' +
      '<p class="body-lg zacht">' + esc(info.tekst) + '</p></section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm goud">Goed voor vandaag</h3>' +
      '<div class="raster-2">' + info.goedVoor.map(function (g, i) {
        return '<div class="glas vulling-klein kolom" style="gap:8px;align-items:center;text-align:center">' +
          '<span class="goud">' + ico(iconen[i]) + '</span>' +
          '<span class="label-caps zacht">' + esc(g) + '</span></div>';
      }).join('') + '</div></section>' +

      '<section class="glas vulling kolom opduiken" style="gap:10px">' +
      '<p class="label-caps goud">De maan nu</p>' +
      '<p class="body-lg">Maan op ' + esc(D.graadTekst(fase.maanLon)) + '</p>' +
      '<p class="body-sm zacht">' + esc(C.TEKENS[fase.maanTeken].kern) + ' ' +
      'De maan wisselt ongeveer elke tweeënhalve dag van teken; dat kleurt de sfeer van de dag.</p>' +
      (wissel ? '<p class="body-sm gedempt">Gaat naar ' + esc(D.tekenNaam(wissel.teken)) + ' op ' +
        esc(datumTijd(A.dateFromJD(wissel.jd))) + '.</p>' : '') +
      '<hr class="deelbalk">' +
      '<p class="body-sm zacht">Jouw geboortemaan staat in ' + esc(D.tekenNaam(maanNataal.teken)) + '. ' +
      esc(C.MAAN_IN_TEKEN[maanNataal.teken].citaat) + '</p></section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Komende fasen</h3>' +
      [[volle, 'Volle Maan', 'moon-full'], [nieuwe, 'Nieuwe Maan', 'moon']]
        .filter(function (x) { return x[0]; })
        .sort(function (a, b) { return a[0] - b[0]; })
        .map(function (x) {
          var d = A.dateFromJD(x[0]);
          var t = Math.floor(A.moonPosition(x[0]).lon / 30);
          return '<div class="glas vulling-klein rij" style="gap:14px">' +
            '<span class="bol goud">' + ico(x[2]) + '</span>' +
            '<div class="kolom" style="gap:2px;flex:1"><span class="label-caps gedempt">' + x[1] + '</span>' +
            '<strong>' + esc(datumTijd(d)) + ' · in ' + esc(D.tekenNaam(t)) + '</strong></div></div>';
        }).join('') + '</section>';
  };

  /* ---- transits ---- */

  schermen.transits = function () {
    var natal = mijnHoroscoop();
    var trs = A.transits(natal, nuJD()).filter(function (t) { return t.sterkte > 0.12; });

    var kaarten = trs.slice(0, 15).map(function (t) {
      var tt = D.transitTekst(t);
      return '<article class="glas vulling kolom opduiken" style="gap:12px">' +
        '<div class="rij" style="gap:8px;flex-wrap:wrap">' +
        '<span class="chip ' + tt.aard + '">' + esc(tt.invloed) + '</span>' +
        '<span class="chip">' + esc(tt.duur) + '</span>' +
        (t.aanlopend ? '<span class="chip neutraal">wordt exacter</span>' : '<span class="chip">loopt uit</span>') +
        (t.retrograde ? '<span class="chip spanning">Rx</span>' : '') + '</div>' +
        '<div class="rij" style="gap:12px">' +
        '<span class="glyf goud">' + C.PLANETEN[t.transit].symbool + '</span>' +
        '<span class="gedempt">' + C.ASPECTEN[t.type].teken + '</span>' +
        '<span class="glyf" style="color:var(--secondary)">' + C.PLANETEN[t.natal].symbool + '</span>' +
        '<strong class="headline-sm" style="flex:1">' + esc(tt.titel) + '</strong></div>' +
        '<p class="body-sm zacht">' + esc(tt.tekst) + '</p>' +
        '<p class="body-sm gedempt">Lopende ' + esc(C.PLANETEN[t.transit].naam.toLowerCase()) + ' op ' +
        esc(D.graadTekst(t.lonTransit, true)) + ' · jouw ' + esc(C.PLANETEN[t.natal].naam.toLowerCase()) +
        ' op ' + esc(D.graadTekst(natal.punten[t.natal].lon, true)) + ' · orb ' + t.orb.toFixed(1) + '°</p>' +
        '</article>';
    }).join('');

    return '<section class="kolom opduiken" style="gap:10px">' +
      '<h1 class="headline-lg">Planetaire transities</h1>' +
      '<p class="body-lg zacht">Kosmische bewegingen die nu in verbinding staan met jouw geboortehoroscoop.</p></section>' +
      (kaarten || '<div class="leeg">Op dit moment zijn er geen aspecten binnen orb.</div>') +
      '<p class="hint">Een transit werkt zolang het aspect binnen orb blijft. Hoe trager de planeet, ' +
      'hoe langer dat duurt: de maan enkele uren, Pluto soms jaren.</p>';
  };

  /* ---- ontdekken ---- */

  var CATEGORIEEN = [
    { id: 'sterrenbeelden', label: 'Sterrenbeelden', icoon: 'star' },
    { id: 'planeten', label: 'Planeten', icoon: 'globe' },
    { id: 'huizen', label: 'Huizen', icoon: 'home' },
    { id: 'aspecten', label: 'Aspecten', icoon: 'link' },
    { id: 'retrogrades', label: 'Retrogrades', icoon: 'refresh' },
    { id: 'maanfasen', label: 'Maanfasen', icoon: 'moon' }
  ];

  schermen.ontdekken = function (params) {
    if (params[0]) return categorieScherm(params[0]);
    var hemel = D.hemelNu(nuJD());

    return '<section class="kolom opduiken" style="gap:10px">' +
      '<h1 class="headline-lg">Ontdekken</h1>' +
      '<p class="body-lg zacht">De taal van de astrologie, en wat er op dit moment aan de hemel gebeurt.</p></section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Categorieën</h3>' +
      '<div class="raster-3">' + CATEGORIEEN.map(function (c) {
        return '<a href="#/ontdekken/' + c.id + '" class="glas vulling-klein kolom" ' +
          'style="gap:8px;align-items:center;text-align:center;text-decoration:none;color:inherit">' +
          '<span class="goud">' + ico(c.icoon) + '</span>' +
          '<span class="body-sm">' + c.label + '</span></a>';
      }).join('') + '</div></section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Wat gebeurt er aan de hemel</h3>' +
      hemel.items.map(function (i) {
        return '<div class="glas vulling kolom" style="gap:8px">' +
          '<div class="rij" style="gap:8px"><span class="goud">' + ico(i.icoon, 'icoon-klein') + '</span>' +
          '<span class="label-caps gedempt">' + esc(i.label) + '</span>' +
          (i.datum ? '<span class="chip" style="margin-left:auto">' + esc(datumKort(i.datum)) + '</span>' : '') +
          '</div><strong class="headline-sm">' + esc(i.titel) + '</strong>' +
          '<p class="body-sm zacht">' + esc(i.tekst) + '</p></div>';
      }).join('') + '</section>';
  };

  function categorieScherm(id) {
    var nu = A.positions(nuJD());
    if (id === 'sterrenbeelden') {
      return '<h1 class="headline-lg opduiken">Sterrenbeelden</h1>' +
        '<div class="sectie">' + C.TEKENS.map(function (t, i) {
          return '<a class="glas vulling rij opduiken" href="#/teken/' + i + '" ' +
            'style="gap:14px;text-decoration:none;color:inherit">' +
            '<span class="bol goud"><span class="glyf">' + t.symbool + '</span></span>' +
            '<div class="kolom" style="gap:2px;flex:1"><strong class="headline-sm">' + esc(t.naam) + '</strong>' +
            '<span class="body-sm zacht">' + esc(t.datums) + ' · ' + esc(t.element) + ' · ' + esc(t.kwaliteit) + '</span></div>' +
            '<span class="gedempt">' + ico('chevron-right') + '</span></a>';
        }).join('') + '</div>';
    }
    if (id === 'planeten') {
      var lijst = ['zon', 'maan', 'mercurius', 'venus', 'mars', 'jupiter', 'saturnus',
                   'uranus', 'neptunus', 'pluto'];
      return '<h1 class="headline-lg opduiken">Planeten</h1>' +
        '<p class="body-lg zacht opduiken">Elke planeet staat voor een deel van je binnenwereld. ' +
        'Hieronder ook waar ze nu staan.</p>' +
        '<div class="sectie">' + lijst.map(function (k) {
          var p = C.PLANETEN[k];
          return '<div class="glas vulling kolom opduiken" style="gap:8px">' +
            '<div class="rij" style="gap:12px"><span class="bol goud"><span class="glyf">' + p.symbool + '</span></span>' +
            '<div class="kolom" style="gap:2px;flex:1"><strong class="headline-sm">' + esc(p.naam) + '</strong>' +
            '<span class="body-sm zacht">' + esc(p.thema) + '</span></div>' +
            '<span class="chip' + (nu[k].retrograde ? ' spanning' : '') + '">' +
            esc(D.graadTekst(nu[k].lon, true)) + (nu[k].retrograde ? ' Rx' : '') + '</span></div>' +
            '<p class="body-sm zacht">' + esc(p.naam) + ' gaat over ' + esc(p.domein) + '. ' +
            '<em class="gedempt">' + esc(p.vraag) + '</em></p></div>';
        }).join('') + '</div>';
    }
    if (id === 'huizen') {
      return '<h1 class="headline-lg opduiken">De twaalf huizen</h1>' +
        '<p class="body-lg zacht opduiken">Waar de tekens vertellen <em>hoe</em> iets gebeurt, ' +
        'vertellen de huizen <em>waar</em> in je leven het gebeurt.</p>' +
        '<div class="sectie">' + C.HUIZEN.map(function (h, i) {
          return '<div class="glas vulling kolom opduiken" style="gap:6px">' +
            '<div class="rij" style="gap:10px"><span class="bol goud">' + (i + 1) + '</span>' +
            '<strong class="headline-sm">' + esc(h.thema) + '</strong></div>' +
            '<p class="body-sm zacht">' + esc(h.tekst) + '</p></div>';
        }).join('') + '</div>';
    }
    if (id === 'aspecten') {
      return '<h1 class="headline-lg opduiken">Aspecten</h1>' +
        '<p class="body-lg zacht opduiken">De hoek tussen twee punten bepaalt hoe ze samenwerken. ' +
        'De orb is de marge die je toestaat: hoe kleiner, hoe sterker het aspect.</p>' +
        '<div class="sectie">' + Object.keys(C.ASPECTEN).map(function (k) {
          var a = C.ASPECTEN[k], def = A.ASPECTS.filter(function (x) { return x.id === k; })[0];
          return '<div class="glas vulling kolom opduiken" style="gap:8px">' +
            '<div class="rij" style="gap:12px"><span class="bol" style="color:' + a.kleur + '">' +
            '<span class="glyf">' + a.teken + '</span></span>' +
            '<div class="kolom" style="gap:2px;flex:1"><strong class="headline-sm" style="text-transform:capitalize">' +
            esc(a.naam) + '</strong><span class="body-sm zacht">' + def.hoek + '° · orb tot ' + def.orb + '°</span></div>' +
            '<span class="chip ' + a.aard + '">' + esc(a.aard) + '</span></div>' +
            '<p class="body-sm zacht">' + esc(a.tekst) + '</p></div>';
        }).join('') + '</div>';
    }
    if (id === 'retrogrades') {
      var retro = Object.keys(C.RETROGRADE).filter(function (k) { return nu[k] && nu[k].retrograde; });
      return '<h1 class="headline-lg opduiken">Retrogrades</h1>' +
        '<p class="body-lg zacht opduiken">Een planeet die retrograde loopt, beweegt vanaf de aarde gezien ' +
        'tijdelijk achteruit langs de dierenriem. Astronomisch is het een gezichtsbedrog dat ontstaat ' +
        'doordat de aarde de planeet inhaalt; astrologisch geldt het als een tijd van herzien.</p>' +
        '<div class="sectie">' +
        (retro.length
          ? retro.map(function (k) {
              return '<div class="glas vulling kolom opduiken" style="gap:8px">' +
                '<div class="rij" style="gap:12px"><span class="bol goud"><span class="glyf">' +
                C.PLANETEN[k].symbool + '</span></span>' +
                '<strong class="headline-sm" style="flex:1">' + esc(C.PLANETEN[k].naam) + ' retrograde in ' +
                esc(D.tekenNaam(nu[k].teken)) + '</strong></div>' +
                '<p class="body-sm zacht">' + esc(C.RETROGRADE[k]) + '</p></div>';
            }).join('')
          : '<div class="leeg">Op dit moment loopt geen enkele planeet retrograde.</div>') +
        '</div>' +
        '<div class="sectie"><h3 class="headline-sm">Alle retrogrades</h3>' +
        Object.keys(C.RETROGRADE).map(function (k) {
          return '<div class="glas vulling-klein kolom opduiken" style="gap:4px">' +
            '<strong>' + esc(C.PLANETEN[k].naam) + '</strong>' +
            '<span class="body-sm zacht">' + esc(C.RETROGRADE[k]) + '</span></div>';
        }).join('') + '</div>';
    }
    if (id === 'maanfasen') {
      var huidige = A.moonPhase(nuJD());
      return '<h1 class="headline-lg opduiken">Maanfasen</h1>' +
        '<p class="body-lg zacht opduiken">De maan doorloopt in ongeveer 29,5 dagen acht fasen. ' +
        'Nu: ' + esc(huidige.naam) + '.</p>' +
        '<div class="sectie">' + C.MAANFASEN.map(function (f, i) {
          var k = [0, 0.15, 0.5, 0.8, 1, 0.8, 0.5, 0.15][i];
          return '<div class="glas vulling rij opduiken" style="gap:16px;' +
            (i === huidige.index ? 'box-shadow:0 0 0 1px rgba(255,224,142,.4)' : '') + '">' +
            maanSVG(k, i < 4, 56) +
            '<div class="kolom" style="gap:4px;flex:1"><strong class="headline-sm">' + esc(f.naam) + '</strong>' +
            '<span class="body-sm goud">' + esc(f.kern) + '</span>' +
            '<span class="body-sm zacht">' + esc(f.tekst) + '</span></div></div>';
        }).join('') + '</div>';
    }
    return '<div class="leeg">Onbekende categorie.</div>';
  }

  schermen.teken = function (params) {
    var i = parseInt(params[0], 10);
    var t = C.TEKENS[i];
    if (!t) return '<div class="leeg">Onbekend teken.</div>';
    var heerser = C.PLANETEN[t.heerser];
    var el = C.ELEMENTEN[t.element];

    return '<section class="kolom opduiken" style="gap:14px;align-items:center;text-align:center">' +
      '<span class="bol goud" style="width:76px;height:76px"><span class="glyf" style="font-size:34px">' +
      t.symbool + '</span></span>' +
      '<h1 class="display goud">' + esc(t.naam) + '</h1>' +
      '<p class="label-caps gedempt">' + esc(t.datums) + '</p>' +
      '<p class="headline-md">' + esc(t.kern) + '</p></section>' +

      '<section class="glas vulling rij opduiken" style="justify-content:space-around;text-align:center">' +
      [['Element', el.naam], ['Kwaliteit', t.kwaliteit], ['Heerser', heerser.naam]]
        .map(function (x, n) {
          return (n ? '<div class="verticale-lijn"></div>' : '') +
            '<div class="kolom" style="gap:4px;flex:1"><span class="body-sm gedempt">' + x[0] + '</span>' +
            '<strong style="text-transform:capitalize">' + esc(x[1]) + '</strong></div>';
        }).join('') + '</section>' +

      '<section class="glas vulling kolom opduiken" style="gap:10px">' +
      '<p class="label-caps goud">Kernwoorden</p>' +
      '<div class="rij" style="flex-wrap:wrap;gap:8px">' + t.kernwoorden.map(function (k) {
        return '<span class="chip">' + esc(k) + '</span>';
      }).join('') + '</div>' +
      '<p class="body-sm zacht">' + esc(el.naam) + ' staat voor ' + esc(el.kern) + '. ' +
      'Een ' + esc(t.kwaliteit) + 'teken ' + esc(C.KWALITEITEN[t.kwaliteit]) + '.</p></section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Op zijn best</h3>' +
      t.licht.map(function (l) {
        return '<div class="glas vulling-klein rij" style="gap:10px"><span class="goud">' +
          ico('star', 'icoon-klein') + '</span><span class="body-sm">' + esc(l) + '</span></div>';
      }).join('') + '</section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">De schaduwkant</h3>' +
      t.schaduw.map(function (l) {
        return '<div class="glas vulling-klein rij" style="gap:10px"><span style="color:var(--rose)">' +
          ico('warning', 'icoon-klein') + '</span><span class="body-sm">' + esc(l) + '</span></div>';
      }).join('') + '</section>' +

      '<section class="glas vulling kolom opduiken" style="gap:8px">' +
      '<p class="label-caps goud">Zon in ' + esc(t.naam) + '</p>' +
      '<p class="body-sm zacht">' + esc(C.ZON_IN_TEKEN[i].tekst) + '</p></section>';
  };

  /* ---- match ---- */

  schermen.match = function (params) {
    if (params[0]) return matchDetail(params[0]);

    var rijen = staat.relaties.map(function (r) {
      var h = horoscoop(r, r.id);
      var comp = D.compatibiliteit(mijnHoroscoop(), h);
      return '<a class="glas vulling rij opduiken" href="#/match/' + r.id + '" ' +
        'style="gap:14px;text-decoration:none;color:inherit">' +
        '<span class="bol goud"><span class="glyf">' + C.TEKENS[h.punten.zon.teken].symbool + '</span></span>' +
        '<div class="kolom" style="gap:2px;flex:1"><strong class="headline-sm">' + esc(r.naam) + '</strong>' +
        '<span class="body-sm zacht">' + esc(D.tekenNaam(h.punten.zon.teken)) + ' · ' +
        esc(comp.samenvatting) + '</span></div>' +
        '<span class="goud headline-sm">' + comp.totaal + '%</span></a>';
    }).join('');

    return '<section class="kolom opduiken" style="gap:10px;text-align:center">' +
      '<h1 class="display">Kosmische compatibiliteit</h1>' +
      '<p class="body-lg zacht">Ontdek de dynamiek tussen twee geboortehoroscopen.</p></section>' +
      (rijen || '<div class="leeg">Nog niemand toegevoegd. Voeg iemand toe om jullie horoscopen te vergelijken.</div>') +
      '<button class="knop knop-primair knop-vol opduiken" data-actie="nieuwe-relatie">' +
      ico('plus', 'icoon-klein') + ' Iemand toevoegen</button>';
  };

  function matchDetail(id) {
    var r = staat.relaties.filter(function (x) { return x.id === id; })[0];
    if (!r) return '<div class="leeg">Deze persoon staat niet meer in je lijst.</div>';
    var mij = mijnHoroscoop(), hun = horoscoop(r, r.id);
    var comp = D.compatibiliteit(mij, hun);

    function bol(naam, tekenIdx) {
      return '<div class="kolom" style="gap:6px;align-items:center">' +
        '<span class="bol goud" style="width:64px;height:64px">' +
        '<span class="glyf" style="font-size:28px">' + C.TEKENS[tekenIdx].symbool + '</span></span>' +
        '<strong>' + esc(naam) + '</strong>' +
        '<span class="body-sm goud">' + esc(D.tekenNaam(tekenIdx)) + '</span></div>';
    }

    return '<section class="kolom opduiken" style="gap:10px;text-align:center">' +
      '<h1 class="headline-lg">Kosmische compatibiliteit</h1></section>' +

      '<section class="glas vulling kolom opduiken" style="gap:16px;align-items:center">' +
      '<div class="rij" style="gap:20px;align-items:center">' +
      bol(staat.profiel.naam.split(' ')[0], mij.punten.zon.teken) +
      '<div class="kolom" style="align-items:center;gap:2px">' +
      '<span class="display goud gloed" style="font-size:34px">' + comp.totaal + '%</span></div>' +
      bol(r.naam.split(' ')[0], hun.punten.zon.teken) + '</div>' +
      '<p class="headline-sm goud">' + esc(comp.samenvatting) + '</p>' +
      '<p class="body-sm zacht" style="text-align:center">' + esc(comp.elementTekst) + '</p></section>' +

      '<section class="raster-3 opduiken">' +
      [['drop', 'Emotioneel', comp.emotioneel], ['chat', 'Communicatie', comp.communicatie],
       ['heart', 'Aantrekking', comp.aantrekking]].map(function (x) {
        return '<div class="glas vulling-klein kolom" style="gap:6px;align-items:center;text-align:center">' +
          '<span class="gedempt">' + ico(x[0], 'icoon-klein') + '</span>' +
          '<span class="headline-md">' + x[2] + '%</span>' +
          '<span class="label-caps gedempt" style="font-size:10px">' + x[1] + '</span></div>';
      }).join('') + '</section>' +

      '<section class="glas vulling kolom opduiken" style="gap:10px">' +
      '<div class="rij" style="gap:10px"><span class="goud">' + ico('link') + '</span>' +
      '<strong class="headline-sm">Waarom jullie verbinden</strong></div><hr class="deelbalk">' +
      '<p class="body-sm zacht">' + esc(comp.waarom) + '</p></section>' +

      '<section class="glas vulling kolom opduiken" style="gap:10px">' +
      '<div class="rij" style="gap:10px"><span style="color:var(--secondary)">' + ico('bolt') + '</span>' +
      '<strong class="headline-sm">Waar spanning kan ontstaan</strong></div><hr class="deelbalk">' +
      '<p class="body-sm zacht">' + esc(comp.spanning) + '</p></section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Aspecten tussen jullie horoscopen</h3>' +
      '<div class="glas" style="overflow:hidden">' + comp.aspecten.map(function (a) {
        return '<div class="lijst-rij" style="cursor:default">' +
          '<span class="glyf goud">' + C.PLANETEN[a.a].symbool + '</span>' +
          '<span class="gedempt">' + C.ASPECTEN[a.type].teken + '</span>' +
          '<span class="glyf" style="color:var(--secondary)">' + C.PLANETEN[a.b].symbool + '</span>' +
          '<div class="kolom" style="gap:0;flex:1"><span class="body-sm">jouw ' +
          esc(C.PLANETEN[a.a].naam.toLowerCase()) + ' ' + esc(C.ASPECTEN[a.type].naam) + ' ' +
          esc(bezit(r.naam.split(' ')[0])) + ' ' + esc(C.PLANETEN[a.b].naam.toLowerCase()) + '</span>' +
          '<span class="body-sm gedempt">orb ' + a.orb.toFixed(1) + '°</span></div></div>';
      }).join('') + '</div></section>' +

      '<div class="rij opduiken" style="gap:10px">' +
      '<button class="knop knop-spook" data-actie="bewerk-relatie" data-id="' + esc(id) + '">' +
      ico('pencil', 'icoon-klein') + ' Gegevens</button>' +
      '<button class="knop knop-spook" data-actie="verwijder-relatie" data-id="' + esc(id) + '">' +
      ico('trash', 'icoon-klein') + ' Verwijderen</button></div>' +
      '<p class="hint">De percentages komen uit de aspecten tussen beide horoscopen: ' +
      'venus- en maanaspecten wegen mee voor emotionele klik, mercurius voor communicatie, ' +
      'mars- en plutoaspecten voor aantrekking.</p>';
  }

  /* ---- profiel ---- */

  schermen.profiel = function () {
    var natal = mijnHoroscoop();
    var p = natal.punten;
    var geb = new Date(staat.profiel.datum);

    var menu = [
      ['history', 'Mijn geboortegegevens', '#/gegevens/profiel', 'pencil'],
      ['bewaard', 'Opgeslagen inzichten', '#/bewaard', 'bookmark'],
      ['relaties', 'Relaties', '#/match', 'users'],
      ['meldingen', 'Meldingen', '#/meldingen', 'bell'],
      ['eigen', 'Eigen gegevens', '#/eigen-data', 'grid'],
      ['over', 'Over LUNA', '#/over', 'info']
    ];

    return '<section class="kolom opduiken" style="gap:12px;align-items:center;text-align:center">' +
      '<span class="bol goud" style="width:84px;height:84px">' +
      '<span class="glyf" style="font-size:36px">' + C.TEKENS[p.zon.teken].symbool + '</span></span>' +
      '<h1 class="headline-lg">' + esc(staat.profiel.naam) + '</h1>' +
      '<p class="body-sm zacht">' + esc(datumKort(geb)) + ' ' + geb.getFullYear() +
      (staat.profiel.tijdBekend ? ' om ' + esc(staat.profiel.tijd) : '') +
      ' · ' + esc(staat.profiel.plaats.naam) + '</p></section>' +

      driehoekje([
        { icoon: 'sun', kleur: 'var(--primary)', label: 'ZON', waarde: D.tekenNaam(p.zon.teken) },
        { icoon: 'moon', kleur: 'var(--secondary)', label: 'MAAN', waarde: D.tekenNaam(p.maan.teken) },
        p.asc ? { icoon: 'arrow-up', kleur: 'var(--tertiary)', label: 'ASCENDANT', waarde: D.tekenNaam(p.asc.teken) }
              : { icoon: 'clock', kleur: 'var(--outline)', label: 'ASCENDANT', waarde: '—' }
      ]) +

      '<section class="glas opduiken" style="overflow:hidden">' +
      menu.map(function (m) {
        return '<a class="lijst-rij" href="' + m[2] + '">' + ico(m[3]) +
          '<span style="flex:1">' + m[1] + '</span>' +
          '<span class="pijl">' + ico('chevron-right') + '</span></a>';
      }).join('') + '</section>' +

      '<button class="knop knop-spook knop-vol opduiken" data-actie="wissen">' +
      ico('trash', 'icoon-klein') + ' Alle gegevens wissen</button>' +
      '<p class="hint">Alles staat in de opslag van deze browser. Wissen kan niet ongedaan gemaakt worden.</p>';
  };

  /* ---- eigen gegevens ---- */

  var eigenVoorbeeld = null;
  var eigenTekst = '';
  var eigenVoor = '';
  var eigenBron = '';
  var eigenTz = eigenStandaardTz();

  /* Tabellen staan meestal in de tijdzone waarin ze gemaakt zijn, niet in
     wereldtijd. Een uur verschil is bij de maan al een halve graad, dus dit
     is een expliciete keuze en geen stille aanname. */
  function eigenStandaardTz() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; }
    catch (e) { return 'UTC'; }
  }

  function eigenNamen() {
    var namen = [];
    if (staat.profiel) namen.push(staat.profiel.naam);
    staat.relaties.forEach(function (r) { namen.push(r.naam); });
    return namen;
  }

  schermen['eigen-data'] = function () {
    var aanwezig = E ? E.alles() : { horoscopen: [], tabellen: [] };
    var namen = eigenNamen();

    var voorbeeld = '';
    if (eigenVoorbeeld && eigenVoorbeeld.fout) {
      voorbeeld = '<div class="glas vulling rij" style="gap:10px;align-items:flex-start">' +
        '<span style="color:var(--rose)">' + ico('warning') + '</span>' +
        '<div class="kolom" style="gap:4px"><strong>Niet gelukt</strong>' +
        '<span class="body-sm zacht">' + esc(eigenVoorbeeld.fout) + '</span></div></div>';

    } else if (eigenVoorbeeld && eigenVoorbeeld.type === 'horoscoop') {
      var jd = null;
      var doel = eigenVoor && eigenVoor === (staat.profiel || {}).naam ? staat.profiel
              : staat.relaties.filter(function (r) { return r.naam === eigenVoor; })[0];
      if (doel) {
        var h = horoscoopVan(doel);
        if (h) jd = h.jd;
      }
      var rijen = E.vergelijk(eigenVoorbeeld.punten, jd);
      voorbeeld = '<section class="glas vulling kolom" style="gap:12px">' +
        '<strong class="headline-sm">' + rijen.length + ' standen herkend</strong>' +
        (jd === null
          ? '<p class="hint">Kies hierboven voor wie deze horoscoop is, dan zet ik jouw waarden ' +
            'naast de berekende.</p>'
          : '<p class="hint">Jouw waarden naast wat LUNA zelf uitrekent. Grote verschillen wijzen ' +
            'meestal op een andere tijdzone, een ander huizensysteem of siderische in plaats van ' +
            'tropische dierenriem.</p>') +
        '<div class="glas" style="overflow:hidden">' +
        rijen.map(function (r) {
          var kleur = r.verschil === null ? 'var(--outline)'
                    : Math.abs(r.verschil) < 6 ? 'var(--groen)'
                    : Math.abs(r.verschil) < 60 ? 'var(--primary)' : 'var(--rose)';
          var verschil = r.verschil === null ? ''
            : (Math.abs(r.verschil) < 1 ? 'gelijk'
               : (r.verschil > 0 ? '+' : '\u2212') + Math.abs(r.verschil).toFixed(0) + '\u2032');
          return '<div class="lijst-rij kolom" style="cursor:default;gap:4px;align-items:stretch">' +
            '<div class="rij-tussen"><strong>' + esc(C.PLANETEN[r.lichaam].naam) +
            (r.retrograde ? ' <span class="gedempt body-sm">Rx</span>' : '') + '</strong>' +
            (verschil ? '<span class="body-sm" style="color:' + kleur + '">' + verschil + '</span>' : '') +
            '</div>' +
            '<div class="body-sm zacht">' + esc(D.graadTekst(r.eigen)) +
            (r.berekend === null ? ''
              : '<span class="gedempt"> \u00b7 LUNA ' + esc(D.graadTekst(r.berekend)) + '</span>') +
            '</div></div>';
        }).join('') + '</div>' +
        (eigenVoorbeeld.huizen
          ? '<div class="rij" style="gap:10px;align-items:flex-start">' +
            '<span class="goud">' + ico('home', 'icoon-klein') + '</span>' +
            '<p class="body-sm zacht">Ook twaalf huiscuspen gevonden. LUNA gebruikt normaal ' +
            'hele-tekenhuizen; met jouw cuspen rekent hij voortaan met die van jouw bron.</p></div>'
          : eigenVoorbeeld.cuspen
            ? '<p class="hint">' + eigenVoorbeeld.cuspen + ' huiscuspen gevonden, maar te weinig ' +
              'voor een volledige set. Geef ten minste huis 1, 2, 3, 10, 11 en 12; de rest leidt ' +
              'LUNA daaruit af.</p>'
            : '') +
        (eigenVoorbeeld.overgeslagen && eigenVoorbeeld.overgeslagen.length
          ? '<p class="hint">Overgeslagen regels: ' +
            esc(eigenVoorbeeld.overgeslagen.slice(0, 4).join(' · ')) +
            (eigenVoorbeeld.overgeslagen.length > 4 ? ' …' : '') + '</p>'
          : '') +
        '<button class="knop knop-primair knop-vol" data-actie="eigen-opslaan"' +
        (eigenVoor ? '' : ' disabled') + '>' +
        (eigenVoor ? 'Bewaren voor ' + esc(eigenVoor) : 'Kies eerst voor wie') + '</button></section>';

    } else if (eigenVoorbeeld && eigenVoorbeeld.type === 'tabel') {
      voorbeeld = '<section class="glas vulling kolom" style="gap:12px">' +
        '<strong class="headline-sm">Tabel herkend</strong>' +
        '<div class="rij" style="flex-wrap:wrap;gap:8px">' +
        eigenVoorbeeld.lichamen.map(function (l) {
          return '<span class="chip">' + esc(C.PLANETEN[l].naam) + '</span>';
        }).join('') + '</div>' +
        '<p class="body-sm zacht">' + eigenVoorbeeld.aantal + ' standen, van ' +
        esc(datumKort(A.dateFromJD(eigenVoorbeeld.van))) + ' ' +
        A.dateFromJD(eigenVoorbeeld.van).getFullYear() + ' tot ' +
        esc(datumKort(A.dateFromJD(eigenVoorbeeld.tot))) + ' ' +
        A.dateFromJD(eigenVoorbeeld.tot).getFullYear() + '.</p>' +
        (eigenVoorbeeld.eersteCel
          ? '<div class="rij" style="gap:10px;align-items:flex-start">' +
            '<span class="goud">' + ico('clock', 'icoon-klein') + '</span>' +
            '<p class="body-sm zacht">Controle: <strong>' + esc(eigenVoorbeeld.eersteCel) +
            '</strong> in ' + esc(eigenVoorbeeld.tz === 'UTC' ? 'wereldtijd' : eigenVoorbeeld.tz) +
            ' is ' + esc(datumTijdUTC(A.dateFromJD(eigenVoorbeeld.van))) + ' wereldtijd. ' +
            'Klopt dat niet, kies dan een andere tijdzone.</p></div>'
          : '') +
        (eigenVoorbeeld.fouteRegels
          ? '<p class="hint">' + eigenVoorbeeld.fouteRegels + ' regels overgeslagen omdat de datum ' +
            'niet te lezen was.</p>' : '') +
        (eigenVoorbeeld.foutieveCellen
          ? '<div class="rij" style="gap:10px;align-items:flex-start">' +
            '<span style="color:var(--rose)">' + ico('warning', 'icoon-klein') + '</span>' +
            '<p class="body-sm zacht">' + eigenVoorbeeld.foutieveCellen + ' waarden overgeslagen ' +
            'omdat ze niet te lezen waren' +
            (eigenVoorbeeld.voorbeeldFout ? ', bijvoorbeeld "' + esc(eigenVoorbeeld.voorbeeldFout) + '"' : '') +
            '. Een lengte moet tussen 0 en 360 graden liggen.</p></div>'
          : '') +
        (eigenVoorbeeld.aantal > 50000
          ? '<p class="hint">Dit is een grote tabel. Past hij niet in de opslag van je browser, ' +
            'zet hem dan in ephemeride.js.</p>' : '') +
        '<button class="knop knop-primair knop-vol" data-actie="eigen-opslaan">Tabel bewaren</button>' +
        '</section>';
    }

    function vermelding(item, soort) {
      return '<div class="glas vulling-klein rij" style="gap:12px">' +
        '<span class="bol goud">' + ico(soort === 'tabel' ? 'grid' : 'person') + '</span>' +
        '<div class="kolom" style="gap:2px;flex:1">' +
        '<strong>' + esc(soort === 'tabel'
          ? (item.bron || 'Tabel')
          : (item.voor || 'Zonder naam')) + '</strong>' +
        '<span class="body-sm gedempt">' + esc(soort === 'tabel'
          ? item.lichamen.length + ' lichamen · ' + item.aantal + ' standen · ' +
            (item.tz && item.tz !== 'UTC' ? item.tz : 'wereldtijd')
          : Object.keys(item.punten).length + ' standen' +
            (item.huizen ? ' + huizen' : '') + (item.bron ? ' · ' + item.bron : '')) +
        (item.vast ? ' · uit ephemeride.js' : '') + '</span></div>' +
        (item.vast ? '<span class="chip">vast</span>'
          : '<button class="knop knop-spook" style="padding:6px 12px" data-actie="eigen-verwijder" ' +
            'data-id="' + esc(item.id) + '" aria-label="Verwijderen">' + ico('trash', 'icoon-klein') +
            '</button>') + '</div>';
    }

    return '<section class="kolom opduiken" style="gap:10px">' +
      '<h1 class="headline-lg">Eigen gegevens</h1>' +
      '<p class="body-lg zacht">Lever je eigen planeetstanden aan, in plaats van of naast de ' +
      'berekening van LUNA zelf.</p></section>' +

      '<section class="glas vulling kolom opduiken" style="gap:16px">' +
      '<div class="veld"><label for="v-eigen">Plak je gegevens</label>' +
      '<textarea id="v-eigen" data-veld="eigen" rows="8" spellcheck="false" ' +
      'placeholder="Zon 1&#176;03&#39; Schorpioen&#10;Maan 7 Cap 45&#10;AC 6&#176;23&#39; Tweelingen&#10;&#10;of een tabel:&#10;datum,zon,maan,mars&#10;2026-08-25,152.19,295.42,99.20" ' +
      'style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;resize:vertical">' +
      esc(eigenTekst) + '</textarea></div>' +

      '<div class="veld"><label for="v-eigen-voor">Voor wie (alleen bij een horoscoop)</label>' +
      '<select id="v-eigen-voor" data-veld="eigenVoor"><option value="">Kies een persoon</option>' +
      namen.map(function (n) {
        return '<option value="' + esc(n) + '"' + (n === eigenVoor ? ' selected' : '') + '>' +
          esc(n) + '</option>';
      }).join('') + '</select></div>' +

      '<div class="veld"><label for="v-eigen-bron">Waar komt het vandaan (optioneel)</label>' +
      '<input id="v-eigen-bron" data-veld="eigenBron" value="' + esc(eigenBron) + '" ' +
      'placeholder="Bijvoorbeeld: Swiss Ephemeris, of Astrodienst"></div>' +

      '<div class="veld"><label for="v-eigen-tz">In welke tijd staan de datums (alleen bij een tabel)</label>' +
      '<select id="v-eigen-tz" data-veld="eigenTz">' +
      '<option value="UTC"' + (eigenTz === 'UTC' ? ' selected' : '') + '>Wereldtijd (UT)</option>' +
      tijdzoneOpties(eigenTz === 'UTC' ? eigenStandaardTz() : eigenTz)
        .replace('<option value="UTC">UTC</option>', '')
        .replace('<option value="UTC" selected>UTC</option>', '') +
      '</select>' +
      '<span class="hint">Staan je datums op middernacht in je eigen tijdzone, kies dan die zone. ' +
      'Zomer- en wintertijd worden vanzelf verrekend.</span></div>' +

      '<div class="rij" style="gap:10px">' +
      '<button class="knop knop-primair" data-actie="eigen-lezen">Inlezen en controleren</button>' +
      (eigenTekst ? '<button class="knop knop-spook" data-actie="eigen-leegmaken">Leegmaken</button>' : '') +
      '</div></section>' +

      voorbeeld +

      '<section class="sectie opduiken"><h3 class="headline-sm">Wat er nu gebruikt wordt</h3>' +
      (aanwezig.horoscopen.length || aanwezig.tabellen.length
        ? aanwezig.horoscopen.map(function (h) { return vermelding(h, 'horoscoop'); }).join('') +
          aanwezig.tabellen.map(function (t) { return vermelding(t, 'tabel'); }).join('')
        : '<div class="leeg">Nog niets. LUNA rekent alles zelf uit.</div>') +
      '</section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Meenemen naar een ander apparaat</h3>' +
      '<div class="rij" style="gap:10px;flex-wrap:wrap">' +
      '<button class="knop knop-spook" data-actie="eigen-uitvoer">' + ico('share', 'icoon-klein') +
      ' Opslaan als bestand</button>' +
      '<label class="knop knop-spook" style="cursor:pointer">' + ico('plus', 'icoon-klein') +
      ' Bestand inlezen<input type="file" accept=".json,application/json" data-eigen-bestand ' +
      'style="display:none"></label>' +
      (aanwezig.horoscopen.concat(aanwezig.tabellen).some(function (x) { return !x.vast; })
        ? '<button class="knop knop-spook" data-actie="eigen-wissen">' + ico('trash', 'icoon-klein') +
          ' Alles wissen</button>' : '') +
      '</div></section>' +

      '<section class="glas vulling kolom opduiken" style="gap:10px">' +
      '<strong class="headline-sm">Hoe het werkt</strong>' +
      '<p class="body-sm zacht"><strong>Een horoscoop</strong> zijn de standen op één moment. ' +
      'Ze vervangen de berekening voor die ene persoon. Wat je weglaat, rekent LUNA gewoon uit. ' +
      'Geef je alleen een ascendant op, dan krijg je huizen ook zonder bekende geboortetijd.</p>' +
      '<p class="body-sm zacht"><strong>Een tabel</strong> zijn standen over een reeks datums. ' +
      'Die vervangen de stand van vandaag, de transits en de maanfase. Tussen twee rijen wordt ' +
      'geïnterpoleerd, dus dagelijkse rijen volstaan. Buiten het bereik van je tabel rekent LUNA ' +
      'weer zelf.</p>' +
      '<p class="body-sm zacht">Alle lengtes zijn ecliptische graden vanaf 0° Ram; datums en ' +
      'tijden zijn wereldtijd (UT).</p>' +
      '<p class="hint">Wat je hier invoert staat alleen in deze browser. Wil je het op elk apparaat, ' +
      'zet het dan in het bestand ephemeride.js in de repository.</p></section>';
  };

  /* ---- meldingen ---- */

  schermen.meldingen = function () {
    var i = staat.instellingen;
    var jd = nuJD();
    var hemel = D.hemelNu(jd);
    var natal = mijnHoroscoop();
    var trs = A.transits(natal, jd).filter(function (t) { return t.sterkte > 0.6 && t.transit !== 'maan'; });

    var berichten = [];
    hemel.items.forEach(function (item) {
      if (item.label === 'Volle maan' && !i.vollemaan) return;
      if (item.label === 'Nieuwe maan' && !i.nieuwemaan) return;
      if (item.label === 'Retrograde' && !i.retrograde) return;
      if (item.label === 'Tekenwissel' && !i.transits) return;
      berichten.push(item);
    });
    if (i.transits) {
      trs.slice(0, 3).forEach(function (t) {
        var tt = D.transitTekst(t);
        berichten.push({ icoon: 'sparkle', label: 'Transit', titel: tt.titel, tekst: tt.tekst });
      });
    }

    var schakelaars = [
      ['dagelijks', 'Dagelijkse horoscoop', 'Jouw dagelijkse kosmische lezing'],
      ['transits', 'Transities en tekenwissels', 'Wat er nu met jouw horoscoop gebeurt'],
      ['vollemaan', 'Volle maan', ''],
      ['nieuwemaan', 'Nieuwe maan', ''],
      ['retrograde', 'Retrogrades', 'Waarschuwingen bij terugkerende planeten'],
      ['relaties', 'Relatie-inzichten', 'Updates over compatibiliteit']
    ];

    return '<section class="kolom opduiken" style="gap:10px">' +
      '<h1 class="headline-lg">Meldingen</h1>' +
      '<p class="body-lg zacht">Stem je verbinding met de kosmos af. Bepaal welke gebeurtenissen je hier wilt zien.</p>' +
      '</section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Nu actueel</h3>' +
      (berichten.length ? berichten.map(function (b) {
        return '<div class="glas vulling kolom" style="gap:6px">' +
          '<div class="rij" style="gap:8px"><span class="goud">' + ico(b.icoon, 'icoon-klein') + '</span>' +
          '<span class="label-caps gedempt">' + esc(b.label) + '</span>' +
          (b.datum ? '<span class="chip" style="margin-left:auto">' + esc(datumKort(b.datum)) + '</span>' : '') + '</div>' +
          '<strong>' + esc(b.titel) + '</strong>' +
          '<span class="body-sm zacht">' + esc(b.tekst) + '</span></div>';
      }).join('') : '<div class="leeg">Niets bijzonders aan de hemel volgens je huidige voorkeuren.</div>') +
      '</section>' +

      '<section class="sectie opduiken"><h3 class="headline-sm">Wat wil je zien</h3>' +
      '<div class="glas" style="overflow:hidden">' + schakelaars.map(function (s) {
        return '<div class="lijst-rij" style="cursor:default">' +
          '<div class="kolom" style="gap:2px;flex:1"><span>' + s[1] + '</span>' +
          (s[2] ? '<span class="body-sm gedempt">' + s[2] + '</span>' : '') + '</div>' +
          '<button class="schakelaar" role="switch" aria-checked="' + (i[s[0]] ? 'true' : 'false') +
          '" data-schakel="' + s[0] + '" aria-label="' + esc(s[1]) + '"></button></div>';
      }).join('') + '</div></section>' +

      (i.dagelijks
        ? '<section class="glas vulling kolom opduiken" style="gap:10px">' +
          '<div class="veld"><label for="v-tijdstip">Voorkeurstijd voor je dagelijkse lezing</label>' +
          '<input id="v-tijdstip" type="time" value="' + esc(i.tijd) + '" data-instelling="tijd"></div></section>'
        : '') +

      '<p class="hint">LUNA is een website zonder server: hij kan je telefoon niet uit zichzelf wakker maken. ' +
      'Je voorkeuren bepalen wat je op dit scherm te zien krijgt zodra je de app opent.</p>';
  };

  /* ---- bewaarde inzichten ---- */

  schermen.bewaard = function () {
    if (!staat.bewaard.length) {
      return '<h1 class="headline-lg opduiken">Opgeslagen inzichten</h1>' +
        '<div class="leeg">Nog niets bewaard. Bewaar een dagelijks inzicht om het hier terug te vinden.</div>';
    }
    return '<h1 class="headline-lg opduiken">Opgeslagen inzichten</h1>' +
      staat.bewaard.slice().reverse().map(function (b) {
        return '<article class="glas vulling kolom opduiken" style="gap:8px">' +
          '<div class="rij-tussen"><span class="label-caps goud">' + esc(b.datum) + '</span>' +
          '<button class="knop knop-spook" style="padding:6px 12px;font-size:12px" ' +
          'data-actie="verwijder-bewaard" data-id="' + esc(b.id) + '">' + ico('trash', 'icoon-klein') + '</button></div>' +
          '<strong class="headline-sm">' + esc(b.titel) + '</strong>' +
          '<p class="body-sm zacht">' + esc(b.tekst) + '</p></article>';
      }).join('');
  };

  /* ---- over ---- */

  schermen.over = function () {
    return '<h1 class="headline-lg opduiken">Over LUNA</h1>' +
      '<section class="glas vulling kolom opduiken" style="gap:12px">' +
      '<strong class="headline-sm">Hoe de berekeningen werken</strong>' +
      '<p class="body-sm zacht">LUNA rekent de standen zelf uit, op je eigen toestel. De zon volgt de ' +
      'formules van Meeus, de maan die van Schlyter en de planeten de keplerelementen van JPL. ' +
      'De nauwkeurigheid ligt rond een boogminuut: ruim voldoende voor graden en tekens.</p>' +
      '<p class="body-sm zacht">De ascendant en midhemel volgen uit de sterrentijd op je geboortemoment ' +
      'en de breedtegraad van je geboorteplaats. De huizen zijn hele-tekenhuizen. ' +
      'Je kloktijd wordt met de tijdzonegegevens van je browser omgerekend, dus historische zomertijd klopt.</p>' +
      '</section>' +
      '<section class="glas vulling kolom opduiken" style="gap:12px">' +
      '<strong class="headline-sm">Wat het wel en niet is</strong>' +
      '<p class="body-sm zacht">De posities zijn astronomie: die kun je nameten. De duidingen zijn ' +
      'traditionele astrologie, een symbooltaal met een lange geschiedenis. Het is geen wetenschap ' +
      'en geen voorspelling. Lees het als een spiegel, niet als een advies.</p></section>' +
      '<section class="glas vulling kolom opduiken" style="gap:12px">' +
      '<strong class="headline-sm">Je gegevens</strong>' +
      '<p class="body-sm zacht">Alles staat in de opslag van deze browser en gaat nergens heen. ' +
      'Er is geen account, geen server en geen tracking. Wis je je browsergegevens, dan is ook je ' +
      'horoscoop weg.</p></section>' +
      '<p class="hint">Ontwerp naar het Celestial Ethereal-systeem uit de bijbehorende Stitch-export.</p>';
  };

  /* ================= router ================= */

  var TAB_PADEN = TABS.map(function (t) { return t.pad; });

  function huidigeRoute() {
    var h = location.hash.replace(/^#\/?/, '');
    var delen = h.split('/').filter(Boolean);
    return { naam: delen[0] || '', params: delen.slice(1) };
  }

  function render() {
    var r = huidigeRoute();

    if (!staat.profiel && r.naam !== 'gegevens' && r.naam !== 'over') {
      if (r.naam !== 'welkom') { location.replace('#/welkom'); return; }
    }
    if (staat.profiel && (r.naam === '' || r.naam === 'welkom')) {
      location.replace('#/vandaag'); return;
    }
    if (!r.naam) { location.replace('#/welkom'); return; }

    var fn = schermen[r.naam];
    if (!fn) { scherm.innerHTML = '<div class="leeg">Deze pagina bestaat niet.</div>'; return; }

    try {
      scherm.innerHTML = fn(r.params);
    } catch (e) {
      scherm.innerHTML = '<div class="leeg">Er ging iets mis bij het opbouwen van dit scherm.<br>' +
        '<span class="body-sm">' + esc(e.message) + '</span></div>';
      if (window.console) console.error(e);
    }

    var pad = '#/' + r.naam;
    if (staat.profiel && r.naam !== 'welkom') tekenNav(TAB_PADEN.indexOf(pad) >= 0 ? pad : '');
    else navigatie.hidden = true;

    var isTab = TAB_PADEN.indexOf(pad) >= 0;
    knopTerug.style.visibility = (isTab || r.naam === 'welkom') ? 'hidden' : 'visible';
    knopMeldingen.style.visibility = staat.profiel ? 'visible' : 'hidden';
    scherm.className = r.naam === 'geboorte' ? 'breed' : '';
    window.scrollTo(0, 0);
  }

  /* ================= interactie ================= */

  scherm.addEventListener('click', function (e) {
    var gaEl = e.target.closest('[data-ga]');
    if (gaEl) { ga(gaEl.dataset.ga); return; }

    var plaatsEl = e.target.closest('[data-kies-plaats]');
    if (plaatsEl) {
      var gekozen = PL.lijst.filter(function (p) { return p.naam === plaatsEl.dataset.kiesPlaats; })[0];
      formulier.plaats = gekozen;
      formulier.zoekterm = gekozen.naam;
      render();
      return;
    }

    var schakel = e.target.closest('[data-schakel]');
    if (schakel) {
      var sleutel = schakel.dataset.schakel;
      staat.instellingen[sleutel] = !staat.instellingen[sleutel];
      bewaren();
      render();
      return;
    }

    var knop = e.target.closest('[data-actie]');
    if (!knop) return;
    var actie = knop.dataset.actie;

    if (actie === 'start') { startFormulier('profiel'); ga('#/gegevens/profiel'); }

    else if (actie === 'handmatig') { formulier.handmatig = !formulier.handmatig; render(); }

    else if (actie === 'handmatig-opslaan') {
      var lat = parseFloat(document.getElementById('v-lat').value);
      var lon = parseFloat(document.getElementById('v-lon').value);
      var tz = document.getElementById('v-tz').value;
      if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        toon('Vul geldige coördinaten in.');
        return;
      }
      formulier.plaats = { naam: formulier.zoekterm || 'Eigen locatie', land: '', lat: lat, lon: lon, tz: tz };
      render();
    }

    else if (actie === 'opslaan') {
      var f = formulier;
      if (!f.naam || !f.datum || !f.plaats) { toon('Vul naam, datum en plaats in.'); return; }
      if (f.tijdBekend && !f.tijd) { toon('Vul een geboortetijd in, of vink aan dat je die niet weet.'); return; }
      var gegevens = {
        naam: f.naam.trim(), datum: f.datum, tijd: f.tijd || '12:00',
        tijdBekend: f.tijdBekend, plaats: f.plaats
      };
      if (f.doel === 'profiel') {
        staat.profiel = gegevens;
        _cache = {};
        bewaren();
        formulier = null;
        ga('#/vandaag');
      } else {
        var bestaat = staat.relaties.filter(function (r) { return r.id === f.doel; })[0];
        if (bestaat) Object.assign(bestaat, gegevens);
        else staat.relaties.push(Object.assign({ id: f.doel }, gegevens));
        _cache = {};
        bewaren();
        formulier = null;
        ga('#/match/' + f.doel);
      }
    }

    else if (actie === 'nieuwe-relatie') {
      var nieuwId = idNieuw();
      startFormulier(nieuwId);
      ga('#/gegevens/' + nieuwId);
    }

    else if (actie === 'bewerk-relatie') { startFormulier(knop.dataset.id); ga('#/gegevens/' + knop.dataset.id); }

    else if (actie === 'verwijder-relatie') {
      if (!confirm('Deze persoon uit je lijst verwijderen?')) return;
      staat.relaties = staat.relaties.filter(function (r) { return r.id !== knop.dataset.id; });
      bewaren();
      ga('#/match');
    }

    else if (actie === 'bewaar-inzicht') {
      var nu = new Date();
      var inz = D.dagInzicht(mijnHoroscoop(), nuJD(), nu);
      staat.bewaard.push({
        id: idNieuw(),
        datum: datumLang(nu) + ' ' + nu.getFullYear(),
        titel: inz.titel,
        tekst: inz.tekst + ' — ' + inz.advies
      });
      bewaren();
      toon('Inzicht bewaard.');
    }

    else if (actie === 'verwijder-bewaard') {
      staat.bewaard = staat.bewaard.filter(function (b) { return b.id !== knop.dataset.id; });
      bewaren();
      render();
    }

    else if (actie === 'eigen-lezen') {
      eigenVoorbeeld = E.parse(eigenTekst, eigenTz);
      render();
    }

    else if (actie === 'eigen-leegmaken') {
      eigenTekst = ''; eigenVoorbeeld = null;
      render();
    }

    else if (actie === 'eigen-opslaan') {
      var r;
      if (eigenVoorbeeld.type === 'horoscoop') {
        r = E.voegHoroscoopToe(eigenVoorbeeld.punten, eigenVoor, eigenBron, eigenVoorbeeld.huizen);
      } else {
        r = E.voegTabelToe(eigenVoorbeeld, eigenBron);
      }
      if (r && r.fout) { toon(r.fout); return; }
      eigenVoorbeeld = null; eigenTekst = '';
      _cache = {};
      toon('Eigen gegevens bewaard.');
      render();
    }

    else if (actie === 'eigen-verwijder') {
      E.verwijder(knop.dataset.id);
      _cache = {};
      render();
    }

    else if (actie === 'eigen-wissen') {
      if (!confirm('Al je eigen gegevens uit deze browser wissen? Wat in ephemeride.js staat, blijft.')) return;
      E.wisAlles();
      _cache = {};
      render();
    }

    else if (actie === 'eigen-uitvoer') {
      var blob = new Blob([E.exporteer()], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'luna-eigen-data.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    else if (actie === 'wissen') {
      if (!confirm('Al je gegevens uit deze browser wissen?')) return;
      localStorage.removeItem(SLEUTEL);
      staat = laden();
      _cache = {};
      formulier = null;
      ga('#/welkom');
      render();
    }
  });

  scherm.addEventListener('input', function (e) {
    var veld = e.target.dataset.veld;
    if (veld && formulier) {
      if (veld === 'naam') formulier.naam = e.target.value;
      else if (veld === 'datum') formulier.datum = e.target.value;
      else if (veld === 'tijd') formulier.tijd = e.target.value;
      else if (veld === 'plaats') {
        formulier.zoekterm = e.target.value;
        formulier.plaats = null;
        hertekenFormulier(e.target);
        return;
      }
      var opslaanKnop = scherm.querySelector('[data-actie="opslaan"]');
      if (opslaanKnop) {
        opslaanKnop.disabled = !(formulier.naam && formulier.datum && formulier.plaats);
      }
    }
    if (veld === 'eigen') { eigenTekst = e.target.value; return; }
    if (veld === 'eigenBron') { eigenBron = e.target.value; return; }
    var instelling = e.target.dataset.instelling;
    if (instelling) {
      staat.instellingen[instelling] = e.target.value;
      bewaren();
    }
  });

  scherm.addEventListener('change', function (e) {
    if (e.target.dataset.veld === 'eigenVoor') {
      eigenVoor = e.target.value;
      render();
      return;
    }
    if (e.target.dataset.veld === 'eigenTz') {
      eigenTz = e.target.value;
      if (eigenVoorbeeld && !eigenVoorbeeld.fout) eigenVoorbeeld = E.parse(eigenTekst, eigenTz);
      render();
      return;
    }
    if (e.target.hasAttribute && e.target.hasAttribute('data-eigen-bestand')) {
      var bestand = e.target.files && e.target.files[0];
      if (!bestand) return;
      var lezer = new FileReader();
      lezer.onload = function () {
        var r = E.importeer(String(lezer.result));
        if (r.fout) { toon(r.fout); return; }
        _cache = {};
        toon('Ingelezen: ' + r.horoscopen + ' horoscopen, ' + r.tabellen + ' tabellen.');
        render();
      };
      lezer.readAsText(bestand);
      return;
    }
    if (e.target.dataset.veld === 'tijdOnbekend' && formulier) {
      formulier.tijdBekend = !e.target.checked;
      render();
      var v = document.getElementById('v-plaats');
      if (v) v.value = formulier.zoekterm;
    }
  });

  /* De plaatszoeker mag het hele scherm niet opnieuw opbouwen: dan raak je
     de cursor kwijt tijdens het typen. */
  function hertekenFormulier(invoer) {
    var oud = invoer.parentElement.nextElementSibling;
    var suggesties = formulier.zoekterm ? PL.zoek(formulier.zoekterm) : [];
    var html = suggesties.length
      ? '<div class="glas" style="overflow:hidden" data-suggesties>' + suggesties.map(function (p) {
          return '<button type="button" class="lijst-rij" data-kies-plaats="' + esc(p.naam) + '">' +
            '<svg class="icoon icoon-klein"><use href="#i-compass"></use></svg><span>' + esc(p.naam) +
            '</span><span class="gedempt body-sm">' + esc(p.land) + '</span></button>';
        }).join('') + '</div>'
      : '';
    if (oud && oud.hasAttribute('data-suggesties')) oud.remove();
    if (html) invoer.parentElement.insertAdjacentHTML('afterend', html);
    var opslaanKnop = scherm.querySelector('[data-actie="opslaan"]');
    if (opslaanKnop) opslaanKnop.disabled = true;
  }

  knopTerug.addEventListener('click', function () {
    if (history.length > 1) history.back();
    else ga('#/vandaag');
  });
  knopMeldingen.addEventListener('click', function () { ga('#/meldingen'); });

  window.addEventListener('hashchange', render);

  /* ================= sterrenhemel ================= */

  function sterren() {
    var doel = document.getElementById('sterrenhemel');
    var aantal = window.innerWidth < 600 ? 60 : 110;
    var stuk = document.createDocumentFragment();
    for (var i = 0; i < aantal; i++) {
      var s = document.createElement('div');
      s.className = 'ster';
      var maat = Math.random() * 1.8 + 0.6;
      s.style.cssText = 'top:' + (Math.random() * 100).toFixed(2) + '%;left:' +
        (Math.random() * 100).toFixed(2) + '%;width:' + maat.toFixed(1) + 'px;height:' +
        maat.toFixed(1) + 'px;animation-delay:' + (Math.random() * 4).toFixed(2) + 's;' +
        'opacity:' + (0.2 + Math.random() * 0.6).toFixed(2);
      stuk.appendChild(s);
    }
    doel.appendChild(stuk);
  }

  sterren();
  render();
})();
