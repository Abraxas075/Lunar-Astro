/* LUNA - je eigen gegevens, vast in de repository.
 *
 * Wat je hier zet, blijft staan: het staat in git en werkt op elk apparaat
 * waarop je de app opent. Wat je via het scherm "Eigen gegevens" in de app
 * invoert, staat alleen in de browser waarin je het hebt ingevoerd.
 *
 * Alle lengtes zijn ecliptische lengtes in graden, van 0 tot 360, gemeten
 * vanaf 0° Ram. Datums en tijden zijn wereldtijd (UT), niet je eigen kloktijd.
 *
 * Je mag lengtes op drie manieren schrijven:
 *
 *     211.0575              graden als kommagetal
 *     "1°03'27\" Schorpioen"  graden, minuten, seconden met tekennaam
 *     "1 Sco 03"            de schrijfwijze van veel astrologieprogramma's
 *
 * ------------------------------------------------------------------
 * 1. HOROSCOPEN - de standen op één vast moment
 * ------------------------------------------------------------------
 * Gebruik dit als je je geboortehoroscoop ergens anders hebt laten berekenen
 * en die waarden wilt aanhouden. Het veld "voor" moet exact overeenkomen met
 * de naam die je in de app hebt ingevuld.
 *
 * Je hoeft niet alles op te geven: wat je weglaat, rekent de app zelf uit.
 * Geef je alleen "asc" op, dan krijg je een ascendant en huizen ook zonder
 * dat je geboortetijd bekend is.
 *
 * ------------------------------------------------------------------
 * 2. TABELLEN - standen over een reeks datums
 * ------------------------------------------------------------------
 * Hiermee vervang je de berekening voor de stand van vandaag, de transits en
 * de maanfase. Tussen twee rijen wordt geïnterpoleerd, dus dagelijkse rijen
 * zijn ruim voldoende; voor de maan geeft dat een nauwkeurigheid van ongeveer
 * een boogseconde.
 *
 * Buiten het bereik van je tabel rekent de app weer met haar eigen formules,
 * en ook lichamen die niet in de tabel staan worden gewoon berekend.
 *
 * Staan de datums niet in wereldtijd maar in je eigen kloktijd, zet dan een
 * veld "tz" op de tabel, bijvoorbeeld tz: 'Europe/Amsterdam'. Zomer- en
 * wintertijd worden dan vanzelf goed verrekend. Laat je "tz" weg, dan worden
 * de datums als wereldtijd gelezen. Een uur verschil is bij de maan al een
 * halve graad, dus het loont om dit te controleren.
 */

window.LunaEphemeride = {

  horoscopen: [
    // {
    //   voor: 'Sofia',
    //   bron: 'Astrodienst, Placidus',
    //   punten: {
    //     zon:       "1°03'27\" Schorpioen",
    //     maan:      "7°45' Steenbok",
    //     mercurius: "17°22' Schorpioen",
    //     venus:     "27°44' Weegschaal",
    //     mars:      "14°02' Tweelingen",
    //     jupiter:   "11°55' Kreeft",
    //     saturnus:  "2°18' Steenbok",
    //     uranus:    "6°21' Steenbok",
    //     neptunus:  "12°07' Steenbok",
    //     pluto:     "17°33' Schorpioen",
    //     knoop:     "29°38' Waterman",
    //     asc:       "6°23' Tweelingen",
    //     mc:        "1°46' Waterman"
    //   }
    // }
  ],

  tabellen: [
    // {
    //   bron: 'Swiss Ephemeris, dagelijks om middernacht',
    //   tz: 'Europe/Amsterdam',
    //   rijen: [
    //     { datum: '2026-08-25', w: { zon: 152.19, maan: 295.42, mars: 99.20 } },
    //     { datum: '2026-08-26', w: { zon: 153.17, maan: 308.31, mars: 99.84 } },
    //     { datum: '2026-08-27', w: { zon: 154.15, maan: 321.55, mars: 100.48 } }
    //   ]
    // }
  ]
};
