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

### Nagemeten tegen Astrodienst

Een geboortehoroscoop van 14 januari 2003, 21:12 in Zaandam, naast dezelfde
horoscoop van Astrodienst:

| | afwijking | | afwijking |
| --- | --- | --- | --- |
| Zon | 1″ | Jupiter | 2″ |
| Maan | 2″ | **Saturnus** | **9,5′** |
| Mercurius | 18″ | Uranus | 17″ |
| Venus | 20″ | Neptunus | 14″ |
| Mars | 59″ | Pluto | 32″ |
| Maansknoop | 10″ | Ascendant | 8″ |
| Midhemel | 12″ | | |

Op Saturnus na blijft alles binnen een boogminuut, en zon, maan en ascendant
binnen een paar boogseconden.

**Saturnus is de uitzondering** en kan er tot ongeveer 10 boogminuten naast
zitten. Dat is een bekende grens van de gebruikte Keplerelementen: die vangen
de wisselwerking tussen Jupiter en Saturnus niet volledig. Voor een teken of
een aspect maakt een zesde graad niets uit, maar staat Saturnus in jouw
horoscoop vlak bij een tekengrens, lever dan je eigen waarde aan.

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

## Je eigen planeetstanden gebruiken

Wil je niet op de ingebouwde formules vertrouwen, dan kun je je eigen standen
aanleveren. Dat kan op twee manieren, die naast elkaar werken.

### Via de app

*Profiel → Eigen gegevens.* Plak daar je waarden, druk op **Inlezen en
controleren**, en je ziet jouw waarden naast wat LUNA zelf uitrekent, met het
verschil in boogminuten. Pas als het klopt, bewaar je ze. Handig om te
controleren of je gegevens goed gelezen worden — een groot verschil wijst
meestal op een andere tijdzone, een ander huizensysteem, of siderische in
plaats van tropische dierenriem.

Wat je zo invoert, staat alleen in die ene browser. Met **Opslaan als bestand**
en **Bestand inlezen** neem je het mee naar een ander apparaat.

### Via de repository

Zet het in `ephemeride.js`. Dat bestand staat in git, dus het werkt overal en
blijft bewaard. In het bestand staat uitleg met voorbeelden.

### Twee soorten gegevens

**Een horoscoop** zijn de standen op één moment, bijvoorbeeld je
geboortehoroscoop zoals een ander programma die berekend heeft. Die vervangen
de berekening voor die ene persoon. Het veld `voor` moet overeenkomen met de
naam die je in de app hebt ingevuld.

Je hoeft niet alles op te geven; wat je weglaat, rekent LUNA zelf uit. Geef je
alleen een ascendant op, dan krijg je een ascendant en huizen ook wanneer je
geboortetijd onbekend is.

**Een tabel** zijn standen over een reeks datums, en die vervangen de stand van
vandaag, de transits en de maanfase. Tussen twee rijen wordt geïnterpoleerd
(Lagrange over vier punten), dus dagelijkse rijen zijn ruim genoeg — voor de
maan blijft de fout dan onder de boogseconde. Buiten het bereik van je tabel
rekent LUNA weer met haar eigen formules, en lichamen die niet in je tabel
staan worden gewoon berekend.

### Schrijfwijzen die begrepen worden

Voor een horoscoop, één regel per lichaam:

    Zon 1°03'27" Schorpioen
    Maan 7 Cap 45
    Mercurius 17°22 Sco R
    AC 6°23' Tweelingen
    zon 211.0575

Namen mogen Nederlands of Engels zijn (`maan`/`moon`, `knoop`/`true node`,
`asc`/`ascendant`/`AC`), tekens voluit of als afkorting (`Schorpioen`, `Sco`,
`♏`). Een `R` of `Rx` markeert retrograde, ook als die tegen de seconden aan
staat geplakt. Regels die niet herkend worden, worden overgeslagen en genoemd.

De standentabel van Astrodienst kun je zo overnemen:

    Zon        ♑ 24° 14' 43"
    Maan       ♊ 11° 15' 41"
    Mercurius  ♑ 17° 18' 38"r
    M.knoop/gemid. ♊ 6° 17' 48"
    AC: ♍10° 18' 43"   2: ♎ 1° 20'   3: ♎28° 49'
    MC: ♊ 3° 42' 13"  11: ♋11° 47'  12: ♌14° 22'

### Huiscuspen

Geef je huiscuspen mee, dan gebruikt LUNA het huizensysteem van jouw bron in
plaats van hele-tekenhuizen. Meerdere cuspen op één regel mag. Zes is genoeg —
uit huis 1, 2, 3, 10, 11 en 12 leidt LUNA de andere zes af, want die liggen er
recht tegenover.

Voor een tabel, met een kopregel:

    datum,zon,maan,mars
    2026-08-25,152.19,295.42,99.20
    2026-08-26,153.17,308.31,99.84

Komma's, puntkomma's en tabs werken alle drie als scheidingsteken. Datums mogen
`2026-08-25` of `25-08-2026` zijn, eventueel met tijd erachter. De cellen mogen
kommagetallen zijn of dezelfde schrijfwijze als hierboven.

### Tijdzone van een tabel

Ephemeride-bestanden staan lang niet altijd in wereldtijd. Staan jouw datums op
middernacht in je eigen tijdzone, kies die zone dan in het keuzeveld boven de
knop *Inlezen en controleren*, of zet `tz: 'Europe/Amsterdam'` op de tabel in
`ephemeride.js`. Zomer- en wintertijd worden vanzelf goed verrekend.

Het loont om dit te controleren: een uur verschil is bij de maan al ongeveer
een halve graad. Na het inlezen toont de app daarom een controleregel — *"2026-08-25
in Europe/Amsterdam is 24 aug 2026 22:00 wereldtijd"* — zodat je in één oogopslag
ziet of de omrekening klopt.

**Let op:** alle lengtes zijn ecliptische lengtes in graden vanaf 0° Ram.

Waar met eigen gegevens gerekend wordt, staat dat in de app met een klein
merkteken boven het scherm.

---

## Je eigen duiding bewaren

Naast eigen standen kun je ook een volledig, kant-en-klaar geschreven
duidingsrapport bewaren bij een profiel of relatie — je eigen tekst, los van
de korte teksten die LUNA zelf uit de standen genereert.

*Profiel → Mijn duiding.* Kies voor wie het is, plak de tekst, en bewaar. Het
document verschijnt daarna als kaart onder de geboortehoroscoop van die
persoon (of onder de compatibiliteit, bij een relatie).

Een beetje opmaak wordt herkend: koppen (`#`, `##`, `###`), **vet**
(`**tekst**`), citaten (`> tekst`), horizontale lijnen (`---`), genummerde en
ongenummerde lijstjes, en tabellen in Markdown-stijl
(`| kolom | kolom |`). Verder is het gewoon platte tekst.

Deze documenten staan, net als je eigen standen, alleen in de opslag van deze
browser — ze gaan nergens anders naartoe en worden niet in de repository
gezet. Met **Opslaan als bestand** en **Bestand inlezen** neem je ze mee naar
een ander apparaat.

---

## Bestanden

| Bestand | Wat het doet |
| ------- | ------------ |
| `index.html` | De schil: iconen, koptekst, navigatie |
| `styles.css` | Het designsysteem als CSS-variabelen |
| `astro.js` | De astronomische kern |
| `plaatsen.js` | 167 geboorteplaatsen met coördinaten en tijdzone |
| `ephemeride.js` | Je eigen planeetstanden, vast in de repository |
| `eigen-data.js` | Leest eigen gegevens in, vergelijkt en interpoleert |
| `mijn-duiding.js` | Bewaart en toont je eigen duidingsrapporten |
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
