/* LUNA - eigen duiding.
   Hiermee bewaar je een volledig, zelf aangeleverd duidingsrapport bij een
   profiel of relatie: een lopend document in platte tekst met een beetje
   opmaak (Markdown-achtig), los van de korte teksten die LUNA zelf
   genereert uit de berekende standen.

   Alles staat in de opslag van deze browser. Er is geen standaardinhoud en
   er wordt niets automatisch meegenomen naar de repository: dit zijn
   persoonlijke teksten, en die horen niet ongevraagd in een publieke plek
   terecht te komen. */
(function (global) {
  'use strict';

  var SLEUTEL = 'luna.eigenduiding.v1';

  function laden() {
    try {
      var ruw = localStorage.getItem(SLEUTEL);
      if (!ruw) return [];
      var s = JSON.parse(ruw);
      return Array.isArray(s.documenten) ? s.documenten : [];
    } catch (e) {
      return [];
    }
  }

  var documenten = laden();

  function bewaren() {
    try {
      localStorage.setItem(SLEUTEL, JSON.stringify({ documenten: documenten }));
      return { ok: true };
    } catch (e) {
      return { ok: false, fout: 'Opslaan lukte niet; dit document is waarschijnlijk te groot ' +
                                'voor de opslag van je browser.' };
    }
  }

  function idNieuw() {
    return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function lijst() {
    return documenten.slice().sort(function (a, b) {
      return (b.bijgewerkt || b.aangemaakt || '').localeCompare(a.bijgewerkt || a.aangemaakt || '');
    });
  }

  function voorPersoon(naam) {
    var doel = String(naam || '').trim().toLowerCase();
    if (!doel) return [];
    return lijst().filter(function (d) { return d.voor.trim().toLowerCase() === doel; });
  }

  function geef(id) {
    return documenten.filter(function (d) { return d.id === id; })[0] || null;
  }

  function toevoegen(velden) {
    var doc = {
      id: idNieuw(),
      voor: (velden.voor || '').trim(),
      titel: (velden.titel || '').trim() || 'Volledige duiding',
      bron: (velden.bron || '').trim(),
      tekst: velden.tekst || '',
      aangemaakt: new Date().toISOString()
    };
    if (!doc.voor || !doc.tekst.trim()) return { fout: 'Er is geen persoon of geen tekst opgegeven.' };
    documenten.push(doc);
    var r = bewaren();
    return r.ok ? doc : r;
  }

  function bewerken(id, velden) {
    var doc = geef(id);
    if (!doc) return { fout: 'Dit document bestaat niet meer.' };
    if (typeof velden.voor === 'string') doc.voor = velden.voor.trim();
    if (typeof velden.titel === 'string') doc.titel = velden.titel.trim() || 'Volledige duiding';
    if (typeof velden.bron === 'string') doc.bron = velden.bron.trim();
    if (typeof velden.tekst === 'string') doc.tekst = velden.tekst;
    doc.bijgewerkt = new Date().toISOString();
    var r = bewaren();
    return r.ok ? doc : r;
  }

  function verwijder(id) {
    documenten = documenten.filter(function (d) { return d.id !== id; });
    bewaren();
  }

  function exporteer() {
    return JSON.stringify({ soort: 'luna-eigen-duiding', versie: 1, documenten: documenten }, null, 2);
  }

  function importeer(tekst) {
    var obj;
    try { obj = JSON.parse(tekst); }
    catch (e) { return { fout: 'Dit is geen geldige JSON.' }; }
    if (!obj || obj.soort !== 'luna-eigen-duiding') return { fout: 'Dit bestand komt niet uit LUNA.' };
    (obj.documenten || []).forEach(function (d) {
      d.id = d.id || idNieuw();
      documenten.push(d);
    });
    var r = bewaren();
    return r.ok ? { ok: true, aantal: (obj.documenten || []).length } : r;
  }

  /* ---------- lichte, veilige Markdown-weergave ---------- */

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Alleen de opmaak die in dit soort documenten voorkomt: koppen, vet,
     cursief, citaten, horizontale lijnen, lijsten en tabellen. Alles wordt
     eerst ge-escaped; er kan dus nooit HTML uit de brontekst zelf komen. */
  function inline(tekst) {
    var t = escapeHtml(tekst);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Soms staat er per ongeluk **tekst* (dubbel openen, enkel sluiten).
    // Dat is een tikfout in de brontekst, geen reden om het kaal te tonen.
    t = t.replace(/\*\*([^*\n]+)\*(?!\*)/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    return t;
  }

  /* Alinea's en citaten mogen meerdere regels beslaan; **vet** dat toevallig
     over een regeleinde loopt (zeldzaam, maar het gebeurt) moet dan ook
     worden herkend. Daarom passen we inline() toe op het geheel en zetten
     pas daarna de overgebleven newlines om in <br>. */
  function inlineBlok(regels) {
    return inline(regels.join('\n')).replace(/\n/g, '<br>');
  }

  function renderTabel(regels) {
    var rijen = regels.map(function (r) {
      return r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); });
    });
    var kop = rijen[0];
    var lijf = rijen.slice(1).filter(function (r) { return !/^:?-+:?$/.test(r.join('').replace(/\s/g, '')); });
    var scheider = /^:?-+:?$/.test(rijen[1].join('').replace(/[\s|]/g, '')) ? 1 : 0;
    lijf = rijen.slice(1 + scheider);
    var o = '<div class="duiding-tabel-wrap"><table><thead><tr>' +
      kop.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    lijf.forEach(function (r) {
      o += '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>';
    });
    return o + '</tbody></table></div>';
  }

  function render(tekst) {
    var regels = String(tekst || '').replace(/\r\n/g, '\n').split('\n');
    var out = [], i = 0, n = regels.length;

    function leeg(r) { return !r.trim(); }

    while (i < n) {
      var regel = regels[i];

      if (leeg(regel)) { i++; continue; }

      var kop = regel.match(/^(#{1,4})\s+(.*)/);
      if (kop) {
        var niveau = Math.min(kop[1].length, 4);
        out.push('<h' + niveau + '>' + inline(kop[2]) + '</h' + niveau + '>');
        i++; continue;
      }

      if (/^-{3,}\s*$/.test(regel)) { out.push('<hr>'); i++; continue; }

      if (regel.trim().charAt(0) === '|') {
        var tabelregels = [];
        while (i < n && regels[i].trim().charAt(0) === '|') { tabelregels.push(regels[i]); i++; }
        if (tabelregels.length >= 2) out.push(renderTabel(tabelregels));
        continue;
      }

      if (/^>\s?/.test(regel)) {
        var citaat = [];
        while (i < n && /^>\s?/.test(regels[i])) { citaat.push(regels[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote>' + inlineBlok(citaat) + '</blockquote>');
        continue;
      }

      var genummerd = regel.match(/^(\d+)\.\s+/);
      if (/^[-*]\s+/.test(regel) || genummerd) {
        var geordend = !!genummerd;
        var startnr = genummerd ? parseInt(genummerd[1], 10) : 1;
        var items = [];
        while (i < n && (/^[-*]\s+/.test(regels[i]) || /^\d+\.\s+/.test(regels[i]))) {
          items.push(regels[i].replace(/^([-*]|\d+\.)\s+/, ''));
          i++;
        }
        var tag = geordend ? 'ol' : 'ul';
        var start = geordend && startnr !== 1 ? ' start="' + startnr + '"' : '';
        out.push('<' + tag + start + '>' + items.map(function (it) { return '<li>' + inline(it) + '</li>'; }).join('') + '</' + tag + '>');
        continue;
      }

      // Gewone alinea: regels tot de volgende lege regel of nieuw blokelement.
      var alinea = [];
      while (i < n && !leeg(regels[i]) && !/^(#{1,4})\s|^-{3,}\s*$|^\||^>|^[-*]\s+|^\d+\.\s+/.test(regels[i])) {
        alinea.push(regels[i]); i++;
      }
      out.push('<p>' + inlineBlok(alinea) + '</p>');
    }

    return out.join('\n');
  }

  /* Voor een korte preview in een lijst: platte tekst, geen opmaaktekens. */
  function samenvatting(tekst, maxLengte) {
    var s = String(tekst || '')
      .replace(/^#+\s*/gm, '').replace(/[*_`>#|-]/g, ' ')
      .replace(/\s+/g, ' ').trim();
    var lim = maxLengte || 160;
    return s.length > lim ? s.slice(0, lim).trim() + '…' : s;
  }

  function leestijd(tekst) {
    var woorden = String(tekst || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(woorden / 200));
  }

  global.LunaEigenDuiding = {
    lijst: lijst, voorPersoon: voorPersoon, geef: geef,
    toevoegen: toevoegen, bewerken: bewerken, verwijder: verwijder,
    exporteer: exporteer, importeer: importeer,
    render: render, samenvatting: samenvatting, leestijd: leestijd
  };
})(typeof window !== 'undefined' ? window : globalThis);
