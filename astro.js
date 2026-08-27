/* LUNA - astronomische kern.
   Berekent echte posities van zon, maan en planeten, plus ascendant,
   huizen en aspecten. Alles offline, zonder externe diensten.

   Bronnen van de gebruikte formules:
   - Zon: Meeus, Astronomical Algorithms, hoofdstuk 25 (lage precisie, ~0,01 graad).
   - Maan: Schlyter, "How to compute planetary positions" (~2 boogminuten).
   - Planeten: Standish (JPL), Keplerelementen met eeuwlijkse drift,
     geldig voor 1800-2050 (enkele boogminuten).
   Voor astrologie is dat ruim voldoende: het gaat om graden, niet om
   boogseconden. */
(function (global) {
  'use strict';

  var D2R = Math.PI / 180, R2D = 180 / Math.PI;

  function norm360(a) { return ((a % 360) + 360) % 360; }
  function norm180(a) { var x = norm360(a); return x > 180 ? x - 360 : x; }
  function sin(a) { return Math.sin(a * D2R); }
  function cos(a) { return Math.cos(a * D2R); }
  function tan(a) { return Math.tan(a * D2R); }

  /* ---------- tijd ---------- */

  function jdFromDate(date) { return date.getTime() / 86400000 + 2440587.5; }
  function dateFromJD(jd) { return new Date(Math.round((jd - 2440587.5) * 86400000)); }
  function centuries(jd) { return (jd - 2451545.0) / 36525; }

  /* Offset (in minuten) van een tijdzone op een bepaald moment. Gebruikt de
     IANA-database van de browser, dus historische zomertijd klopt gewoon. */
  function tzOffsetMinutes(date, tz) {
    try {
      var dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      var p = {};
      dtf.formatToParts(date).forEach(function (part) { p[part.type] = part.value; });
      var hour = parseInt(p.hour, 10); if (hour === 24) hour = 0;
      var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, hour, +p.minute, +p.second);
      return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000;
    } catch (e) {
      return null;
    }
  }

  /* Lokale kloktijd op een plek -> het werkelijke moment (UTC). */
  function zonedTimeToUTC(y, mo, d, h, mi, tz, fallbackOffsetMin) {
    var guess = new Date(Date.UTC(2000, mo - 1, d, h, mi, 0));
    guess.setUTCFullYear(y);
    var t = guess.getTime();
    var off = tzOffsetMinutes(new Date(t), tz);
    if (off === null) off = fallbackOffsetMin || 0;
    var utc = t - off * 60000;
    var off2 = tzOffsetMinutes(new Date(utc), tz);
    if (off2 !== null && off2 !== off) utc = t - off2 * 60000;
    return new Date(utc);
  }

  /* Scheve stand van de aardas (schuinte van de ecliptica). */
  function obliquity(jd) {
    var T = centuries(jd);
    return 23.439291 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
  }

  /* Nutatie in lengte, benaderd met de hoofdterm. */
  function nutation(jd) {
    var T = centuries(jd);
    var om = 125.04452 - 1934.136261 * T;
    return -0.00478 * sin(om);
  }

  /* Precessie van de ecliptica-lengte, van J2000 naar de datum. */
  function precessionJ2000(jd) {
    var T = centuries(jd);
    return (5029.0966 * T + 1.11113 * T * T) / 3600;
  }

  /* ---------- zon ---------- */

  function sunPosition(jd) {
    var T = centuries(jd);
    var L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    var M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M)
          + (0.019993 - 0.000101 * T) * sin(2 * M)
          + 0.000289 * sin(3 * M);
    var trueLon = L0 + C;
    var v = M + C;
    var e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
    var R = 1.000001018 * (1 - e * e) / (1 + e * cos(v));
    return { lon: norm360(trueLon - 0.00569 + nutation(jd)), lat: 0, dist: R };
  }

  /* ---------- maan ---------- */

  function moonPosition(jd) {
    var d = jd - 2451543.5;

    // Elementen van de maanbaan.
    var N = 125.1228 - 0.0529538083 * d;
    var i = 5.1454;
    var w = 318.0634 + 0.1643573223 * d;
    var a = 60.2666;
    var e = 0.054900;
    var M = norm360(115.3654 + 13.0649929509 * d);

    // Elementen van de zon, nodig voor de storingstermen.
    var ws = 282.9404 + 4.70935e-5 * d;
    var Ms = norm360(356.0470 + 0.9856002585 * d);

    // Excentrische anomalie.
    var E = M + (180 / Math.PI) * e * sin(M) * (1 + e * cos(M));
    for (var k = 0; k < 8; k++) {
      var dE = (E - (180 / Math.PI) * e * sin(E) - M) / (1 - e * cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-9) break;
    }

    var x = a * (cos(E) - e);
    var y = a * Math.sqrt(1 - e * e) * sin(E);
    var r = Math.sqrt(x * x + y * y);
    var v = norm360(Math.atan2(y, x) * R2D);

    // Naar ecliptische coordinaten.
    var xe = r * (cos(N) * cos(v + w) - sin(N) * sin(v + w) * cos(i));
    var ye = r * (sin(N) * cos(v + w) + cos(N) * sin(v + w) * cos(i));
    var ze = r * sin(v + w) * sin(i);

    var lon = norm360(Math.atan2(ye, xe) * R2D);
    var lat = Math.atan2(ze, Math.sqrt(xe * xe + ye * ye)) * R2D;

    // Storingen (Meeus/Schlyter, de twaalf grootste in lengte).
    var Ls = norm360(Ms + ws);
    var Lm = norm360(M + w + N);
    var D = norm360(Lm - Ls);
    var F = norm360(Lm - N);

    lon += -1.274 * sin(M - 2 * D)
        +  0.658 * sin(2 * D)
        -  0.186 * sin(Ms)
        -  0.059 * sin(2 * M - 2 * D)
        -  0.057 * sin(M - 2 * D + Ms)
        +  0.053 * sin(M + 2 * D)
        +  0.046 * sin(2 * D - Ms)
        +  0.041 * sin(M - Ms)
        -  0.035 * sin(D)
        -  0.031 * sin(M + Ms)
        -  0.015 * sin(2 * F - 2 * D)
        +  0.011 * sin(M - 4 * D);

    lat += -0.173 * sin(F - 2 * D)
        -  0.055 * sin(M - F - 2 * D)
        -  0.046 * sin(M + F - 2 * D)
        +  0.033 * sin(F + 2 * D)
        +  0.017 * sin(2 * M + F);

    r += -0.58 * cos(M - 2 * D) - 0.46 * cos(2 * D);

    return { lon: norm360(lon + nutation(jd)), lat: lat, dist: r };
  }

  /* Maansknoop: het punt waar de maanbaan de ecliptica kruist. */
  function nodePosition(jd) {
    var d = jd - 2451543.5;
    return { lon: norm360(125.1228 - 0.0529538083 * d), lat: 0, dist: 0, retro: true };
  }

  /* ---------- planeten ---------- */

  /* Keplerelementen op J2000 en hun verandering per eeuw:
     a (AE), e, I (graden), L (graden), lange perihelium, lange klimmende knoop. */
  var ELEMENTS = {
    mercurius: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
                [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
    venus:     [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
                [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
    aarde:     [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
                [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
    mars:      [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
                [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
    jupiter:   [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
                [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
    saturnus:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
                [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
    uranus:    [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503],
                [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
    neptunus:  [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
                [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
    pluto:     [[39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684],
                [-0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]]
    };

  /* Heliocentrische rechthoekige coordinaten in het J2000-eclipticavlak. */
  function heliocentric(name, jd) {
    var el = ELEMENTS[name];
    var T = centuries(jd);
    var a = el[0][0] + el[1][0] * T;
    var e = el[0][1] + el[1][1] * T;
    var I = el[0][2] + el[1][2] * T;
    var L = el[0][3] + el[1][3] * T;
    var peri = el[0][4] + el[1][4] * T;
    var node = el[0][5] + el[1][5] * T;

    var argPeri = peri - node;
    var M = norm180(L - peri);

    var E = M + (180 / Math.PI) * e * sin(M);
    for (var k = 0; k < 12; k++) {
      var dE = (M - (E - (180 / Math.PI) * e * sin(E))) / (1 - e * cos(E));
      E += dE;
      if (Math.abs(dE) < 1e-9) break;
    }

    var xp = a * (cos(E) - e);
    var yp = a * Math.sqrt(1 - e * e) * sin(E);

    var cw = cos(argPeri), sw = sin(argPeri);
    var cn = cos(node), sn = sin(node);
    var ci = cos(I), si = sin(I);

    return {
      x: (cw * cn - sw * sn * ci) * xp + (-sw * cn - cw * sn * ci) * yp,
      y: (cw * sn + sw * cn * ci) * xp + (-sw * sn + cw * cn * ci) * yp,
      z: (sw * si) * xp + (cw * si) * yp
    };
  }

  var LIGHT_DAYS_PER_AU = 0.005775518;

  /* Geocentrische ecliptische lengte en breedte, gecorrigeerd voor
     lichtlooptijd en omgerekend naar de ecliptica van de datum. */
  function planetPosition(name, jd) {
    var earth = heliocentric('aarde', jd);
    var p = heliocentric(name, jd);
    var dx, dy, dz, dist;
    for (var i = 0; i < 2; i++) {
      dx = p.x - earth.x; dy = p.y - earth.y; dz = p.z - earth.z;
      dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      p = heliocentric(name, jd - dist * LIGHT_DAYS_PER_AU);
    }
    dx = p.x - earth.x; dy = p.y - earth.y; dz = p.z - earth.z;
    dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    var lon = norm360(Math.atan2(dy, dx) * R2D + precessionJ2000(jd) + nutation(jd));
    var lat = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)) * R2D;
    return { lon: lon, lat: lat, dist: dist };
  }

  /* ---------- alle punten samen ---------- */

  var BODIES = ['zon', 'maan', 'mercurius', 'venus', 'mars', 'jupiter',
                'saturnus', 'uranus', 'neptunus', 'pluto', 'knoop'];

  /* Eigen gegevens gaan voor op de formules.
     Een bron is een functie (naam, jd) die {lon: graden} teruggeeft, of null
     wanneer zij die stand niet kent; dan rekenen we hem gewoon zelf uit.
     De bron moet aaneengesloten zijn over het bereik dat zij dekt, want de
     snelheid wordt bepaald uit de stand een halve dag eerder en later. */
  var _bron = null;

  function zetBron(fn) { _bron = typeof fn === 'function' ? fn : null; }
  function heeftBron() { return !!_bron; }

  function bodyPosition(name, jd) {
    if (_bron) {
      var eigen = _bron(name, jd);
      if (eigen && typeof eigen.lon === 'number' && !isNaN(eigen.lon)) {
        return {
          lon: norm360(eigen.lon),
          lat: typeof eigen.lat === 'number' ? eigen.lat : 0,
          dist: typeof eigen.dist === 'number' ? eigen.dist : 0,
          eigen: true
        };
      }
    }
    if (name === 'zon') return sunPosition(jd);
    if (name === 'maan') return moonPosition(jd);
    if (name === 'knoop') return nodePosition(jd);
    return planetPosition(name, jd);
  }

  /* Snelheid in graden per dag; negatief betekent schijnbaar teruglopend. */
  function speed(name, jd) {
    var step = name === 'maan' ? 0.05 : 0.5;
    var a = bodyPosition(name, jd - step).lon;
    var b = bodyPosition(name, jd + step).lon;
    return norm180(b - a) / (2 * step);
  }

  function positions(jd) {
    var out = {};
    BODIES.forEach(function (name) {
      var p = bodyPosition(name, jd);
      var v = name === 'knoop' ? -0.0529538083 : speed(name, jd);
      out[name] = {
        naam: name,
        lon: p.lon,
        lat: p.lat,
        dist: p.dist,
        snelheid: v,
        retrograde: v < 0,
        teken: Math.floor(p.lon / 30),
        graad: p.lon % 30,
        eigen: !!p.eigen
      };
    });
    return out;
  }

  /* ---------- ascendant, MC en huizen ---------- */

  function siderealTime(jd, lonOost) {
    var T = centuries(jd);
    var theta = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
              + 0.000387933 * T * T - T * T * T / 38710000;
    return norm360(theta + lonOost);
  }

  function ascendantMC(jd, lat, lonOost) {
    var ramc = siderealTime(jd, lonOost);
    var eps = obliquity(jd);

    var mc = norm360(Math.atan2(sin(ramc), cos(ramc) * cos(eps)) * R2D);

    var x = cos(ramc);
    var y = -(sin(ramc) * cos(eps) + tan(lat) * sin(eps));
    var asc = norm360(Math.atan2(x, y) * R2D);

    return { asc: asc, mc: mc, ramc: ramc };
  }

  /* Hele-tekenhuizen: elk huis beslaat precies een sterrenbeeld, te beginnen
     bij het teken van de ascendant. */
  function houses(ascLon) {
    var start = Math.floor(ascLon / 30) * 30;
    var out = [];
    for (var i = 0; i < 12; i++) out.push(norm360(start + i * 30));
    return out;
  }

  function houseOf(lon, cusps) {
    for (var i = 0; i < 12; i++) {
      var a = cusps[i], b = cusps[(i + 1) % 12];
      var span = norm360(b - a) || 360;
      if (norm360(lon - a) < span) return i + 1;
    }
    return 1;
  }

  /* ---------- aspecten ---------- */

  var ASPECTS = [
    { id: 'conjunctie', hoek: 0,   orb: 8, aard: 'neutraal' },
    { id: 'sextiel',    hoek: 60,  orb: 4, aard: 'harmonisch' },
    { id: 'vierkant',   hoek: 90,  orb: 6, aard: 'spanning' },
    { id: 'driehoek',   hoek: 120, orb: 6, aard: 'harmonisch' },
    { id: 'oppositie',  hoek: 180, orb: 7, aard: 'spanning' }
  ];

  /* Lichten krijgen een ruimere orb dan de kleine planeten. */
  function orbFactor(a, b) {
    var groot = { zon: 1, maan: 1 };
    var f = 1;
    if (groot[a] || groot[b]) f += 0.25;
    if (a === 'knoop' || b === 'knoop') f -= 0.35;
    return f;
  }

  function aspectBetween(lonA, lonB, nameA, nameB) {
    var diff = Math.abs(norm180(lonA - lonB));
    for (var i = 0; i < ASPECTS.length; i++) {
      var asp = ASPECTS[i];
      var orb = asp.orb * orbFactor(nameA, nameB);
      var afwijking = Math.abs(diff - asp.hoek);
      if (afwijking <= orb) {
        return {
          type: asp.id, aard: asp.aard, hoek: asp.hoek,
          orb: afwijking, sterkte: 1 - afwijking / orb
        };
      }
    }
    return null;
  }

  function chartAspects(punten, namen) {
    var out = [];
    for (var i = 0; i < namen.length; i++) {
      for (var j = i + 1; j < namen.length; j++) {
        var a = namen[i], b = namen[j];
        if (!punten[a] || !punten[b]) continue;
        var asp = aspectBetween(punten[a].lon, punten[b].lon, a, b);
        if (asp) {
          asp.a = a; asp.b = b;
          out.push(asp);
        }
      }
    }
    return out.sort(function (p, q) { return q.sterkte - p.sterkte; });
  }

  /* ---------- maanfase ---------- */

  var PHASE_NAMES = ['Nieuwe Maan', 'Wassende Sikkel', 'Eerste Kwartier',
    'Wassende Maan', 'Volle Maan', 'Afnemende Maan', 'Laatste Kwartier',
    'Afnemende Sikkel'];

  function moonPhase(jd) {
    var s = sunPosition(jd), m = moonPosition(jd);
    var elong = norm360(m.lon - s.lon);
    var illum = (1 - cos(elong)) / 2;
    var idx = Math.floor(norm360(elong + 22.5) / 45) % 8;
    return {
      elongatie: elong,
      verlichting: illum,
      index: idx,
      naam: PHASE_NAMES[idx],
      wassend: elong < 180,
      maanTeken: Math.floor(m.lon / 30),
      maanLon: m.lon
    };
  }

  /* Zoekt het eerstvolgende moment waarop de elongatie zon-maan een bepaalde
     waarde bereikt (0 = nieuwe maan, 180 = volle maan). */
  function nextPhaseJD(jd, doelElongatie) {
    function f(t) {
      return norm180(norm360(moonPosition(t).lon - sunPosition(t).lon) - doelElongatie);
    }
    var t = jd;
    var stap = 0.5;
    var vorige = f(t);
    for (var i = 0; i < 120; i++) {
      var volgende = f(t + stap);
      if (vorige < 0 && volgende >= 0) {
        var lo = t, hi = t + stap;
        for (var k = 0; k < 40; k++) {
          var mid = (lo + hi) / 2;
          if (f(mid) < 0) lo = mid; else hi = mid;
        }
        return (lo + hi) / 2;
      }
      t += stap;
      vorige = volgende;
    }
    return null;
  }

  /* Wanneer stapt een lichaam naar het volgende teken? */
  function nextSignChange(name, jd, maxDagen) {
    var start = Math.floor(bodyPosition(name, jd).lon / 30);
    var stap = name === 'maan' ? 0.05 : 0.5;
    for (var t = jd; t < jd + (maxDagen || 60); t += stap) {
      if (Math.floor(bodyPosition(name, t).lon / 30) !== start) {
        var lo = t - stap, hi = t;
        for (var k = 0; k < 30; k++) {
          var mid = (lo + hi) / 2;
          if (Math.floor(bodyPosition(name, mid).lon / 30) === start) lo = mid; else hi = mid;
        }
        return { jd: (lo + hi) / 2, teken: Math.floor(bodyPosition(name, hi).lon / 30) };
      }
    }
    return null;
  }

  /* ---------- horoscoop ---------- */

  /* Zet een punt op een opgegeven lengte, ongeacht wat de formules zeggen. */
  function zetPunt(punten, naam, waarde) {
    var lon = typeof waarde === 'number' ? waarde : (waarde && waarde.lon);
    if (typeof lon !== 'number' || isNaN(lon)) return false;
    lon = norm360(lon);
    var p = punten[naam] || (punten[naam] = {
      naam: naam, lat: 0, dist: 0, snelheid: 0, retrograde: false
    });
    p.lon = lon;
    p.teken = Math.floor(lon / 30);
    p.graad = lon % 30;
    p.eigen = true;
    if (waarde && typeof waarde === 'object') {
      if (typeof waarde.retrograde === 'boolean') p.retrograde = waarde.retrograde;
      if (typeof waarde.lat === 'number') p.lat = waarde.lat;
      if (typeof waarde.snelheid === 'number') p.snelheid = waarde.snelheid;
    }
    return true;
  }

  function chart(opties) {
    var jd = opties.jd;
    var punten = positions(jd);
    var namen = BODIES.slice();
    var res = { jd: jd, punten: punten, tijdBekend: !!opties.tijdBekend };

    if (opties.tijdBekend && typeof opties.lat === 'number') {
      var am = ascendantMC(jd, opties.lat, opties.lon);
      punten.asc = { naam: 'asc', lon: am.asc, lat: 0, snelheid: 0, retrograde: false,
                     teken: Math.floor(am.asc / 30), graad: am.asc % 30 };
      punten.mc = { naam: 'mc', lon: am.mc, lat: 0, snelheid: 0, retrograde: false,
                    teken: Math.floor(am.mc / 30), graad: am.mc % 30 };
      namen = namen.concat(['asc', 'mc']);
    }

    // Eigen standen gaan hier overheen. Zo kun je ook een ascendant opgeven
    // wanneer je geboortetijd onbekend is maar je hem elders hebt laten bepalen.
    if (opties.overschrijf) {
      Object.keys(opties.overschrijf).forEach(function (k) {
        if (!zetPunt(punten, k, opties.overschrijf[k])) return;
        if (namen.indexOf(k) < 0) namen.push(k);
        res.overschreven = true;
      });
    }

    if (punten.asc) {
      res.huizen = houses(punten.asc.lon);
      Object.keys(punten).forEach(function (k) {
        punten[k].huis = houseOf(punten[k].lon, res.huizen);
      });
    }

    res.namen = namen;
    res.aspecten = chartAspects(punten, namen);
    return res;
  }

  /* Transits: waar staan de planeten nu ten opzichte van de geboortehoroscoop? */
  function transits(natal, jd) {
    var nu = positions(jd);
    var doelen = natal.namen.filter(function (n) { return n !== 'knoop'; });
    var lopers = ['zon', 'maan', 'mercurius', 'venus', 'mars', 'jupiter',
                  'saturnus', 'uranus', 'neptunus', 'pluto'];
    var out = [];
    lopers.forEach(function (t) {
      doelen.forEach(function (n) {
        var asp = aspectBetween(nu[t].lon, natal.punten[n].lon, t, n);
        if (!asp) return;
        // Wordt het aspect exacter (aanlopend) of loopt het uit (aflopend)?
        var later = aspectBetween(
          bodyPosition(t, jd + 0.1).lon, natal.punten[n].lon, t, n);
        asp.transit = t;
        asp.natal = n;
        asp.aanlopend = later ? later.orb < asp.orb : false;
        asp.lonTransit = nu[t].lon;
        asp.retrograde = nu[t].retrograde;
        out.push(asp);
      });
    });
    return out.sort(function (p, q) { return q.sterkte - p.sterkte; });
  }

  /* Synastrie: aspecten tussen twee horoscopen. */
  function synastry(a, b) {
    var out = [];
    var namenA = a.namen.filter(function (n) { return n !== 'knoop'; });
    var namenB = b.namen.filter(function (n) { return n !== 'knoop'; });
    namenA.forEach(function (na) {
      namenB.forEach(function (nb) {
        var asp = aspectBetween(a.punten[na].lon, b.punten[nb].lon, na, nb);
        if (asp) { asp.a = na; asp.b = nb; out.push(asp); }
      });
    });
    return out.sort(function (p, q) { return q.sterkte - p.sterkte; });
  }

  global.LunaAstro = {
    D2R: D2R, R2D: R2D,
    norm360: norm360, norm180: norm180,
    jdFromDate: jdFromDate, dateFromJD: dateFromJD, centuries: centuries,
    tzOffsetMinutes: tzOffsetMinutes, zonedTimeToUTC: zonedTimeToUTC,
    obliquity: obliquity,
    sunPosition: sunPosition, moonPosition: moonPosition,
    planetPosition: planetPosition, bodyPosition: bodyPosition,
    positions: positions, speed: speed,
    siderealTime: siderealTime, ascendantMC: ascendantMC,
    houses: houses, houseOf: houseOf,
    ASPECTS: ASPECTS, aspectBetween: aspectBetween, chartAspects: chartAspects,
    moonPhase: moonPhase, PHASE_NAMES: PHASE_NAMES,
    nextPhaseJD: nextPhaseJD, nextSignChange: nextSignChange,
    chart: chart, transits: transits, synastry: synastry,
    zetBron: zetBron, heeftBron: heeftBron, zetPunt: zetPunt,
    BODIES: BODIES
  };
})(typeof window !== 'undefined' ? window : globalThis);
