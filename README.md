# Luna-Astro

Persoonlijke astrologie.

Een astrologie-app die de standen van zon, maan en planeten zelf uitrekent, in
je browser, zonder server en zonder account. Geen app met vooraf ingetypte
teksten: elke graad, elk aspect en elk percentage volgt uit een berekening op
jouw geboortemoment.

---

## Openen

De app is puur HTML, CSS en JavaScript. Er valt niets te installeren en niets te
bouwen.

* **Online**: zet GitHub Pages aan (zie hieronder) en ga naar
  `https://abraxas075.github.io/Lunar-Astro/`
* **Lokaal**: open `index.html` in je browser. Of, netter, start een eenvoudige
  webserver in deze map en ga naar `http://localhost:8000`:

      python3 -m http.server 8000

Op je telefoon kun je hem via het browsermenu op je beginscherm zetten; dan
gedraagt hij zich als een app.

### GitHub Pages aanzetten

1. In deze repository: **Settings** → **Pages** (linkermenu).
2. *Source*: **Deploy from a branch**.
3. *Branch*: **main**, map **/ (root)** → **Save**.
4. Wacht een minuut of twee en ververs. Bovenaan staat je adres.

---

## Wat zit erin

| Scherm | Wat je ziet |
| ------ | ----------- |
| **Vandaag** | Groet, je zon/maan/ascendant, de energie van vandaag, focusgebieden, maanfase en de sterkste transits |
| **Dagelijks inzicht** | Het hoofdthema van de dag, uitgesplitst naar liefde, carrière en energie, plus de standen waar het op gebaseerd is |
| **Geboorte** | Je geboortehoroscoop als wiel, alle planeten met duiding, en je sterkste aspecten |
| **Punt-detail** | Per planeet een uitgewerkte pagina; de maan met sterke punten, kernbehoeften, uitdagingen en relaties |
| **Maanfase** | De actuele fase met een op schaal getekende maanschijf, wat er goed bij past, en de eerstvolgende volle en nieuwe maan |
| **Transities** | Wat de lopende planeten nu met je horoscoop doen, met orb, duur en of het aspect aanloopt of uitloopt |
| **Ontdekken** | Sterrenbeelden, planeten, huizen, aspecten, retrogrades en maanfasen, plus wat er nu aan de hemel gebeurt |
| **Match** | Synastrie: de aspecten tussen twee geboortehoroscopen, met scores voor emotionele klik, communicatie en aantrekking |
| **Profiel** | Je gegevens, opgeslagen inzichten, meldingsvoorkeuren en de mogelijkheid alles te wissen |

---

## Hoe de berekeningen werken

Alles staat in `astro.js` en is met de hand geïmplementeerd; er zijn geen
externe bibliotheken en geen API's.

| Onderdeel | Methode | Nauwkeurigheid |
| --------- | ------- | -------------- |
| Zon | Meeus, *Astronomical Algorithms* hfst. 25 | ~0,01° |
| Maan | Schlyter, baanelementen met twaalf storingstermen | ~2 boogminuten |
| Planeten t/m Pluto | Standish (JPL), keplerelementen met eeuwlijkse drift, geldig 1800-2050 | enkele boogminuten |
| Ascendant en midhemel | uit de sterrentijd en de breedtegraad van de geboorteplaats | |
| Huizen | hele-tekenhuizen | |

Voor astrologie gaat het om graden en tekens, niet om boogseconden; deze
nauwkeurigheid is daarvoor ruim voldoende.

Een paar details die makkelijk misgaan en hier wel goed staan:

* **Tijdzones.** Je kloktijd wordt via de IANA-tijdzonedatabase van je browser
  omgerekend naar wereldtijd, dus historische zomertijd klopt ook voor een
  geboorte in 1975.
* **Precessie.** Planeetposities worden van J2000 naar de ecliptica van de datum
  gerekend; zonder die correctie zit je in 2026 al ruim een derde graad naast.
* **Lichtlooptijd.** Voor de buitenplaneten wordt gecorrigeerd voor de tijd die
  het licht onderweg is.
* **Retrogradebeweging** wordt gemeten, niet opgezocht: de lengte een halve dag
  eerder en later bepaalt de richting.

Gecontroleerd tegen een onafhankelijke methode: de zon komt op enkele
boogseconden overeen, de ascendant maakt exact één rondgang per etmaal, en de
berekende volle maan valt op de werkelijke datum.

De duidingen staan los van de berekening, in `content.js`,
`content-zon-asc.js`, `content-maan.js` en `duiding.js`. Percentages zijn
deterministisch: ze tellen de aspecten die de lopende planeten met je horoscoop
maken, waarbij harmonische aspecten optellen en spanningsaspecten aftrekken,
gewogen naar de snelheid van de planeet. Dezelfde horoscoop geeft op dezelfde
dag altijd hetzelfde resultaat.

---

## Bestanden

| Bestand | Wat het doet |
| ------- | ------------ |
| `index.html` | De schil: iconen, koptekst, navigatie |
| `styles.css` | Het designsysteem als CSS-variabelen |
| `astro.js` | De astronomische kern |
| `plaatsen.js` | 167 geboorteplaatsen met coördinaten en tijdzone |
| `content.js` | Tekens, planeten, huizen, aspecten, maanfasen, retrogrades |
| `content-zon-asc.js` | Duidingen voor zon en ascendant per teken |
| `content-maan.js` | De maan per teken, uitgewerkt |
| `duiding.js` | Zet berekende standen om in tekst en scores |
| `app.js` | Schermen, navigatie, opslag, horoscoopwiel en maanschijf |

Staat je geboorteplaats niet in `plaatsen.js`? Je kunt in de app zelf
coördinaten en tijdzone invullen. Een plaats toevoegen kan ook: één regel in
`plaatsen.js`, met naam, landcode, breedtegraad, lengtegraad en IANA-tijdzone.

---

## Je gegevens

Alles staat in de `localStorage` van je browser onder de sleutel `luna.v1`. Er
is geen server, geen account en geen tracking. Wis je je browsergegevens, dan is
ook je horoscoop weg. Onder *Profiel* kun je alles in één keer wissen.

Omdat er geen server is, kan de app je telefoon niet uit zichzelf wakker maken.
De meldingsvoorkeuren bepalen daarom wat je op het meldingenscherm ziet zodra je
de app opent.

---

## Wat het wel en niet is

De posities zijn astronomie: die kun je nameten tegen elke ephemeride. De
duidingen zijn traditionele astrologie, een symbooltaal met een lange
geschiedenis. Het is geen wetenschap en geen voorspelling.
