/* LUNA - eigen gegevens.
   Hiermee lever je zelf planeetstanden aan, in plaats van of naast de formules
   in astro.js. Twee soorten:

   1. Een horoscoop: de standen op een vast moment, bijvoorbeeld je
      geboortehoroscoop zoals een ander programma die berekend heeft.
   2. Een tabel (ephemeride): standen over een reeks datums, die gebruikt wordt
      voor de stand van vandaag, de transits en de maanfase.

   Gegevens kunnen uit twee plaatsen komen:
   - ephemeride.js in deze map, dat je zelf bewerkt (blijft staan, staat in git)
   - de opslag van je browser, gevuld via het scherm Eigen gegevens in de app

   Alle lengtes zijn ecliptische lengtes in graden, van 0 tot 360, gemeten
   vanaf 0° Ram, voor de ecliptica van de datum. Tijden zijn wereldtijd (UT). */
(function (global) {
  'use strict';

  var A = global.LunaAstro;
  var SLEUTEL = 'luna.eigen.v1';

  /* ---------- woordenlijsten ---------- */

  var LICHAMEN = ['zon', 'maan', 'mercurius', 'venus', 'mars', 'jupiter',
                  'saturnus', 'uranus', 'neptunus', 'pluto', 'knoop', 'asc', 'mc'];

  var LICHAAM_ALIAS = {
    'zon': 'zon', 'sun': 'zon', 'sol': 'zon', '☉': 'zon',
    'maan': 'maan', 'moon': 'maan', 'luna': 'maan', '☽': 'maan', '☾': 'maan',
    'mercurius': 'mercurius', 'mercury': 'mercurius', 'merc': 'mercurius', '☿': 'mercurius',
    'venus': 'venus', '♀': 'venus',
    'mars': 'mars', '♂': 'mars',
    'jupiter': 'jupiter', 'jup': 'jupiter', '♃': 'jupiter',
    'saturnus': 'saturnus', 'saturn': 'saturnus', 'sat': 'saturnus', '♄': 'saturnus',
    'uranus': 'uranus', '♅': 'uranus',
    'neptunus': 'neptunus', 'neptune': 'neptunus', 'nep': 'neptunus', '♆': 'neptunus',
    'pluto': 'pluto', '♇': 'pluto',
    'knoop': 'knoop', 'maansknoop': 'knoop', 'noordknoop': 'knoop',
    'noorderknoop': 'knoop', 'node': 'knoop', 'north node': 'knoop',
    'true node': 'knoop', 'mean node': 'knoop', 'ware knoop': 'knoop', '☊': 'knoop',
    'asc': 'asc', 'ac': 'asc', 'ascendant': 'asc', 'rising': 'asc',
    'mc': 'mc', 'midhemel': 'mc', 'midheaven': 'mc', 'medium coeli': 'mc'
  };

  var TEKEN_ALIAS = {
    'ram': 0, 'aries': 0, 'ari': 0, '♈': 0,
    'stier': 1, 'taurus': 1, 'tau': 1, 'sti': 1, '♉': 1,
    'tweelingen': 2, 'gemini': 2, 'gem': 2, 'twe': 2, '♊': 2,
    'kreeft': 3, 'cancer': 3, 'can': 3, 'cnc': 3, 'kre': 3, '♋': 3,
    'leeuw': 4, 'leo': 4, 'lee': 4, '♌': 4,
    'maagd': 5, 'virgo': 5, 'vir': 5, 'mgd': 5, '♍': 5,
    'weegschaal': 6, 'libra': 6, 'lib': 6, 'wee': 6, '♎': 6,
    'schorpioen': 7, 'scorpio': 7, 'sco': 7, 'scp': 7, 'sch': 7, '♏': 7,
    'boogschutter': 8, 'sagittarius': 8, 'sag': 8, 'boo': 8, '♐': 8,
    'steenbok': 9, 'capricorn': 9, 'cap': 9, 'ste': 9, '♑': 9,
    'waterman': 10, 'aquarius': 10, 'aqu': 10, 'aqr': 10, 'wat': 10, '♒': 10,
    'vissen': 11, 'pisces': 11, 'pis': 11, 'vis': 11, '♓': 11
  };

  var LICHAAM_SLEUTELS = Object.keys(LICHAAM_ALIAS).sort(function (a, b) {
    return b.length - a.length;
  });

  /* ---------- kleine hulpjes ---------- */

  function schoon(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[‘’ʼ]/g, "'")
      .replace(/[“”]/g, '"')
      .trim();
  }

  function getallenIn(s) {
    var uit = [], m, re = /(\d+(?:[.,]\d+)?)/g;
    while ((m = re.exec(s))) uit.push(parseFloat(m[1].replace(',', '.')));
    return uit;
  }

  function isRetro(s) {
    return /(^|[\s,;(\[])(r|rx|retro|retrograde|℞)([\s,;)\].]|$)/i.test(' ' + s + ' ');
  }

  function vindLichaam(regel) {
    for (var i = 0; i < LICHAAM_SLEUTELS.length; i++) {
      var alias = LICHAAM_SLEUTELS[i];
      // Aan het begin van de regel, of als los woord ergens in de regel.
      if (regel.indexOf(alias) === 0 &&
          (regel.length === alias.length || /[^a-z]/.test(regel.charAt(alias.length)))) {
        return { lichaam: LICHAAM_ALIAS[alias], rest: regel.slice(alias.length) };
      }
    }
    for (var j = 0; j < LICHAAM_SLEUTELS.length; j++) {
      var a2 = LICHAAM_SLEUTELS[j];
      var re = new RegExp('(^|[^a-z])' + a2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)');
      if (re.test(regel)) return { lichaam: LICHAAM_ALIAS[a2], rest: regel.replace(re, ' ') };
    }
    return null;
  }

  function vindTeken(s) {
    var woorden = s.split(/[^a-z♈-♓]+/).filter(Boolean);
    for (var i = 0; i < woorden.length; i++) {
      var w = woorden[i];
      if (TEKEN_ALIAS.hasOwnProperty(w)) return { index: TEKEN_ALIAS[w], woord: w };
    }
    for (var j = 0; j < s.length; j++) {
      var c = s.charAt(j);
      if (TEKEN_ALIAS.hasOwnProperty(c)) return { index: TEKEN_ALIAS[c], woord: c };
    }
    return null;
  }

  /* Zet een waarde om in een lengte in graden.
     Begrijpt "211.06", "1°03'27\" Schorpioen", "1 Sco 03" en "12 Ram". */
  function leesLengte(waarde) {
    var s = schoon(waarde);
    if (!s) return null;
    var teken = vindTeken(s);
    var g = getallenIn(s);
    if (!g.length) return null;

    if (teken) {
      var graden = g[0], minuten = g[1] || 0, seconden = g[2] || 0;
      if (graden >= 30 || minuten >= 60 || seconden >= 60) return null;
      return {
        lon: A.norm360(teken.index * 30 + graden + minuten / 60 + seconden / 3600),
        retrograde: isRetro(s)
      };
    }
    if (g[0] < 0 || g[0] > 360) return null;
    return { lon: A.norm360(g[0]), retrograde: isRetro(s) };
  }

  /* Datum uit een cel: 1990-10-24, 24-10-1990 of 24/10/1990, eventueel met tijd. */
  function leesDatum(waarde) {
    var s = String(waarde || '').trim();
    var m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
    var jaar, maand, dag, uur = 0, minuut = 0;
    if (m) {
      jaar = +m[1]; maand = +m[2]; dag = +m[3]; uur = +(m[4] || 0); minuut = +(m[5] || 0);
    } else {
      m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
      if (!m) return null;
      dag = +m[1]; maand = +m[2]; jaar = +m[3]; uur = +(m[4] || 0); minuut = +(m[5] || 0);
    }
    if (maand < 1 || maand > 12 || dag < 1 || dag > 31) return null;
    var d = new Date(Date.UTC(2000, maand - 1, dag, uur, minuut, 0));
    d.setUTCFullYear(jaar);
    return { datum: d, jd: A.jdFromDate(d) };
  }

  /* ---------- inlezen ---------- */

  function parse(tekst) {
    var ruw = String(tekst || '').trim();
    if (!ruw) return { fout: 'Er is niets ingevuld.' };

    if (ruw.charAt(0) === '{' || ruw.charAt(0) === '[') return parseJSON(ruw);

    var regels = ruw.split(/\r?\n/).map(function (r) { return r.trim(); }).filter(Boolean);
    var scheiding = kiesScheidingsteken(regels[0]);
    if (scheiding && leesDatum(regels[0].split(scheiding)[0]) === null &&
        regels.length > 1 && leesDatum(regels[1].split(scheiding)[0])) {
      return parseTabel(regels, scheiding);
    }
    if (scheiding && leesDatum(regels[0].split(scheiding)[0])) {
      return { fout: 'Een tabel heeft een kopregel nodig met de namen van de lichamen, ' +
                     'bijvoorbeeld: datum,zon,maan,mercurius' };
    }
    return parseHoroscoop(regels);
  }

  /* Een tabel met maar één lichaam heeft slechts twee kolommen, dus twee velden
     is genoeg. Of het werkelijk een tabel is, beslist de datumcontrole in parse. */
  function kiesScheidingsteken(regel) {
    var kandidaten = ['\t', ';', ','];
    for (var i = 0; i < kandidaten.length; i++) {
      if (regel.split(kandidaten[i]).length >= 2) return kandidaten[i];
    }
    return null;
  }

  function parseJSON(ruw) {
    var obj;
    try { obj = JSON.parse(ruw); }
    catch (e) { return { fout: 'Dit is geen geldige JSON: ' + e.message }; }

    if (obj && obj.punten) {
      var punten = {};
      Object.keys(obj.punten).forEach(function (k) {
        var naam = LICHAAM_ALIAS[schoon(k)];
        if (!naam) return;
        var w = leesLengte(typeof obj.punten[k] === 'object'
          ? obj.punten[k].lon : obj.punten[k]);
        if (!w) return;
        if (typeof obj.punten[k] === 'object' && typeof obj.punten[k].retrograde === 'boolean') {
          w.retrograde = obj.punten[k].retrograde;
        }
        punten[naam] = w;
      });
      if (!Object.keys(punten).length) return { fout: 'Geen bruikbare standen gevonden in "punten".' };
      return { type: 'horoscoop', punten: punten, bron: obj.bron || '', voor: obj.voor || '' };
    }
    if (obj && obj.rijen) {
      return uitRijen(obj.rijen, obj.bron || '');
    }
    return { fout: 'JSON moet een veld "punten" (een horoscoop) of "rijen" (een tabel) bevatten.' };
  }

  function parseHoroscoop(regels) {
    var punten = {}, overgeslagen = [];
    regels.forEach(function (regel) {
      var s = schoon(regel);
      var gevonden = vindLichaam(s);
      if (!gevonden) { overgeslagen.push(regel); return; }
      var w = leesLengte(gevonden.rest);
      if (!w) { overgeslagen.push(regel); return; }
      if (isRetro(s)) w.retrograde = true;
      punten[gevonden.lichaam] = w;
    });
    if (!Object.keys(punten).length) {
      return { fout: 'Geen standen herkend. Verwacht regels als: Zon 1°03\' Schorpioen' };
    }
    return { type: 'horoscoop', punten: punten, overgeslagen: overgeslagen };
  }

  function parseTabel(regels, scheiding) {
    var kop = regels[0].split(scheiding).map(function (c) { return schoon(c); });
    var kolommen = kop.map(function (c, i) {
      if (i === 0) return null;
      return LICHAAM_ALIAS[c] || null;
    });
    if (!kolommen.filter(Boolean).length) {
      return { fout: 'Geen bekende lichamen in de kopregel. Gebruik namen als zon, maan, mercurius.' };
    }
    var rijen = [], fouten = 0;
    for (var i = 1; i < regels.length; i++) {
      var cellen = regels[i].split(scheiding);
      var d = leesDatum(cellen[0]);
      if (!d) { fouten++; continue; }
      var waarden = {};
      for (var k = 1; k < cellen.length; k++) {
        if (!kolommen[k]) continue;
        var w = leesLengte(cellen[k]);
        if (w) waarden[kolommen[k]] = w.lon;
      }
      if (Object.keys(waarden).length) rijen.push({ jd: d.jd, w: waarden });
    }
    if (!rijen.length) return { fout: 'Geen bruikbare regels gevonden onder de kopregel.' };
    var res = uitRijen(rijen, '');
    res.fouteRegels = fouten;
    return res;
  }

  function uitRijen(rijen, bron) {
    var reeksen = {};
    rijen.forEach(function (rij) {
      var jd = typeof rij.jd === 'number' ? rij.jd : (leesDatum(rij.datum) || {}).jd;
      if (typeof jd !== 'number') return;
      var w = rij.w || rij.waarden || rij;
      Object.keys(w).forEach(function (k) {
        var naam = LICHAAM_ALIAS[schoon(k)];
        if (!naam || k === 'jd' || k === 'datum') return;
        var lengte = leesLengte(typeof w[k] === 'object' ? w[k].lon : w[k]);
        if (!lengte) return;
        (reeksen[naam] || (reeksen[naam] = [])).push({ jd: jd, lon: lengte.lon });
      });
    });
    var lichamen = Object.keys(reeksen);
    if (!lichamen.length) return { fout: 'Geen bruikbare standen in de tabel.' };

    var aantal = 0, van = Infinity, tot = -Infinity;
    lichamen.forEach(function (k) {
      reeksen[k].sort(function (a, b) { return a.jd - b.jd; });
      aantal += reeksen[k].length;
      van = Math.min(van, reeksen[k][0].jd);
      tot = Math.max(tot, reeksen[k][reeksen[k].length - 1].jd);
    });
    return {
      type: 'tabel', reeksen: reeksen, lichamen: lichamen, bron: bron,
      aantal: aantal, van: van, tot: tot
    };
  }

  /* ---------- tussenwaarden ---------- */

  /* Lagrange-interpolatie over vier punten. De lengtes worden eerst
     ontrold, zodat de sprong van 359° naar 0° geen uitschieter geeft. */
  function interpoleer(reeks, jd) {
    var n = reeks.length;
    if (!n) return null;
    if (jd < reeks[0].jd - 1e-9 || jd > reeks[n - 1].jd + 1e-9) return null;
    if (n === 1) return Math.abs(jd - reeks[0].jd) < 1e-9 ? reeks[0].lon : null;

    var lo = 0, hi = n - 1;
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (reeks[mid].jd <= jd) lo = mid; else hi = mid;
    }

    var start = Math.max(0, Math.min(lo - 1, n - 4));
    var punten = reeks.slice(start, start + Math.min(4, n));

    var basis = punten[0].lon, x = [], y = [], vorige = basis;
    punten.forEach(function (p) {
      var lon = p.lon;
      while (lon - vorige > 180) lon -= 360;
      while (vorige - lon > 180) lon += 360;
      vorige = lon;
      x.push(p.jd);
      y.push(lon);
    });

    var som = 0;
    for (var i = 0; i < x.length; i++) {
      var term = y[i];
      for (var j = 0; j < x.length; j++) {
        if (i === j) continue;
        term *= (jd - x[j]) / (x[i] - x[j]);
      }
      som += term;
    }
    return A.norm360(som);
  }

  /* ---------- opslag ---------- */

  function leegOpslag() { return { horoscopen: [], tabellen: [] }; }

  function laden() {
    try {
      var ruw = localStorage.getItem(SLEUTEL);
      if (!ruw) return leegOpslag();
      var s = JSON.parse(ruw);
      return { horoscopen: s.horoscopen || [], tabellen: s.tabellen || [] };
    } catch (e) {
      return leegOpslag();
    }
  }

  var opslag = laden();

  function bewaren() {
    try {
      localStorage.setItem(SLEUTEL, JSON.stringify(opslag));
      bouwBron();
      return { ok: true };
    } catch (e) {
      return { ok: false, fout: 'Opslaan lukte niet; de tabel is waarschijnlijk te groot ' +
                                'voor de opslag van je browser. Zet hem in ephemeride.js.' };
    }
  }

  function uitBestand() {
    var b = global.LunaEphemeride;
    if (!b) return leegOpslag();
    var horoscopen = (b.horoscopen || []).map(function (h, i) {
      var punten = {};
      Object.keys(h.punten || {}).forEach(function (k) {
        var naam = LICHAAM_ALIAS[schoon(k)];
        var w = leesLengte(typeof h.punten[k] === 'object' ? h.punten[k].lon : h.punten[k]);
        if (naam && w) {
          if (typeof h.punten[k] === 'object' && typeof h.punten[k].retrograde === 'boolean') {
            w.retrograde = h.punten[k].retrograde;
          }
          punten[naam] = w;
        }
      });
      return { id: 'bestand-h' + i, voor: h.voor || '', bron: h.bron || 'ephemeride.js',
               punten: punten, vast: true };
    }).filter(function (h) { return Object.keys(h.punten).length; });

    var tabellen = (b.tabellen || []).map(function (t, i) {
      var res = uitRijen(t.rijen || [], t.bron || 'ephemeride.js');
      if (res.fout) return null;
      res.id = 'bestand-t' + i;
      res.vast = true;
      return res;
    }).filter(Boolean);

    return { horoscopen: horoscopen, tabellen: tabellen };
  }

  function alles() {
    var b = uitBestand();
    return {
      horoscopen: b.horoscopen.concat(opslag.horoscopen),
      tabellen: b.tabellen.concat(opslag.tabellen)
    };
  }

  function horoscoopVoor(naam) {
    var doel = schoon(naam);
    if (!doel) return null;
    var lijst = alles().horoscopen;
    // Later toegevoegde gegevens winnen van eerdere.
    for (var i = lijst.length - 1; i >= 0; i--) {
      if (schoon(lijst[i].voor) === doel) return lijst[i];
    }
    return null;
  }

  function overschrijfVoor(naam) {
    var h = horoscoopVoor(naam);
    return h ? h.punten : null;
  }

  /* ---------- bron voor astro.js ---------- */

  function bouwBron() {
    var tabellen = alles().tabellen;
    if (!tabellen.length) { A.zetBron(null); return false; }
    A.zetBron(function (lichaam, jd) {
      for (var i = tabellen.length - 1; i >= 0; i--) {
        var reeks = tabellen[i].reeksen[lichaam];
        if (!reeks) continue;
        var lon = interpoleer(reeks, jd);
        if (lon !== null) return { lon: lon };
      }
      return null;
    });
    return true;
  }

  /* ---------- vergelijken ---------- */

  /* Zet eigen standen naast de berekende, zodat je ziet of ze goed zijn
     ingelezen. Verschil in boogminuten, met het teken erbij. */
  function vergelijk(punten, jd) {
    var uit = [];
    LICHAMEN.forEach(function (k) {
      if (!punten[k]) return;
      var eigen = punten[k].lon;
      var berekend = null;
      if (k !== 'asc' && k !== 'mc' && typeof jd === 'number') {
        var bewaard = A.heeftBron();
        if (bewaard) A.zetBron(null);
        berekend = A.bodyPosition(k, jd).lon;
        if (bewaard) bouwBron();
      }
      uit.push({
        lichaam: k,
        eigen: eigen,
        berekend: berekend,
        verschil: berekend === null ? null : A.norm180(eigen - berekend) * 60,
        retrograde: !!punten[k].retrograde
      });
    });
    return uit;
  }

  /* ---------- beheer ---------- */

  function idNieuw() {
    return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function voegHoroscoopToe(punten, voor, bron) {
    var vermelding = { id: idNieuw(), voor: voor || '', bron: bron || '',
                       punten: punten, aangemaakt: new Date().toISOString() };
    opslag.horoscopen.push(vermelding);
    var r = bewaren();
    return r.ok ? vermelding : r;
  }

  function voegTabelToe(tabel, bron) {
    var vermelding = {
      id: idNieuw(), bron: bron || tabel.bron || '', reeksen: tabel.reeksen,
      lichamen: tabel.lichamen, aantal: tabel.aantal, van: tabel.van, tot: tabel.tot,
      aangemaakt: new Date().toISOString()
    };
    opslag.tabellen.push(vermelding);
    var r = bewaren();
    return r.ok ? vermelding : r;
  }

  function verwijder(id) {
    opslag.horoscopen = opslag.horoscopen.filter(function (h) { return h.id !== id; });
    opslag.tabellen = opslag.tabellen.filter(function (t) { return t.id !== id; });
    bewaren();
  }

  function wisAlles() {
    opslag = leegOpslag();
    bewaren();
  }

  function exporteer() {
    return JSON.stringify({
      soort: 'luna-eigen-data', versie: 1,
      horoscopen: opslag.horoscopen, tabellen: opslag.tabellen
    }, null, 2);
  }

  function importeer(tekst) {
    var obj;
    try { obj = JSON.parse(tekst); }
    catch (e) { return { fout: 'Dit is geen geldige JSON.' }; }
    if (!obj || obj.soort !== 'luna-eigen-data') {
      return { fout: 'Dit bestand komt niet uit LUNA.' };
    }
    (obj.horoscopen || []).forEach(function (h) {
      h.id = h.id || idNieuw();
      opslag.horoscopen.push(h);
    });
    (obj.tabellen || []).forEach(function (t) {
      t.id = t.id || idNieuw();
      opslag.tabellen.push(t);
    });
    var r = bewaren();
    return r.ok
      ? { ok: true, horoscopen: (obj.horoscopen || []).length, tabellen: (obj.tabellen || []).length }
      : r;
  }

  /* Als ephemeride.js of de browseropslag iets bevat, staat de bron meteen aan. */
  bouwBron();

  global.LunaEigenData = {
    LICHAMEN: LICHAMEN,
    parse: parse, leesLengte: leesLengte, leesDatum: leesDatum,
    interpoleer: interpoleer,
    alles: alles, horoscoopVoor: horoscoopVoor, overschrijfVoor: overschrijfVoor,
    vergelijk: vergelijk, bouwBron: bouwBron,
    voegHoroscoopToe: voegHoroscoopToe, voegTabelToe: voegTabelToe,
    verwijder: verwijder, wisAlles: wisAlles,
    exporteer: exporteer, importeer: importeer
  };
})(typeof window !== 'undefined' ? window : globalThis);
