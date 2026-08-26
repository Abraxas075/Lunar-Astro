/* LUNA - de maan per sterrenbeeld: je emotionele natuur, uitgewerkt. */
(function (global) {
  'use strict';
  var C = global.LunaContent;

  C.MAAN_IN_TEKEN = [
    { citaat: 'Je voelt eerst, en pas daarna vraag je je af of het klopte.',
      tekst: 'Jouw gevoel komt snel en ongefilterd. Boosheid is er meteen en meestal ook meteen weer weg; wachten met reageren voelt als tegen de stroom in zwemmen. Je hebt beweging nodig om iets te verwerken: lopen, sporten, hardop zeggen wat er is.',
      sterk: [
        { titel: 'Directe eerlijkheid', tekst: 'Bij jou weet iedereen waar hij aan toe is, ook als dat ongemakkelijk uitpakt.' },
        { titel: 'Snel herstel', tekst: 'Je blijft niet mokken. Uitgepraat is bij jou echt uitgepraat.' },
        { titel: 'Moed onder druk', tekst: 'Als het spannend wordt, word jij juist wakker in plaats van bevroren.' }],
      behoeften: [
        { icoon: 'bolt', tekst: 'Lichamelijke ontlading, elke dag iets' },
        { icoon: 'compass', tekst: 'Iets om voor te vechten' },
        { icoon: 'clock', tekst: 'Een tel tussen prikkel en reactie' }],
      uitdagingen: [
        { titel: 'Kort lontje', tekst: 'Je zegt in drie seconden iets waar je drie dagen aan hangt.' },
        { titel: 'Ongeduld met gevoel', tekst: 'Verdriet dat langzaam gaat, wil je overslaan; het wacht dan gewoon op je.' }],
      relaties: 'Je hebt iemand nodig die tegen je directheid kan en zelf ook zegt wat er is. Je wordt onrustig van te veel voorzichtigheid om je heen; een goede ruzie is voor jou vaak een vorm van nabijheid.',
      slot: 'Reageren is jouw talent. Even wachten is jouw oefening.' },

    { citaat: 'Je hebt tijd nodig, en dan is het ook echt goed.',
      tekst: 'Je gemoed beweegt langzaam en dat is een kracht. Je hebt houvast nodig: vaste plekken, bekende mensen, iets lekkers, een ritme dat niet elke week verandert. Als je van slag bent, helpt niet praten maar aanraken, eten, buiten zijn.',
      sterk: [
        { titel: 'Emotionele bodem', tekst: 'Anderen komen bij jou tot rust omdat jij niet meebeweegt met elke golf.' },
        { titel: 'Zintuiglijke troost', tekst: 'Je weet als geen ander hoe je jezelf en anderen werkelijk verzorgt.' },
        { titel: 'Trouw', tekst: 'Wat en wie je eenmaal in je leven toelaat, laat je niet zomaar los.' }],
      behoeften: [
        { icoon: 'home', tekst: 'Een vaste, rustige plek' },
        { icoon: 'palette', tekst: 'Lekker eten, muziek, iets moois vasthouden' },
        { icoon: 'clock', tekst: 'Ruim de tijd om te wennen' }],
      uitdagingen: [
        { titel: 'Verandering als bedreiging', tekst: 'Ook goed nieuws kan je van slag brengen als het je ritme breekt.' },
        { titel: 'Traag ontladen', tekst: 'Je slikt lang in, en dan komt het in een keer naar buiten.' }],
      relaties: 'Je hecht diep en langzaam. Je vraagt weinig woorden en veel aanwezigheid: er zijn, blijven, samen niets doen. Onvoorspelbaarheid bij een ander maakt je stiller dan je zelf doorhebt.',
      slot: 'Zekerheid is jouw fundament. Beweging is jouw oefening.' },

    { citaat: 'Je praat je gevoel helder, of je praat eromheen.',
      tekst: 'Je verwerkt emoties met taal. Zolang je erover kunt vertellen, blijft het draagbaar; wat je niet kunt verwoorden, blijft rondzoemen. Je stemming wisselt makkelijk en dat is geen onbetrouwbaarheid, dat is je systeem dat ventileert.',
      sterk: [
        { titel: 'Verwoorden', tekst: 'Je kunt precies benoemen wat er speelt, ook midden in de chaos.' },
        { titel: 'Lichtheid', tekst: 'Je vindt humor op momenten dat iedereen die nodig heeft.' },
        { titel: 'Nieuwsgierig naar mensen', tekst: 'Je vraagt door en onthoudt wat mensen je vertellen.' }],
      behoeften: [
        { icoon: 'chat', tekst: 'Iemand om alles mee door te praten' },
        { icoon: 'book', tekst: 'Nieuwe informatie, afwisseling' },
        { icoon: 'wind', tekst: 'Ruimte om van gedachten te veranderen' }],
      uitdagingen: [
        { titel: 'Wegredeneren', tekst: 'Je legt een gevoel zo goed uit dat je het niet meer hoeft te voelen.' },
        { titel: 'Onrust', tekst: 'Stilte voelt snel leeg, dus vul je haar met geluid en plannen.' }],
      relaties: 'Je hebt een gesprekspartner nodig, geen publiek. Zwijgen in een relatie voelt voor jou bedreigender dan ruzie. Je bent trouw op je eigen manier: je komt altijd terug om het uit te praten.',
      slot: 'Benoemen is jouw talent. Voelen zonder woorden is jouw oefening.' },

    { citaat: 'Je onthoudt hoe alles aanvoelde, jaren later nog.',
      tekst: 'De maan staat hier thuis: je gevoelsleven is diep, golvend en sterk verbonden met geheugen en familie. Je stemming beweegt met de mensen om je heen en met het verleden dat je meedraagt. Zorgen voor anderen is jouw manier om zelf te landen.',
      sterk: [
        { titel: 'Feilloos aanvoelen', tekst: 'Je weet wat iemand nodig heeft voordat hij het zelf weet.' },
        { titel: 'Thuis maken', tekst: 'Waar jij bent, wordt het binnen een uur zachter.' },
        { titel: 'Lang geheugen', tekst: 'Je vergeet geen zorg die je kreeg en geen belofte die je deed.' }],
      behoeften: [
        { icoon: 'home', tekst: 'Een plek die echt van jou is' },
        { icoon: 'heart', tekst: 'Mensen om voor te zorgen, en zorg terug' },
        { icoon: 'moon', tekst: 'Terugtrekken zonder uitleg' }],
      uitdagingen: [
        { titel: 'Terugtrekken', tekst: 'Gekwetst verdwijn je in je schild in plaats van te zeggen wat er is.' },
        { titel: 'Oud zeer', tekst: 'Iets van tien jaar geleden kan vandaag nog even scherp binnenkomen.' }],
      relaties: 'Je zoekt veiligheid, niet spanning. Je geeft veel en verwacht stilzwijgend hetzelfde terug; als dat uitblijft, zeg je het niet maar voel je het des te harder. Uitspreken wat je nodig hebt is je grootste stap.',
      slot: 'Zorgen is jouw talent. Vragen is jouw oefening.' },

    { citaat: 'Je hebt warmte nodig, en wel de warmte die je ziet.',
      tekst: 'Je gevoelsleven is groot en genereus. Je geeft royaal, je viert graag, en je hebt reactie nodig om te weten dat het aankomt. Een koele reactie voelt sneller als afwijzing dan bedoeld is, en dat raakt je in je waardigheid, niet alleen in je gevoel.',
      sterk: [
        { titel: 'Aanstekelijke warmte', tekst: 'Je tilt de stemming van een hele kamer op zonder dat het moeite lijkt.' },
        { titel: 'Groothartig', tekst: 'Je gunt anderen ruimhartig het licht, zolang je zelf niet vergeten wordt.' },
        { titel: 'Trouw en beschermend', tekst: 'Wie bij jou hoort, verdedig je zonder aarzelen.' }],
      behoeften: [
        { icoon: 'star', tekst: 'Gezien en gewaardeerd worden' },
        { icoon: 'palette', tekst: 'Iets maken, spelen, plezier' },
        { icoon: 'heart', tekst: 'Hartelijkheid die je merkt' }],
      uitdagingen: [
        { titel: 'Trots', tekst: 'Kwetsbaarheid toegeven voelt als terrein verliezen.' },
        { titel: 'Erkenning nodig', tekst: 'Zonder reactie van buiten zakt je gevoel van eigenwaarde sneller dan zou moeten.' }],
      relaties: 'Je hebt iemand nodig die je hartelijk laat merken dat je ertoe doet. Je bent loyaal en beschermend, maar wel gevoelig voor toon: een droge opmerking kan dagen nawerken.',
      slot: 'Warmte geven is jouw talent. Warmte ontvangen zonder bewijs is jouw oefening.' },

    { citaat: 'Als je je zorgen maakt, ga je opruimen.',
      tekst: 'Je verwerkt gevoel praktisch: iets regelen, iets rechtzetten, ergens nuttig zijn. Onrust vertaalt zich bij jou snel naar het lichaam en naar lijstjes. Je bent scherp voor jezelf, vaak scherper dan je ooit voor een ander zou zijn.',
      sterk: [
        { titel: 'Praktische zorg', tekst: 'Je helpt met wat er werkelijk nodig is, niet met wat mooi staat.' },
        { titel: 'Opmerkzaam', tekst: 'Je ziet aan iemands houding al dat er iets speelt.' },
        { titel: 'Betrouwbaar', tekst: 'Wat je toezegt, gebeurt, ook als niemand het controleert.' }],
      behoeften: [
        { icoon: 'check', tekst: 'Orde om je heen, iets afgerond' },
        { icoon: 'leaf', tekst: 'Een lichaam dat verzorgd wordt' },
        { icoon: 'home', tekst: 'Nuttig zijn voor iemand' }],
      uitdagingen: [
        { titel: 'Zelfkritiek', tekst: 'Je meet jezelf langs een lat die je nooit bij een ander zou leggen.' },
        { titel: 'Piekeren', tekst: 'Je denkt een gevoel na tot het uit elkaar valt, zonder dat het weg is.' }],
      relaties: 'Je toont liefde door te doen: regelen, onthouden, verzorgen. Complimenten in woorden vertrouw je minder dan daden. Leren dat je ook zonder nut welkom bent, is bij jou het echte werk.',
      slot: 'Verzorgen is jouw talent. Zelf verzorgd worden is jouw oefening.' },

    { citaat: 'Je stemming leunt op de sfeer tussen mensen.',
      tekst: 'Wrijving in de kamer voel je meteen in je lijf. Je zoekt evenwicht: mooi om je heen, prettige toon, geen open conflict. Je vergelijkt je gevoel graag met dat van een ander om te toetsen of je het goed ziet.',
      sterk: [
        { titel: 'Verzachten', tekst: 'Je haalt de scherpte uit een gesprek zonder de inhoud weg te poetsen.' },
        { titel: 'Rechtvaardigheidsgevoel', tekst: 'Onrecht raakt je persoonlijk, ook als het jou niet betreft.' },
        { titel: 'Aangenaam gezelschap', tekst: 'Mensen ontspannen bij jou en weten vaak niet precies waardoor.' }],
      behoeften: [
        { icoon: 'users', tekst: 'Iemand om mee te overleggen' },
        { icoon: 'palette', tekst: 'Schoonheid, harmonie, een nette ruimte' },
        { icoon: 'scale', tekst: 'Het gevoel dat het eerlijk verdeeld is' }],
      uitdagingen: [
        { titel: 'Eigen voorkeur kwijt', tekst: 'Door alles van twee kanten te bekijken raak je zoek waar jij staat.' },
        { titel: 'Conflict mijden', tekst: 'Je stelt het moeilijke gesprek uit tot het scheef naar buiten komt.' }],
      relaties: 'Samen zijn is voor jou de natuurlijke toestand; alleen zijn voelt eerder als een gebrek dan als rust. Je grootste stap is een standpunt innemen terwijl je weet dat de ander het er niet mee eens is.',
      slot: 'Verbinden is jouw talent. Kiezen is jouw oefening.' },

    { citaat: 'Je voelt alles, en je laat er weinig van zien.',
      tekst: 'Jouw gevoel gaat diep en kent geen halve standen. Je vertrouwt niet snel, en als je eenmaal vertrouwt, is het onvoorwaardelijk. Je merkt onmiddellijk wanneer iemand niet eerlijk is, ook als je niet kunt aanwijzen waaraan.',
      sterk: [
        { titel: 'Emotionele moed', tekst: 'Je gaat mee naar plekken waar anderen niet durven te kijken.' },
        { titel: 'Onvoorwaardelijke loyaliteit', tekst: 'Wie jou heeft, heeft je helemaal.' },
        { titel: 'Onfeilbaar aanvoelen', tekst: 'Je ruikt een leugen voordat hij is uitgesproken.' }],
      behoeften: [
        { icoon: 'lock', tekst: 'Privacy, een binnenkamer die van jou is' },
        { icoon: 'heart', tekst: 'Een paar mensen die je volledig vertrouwt' },
        { icoon: 'waves', tekst: 'Intensiteit, ergens helemaal in kunnen' }],
      uitdagingen: [
        { titel: 'Controle', tekst: 'Grip houden voelt veiliger dan je overgeven, en houdt precies af wat je zoekt.' },
        { titel: 'Niet vergeten', tekst: 'Verraad blijft bij jou lang liggen, ook als je zegt dat het klaar is.' }],
      relaties: 'Je zoekt geen gezelschap maar verbondenheid. Oppervlakkigheid verveelt je binnen een kwartier. Je bent jaloers noch achterdochtig van aard, maar wel als je merkt dat iemand iets achterhoudt.',
      slot: 'Diepte is jouw talent. Loslaten is jouw oefening.' },

    { citaat: 'Je hebt ruimte nodig om je goed te voelen.',
      tekst: 'Je gemoed leeft op bij plannen, verte en betekenis. Zwaarte verdraag je slecht en je zoekt er automatisch de lichtheid in; humor is bij jou een overlevingsmechanisme en een gave tegelijk. Opgesloten zitten, letterlijk of in een relatie, maakt je somber.',
      sterk: [
        { titel: 'Optimisme dat aanstekelijk is', tekst: 'Je ziet een uitweg en overtuigt anderen dat die er is.' },
        { titel: 'Ruimhartig', tekst: 'Je neemt mensen zoals ze zijn en oordeelt zelden lang.' },
        { titel: 'Eerlijk', tekst: 'Je zegt wat je denkt, ook als het onhandig uitkomt.' }],
      behoeften: [
        { icoon: 'compass', tekst: 'Iets om naar uit te kijken' },
        { icoon: 'book', tekst: 'Zin, betekenis, leren' },
        { icoon: 'wind', tekst: 'Bewegingsvrijheid, buiten zijn' }],
      uitdagingen: [
        { titel: 'Wegkijken van pijn', tekst: 'Je zet iets zwaars te snel om in een grap of een volgend plan.' },
        { titel: 'Rusteloosheid', tekst: 'Het gras verderop is groen, ook als je hier gelukkig bent.' }],
      relaties: 'Je hebt iemand nodig die meegaat en je niet inperkt. Vrijheid is bij jou geen afstand maar de voorwaarde om te blijven. Beloven doe je snel; nakomen vraagt bewuste aandacht.',
      slot: 'Perspectief is jouw talent. Blijven zitten is jouw oefening.' },

    { citaat: 'Je regelt eerst en voelt daarna, als er tijd over is.',
      tekst: 'Je houdt gevoel op afstand tot je weet wat je ermee moet. Onder je nuchtere buitenkant zit een serieus binnenleven, dat je zelden ongevraagd deelt. Verantwoordelijkheid nemen geeft je rust; niets kunnen doen maakt je onrustig.',
      sterk: [
        { titel: 'Stabiel onder druk', tekst: 'In een crisis word jij juist rustiger en praktischer.' },
        { titel: 'Draagkracht', tekst: 'Je houdt lang vol, ook als het zwaar is en niemand het ziet.' },
        { titel: 'Betrouwbaar', tekst: 'Wat jij belooft, staat, ook jaren later.' }],
      behoeften: [
        { icoon: 'check', tekst: 'Iets waar je grip op hebt' },
        { icoon: 'clock', tekst: 'Tijd voordat je je openstelt' },
        { icoon: 'home', tekst: 'Mensen die er gewoon blijven' }],
      uitdagingen: [
        { titel: 'Alles alleen dragen', tekst: 'Hulp vragen voelt als falen, dus vraag je het pas als het echt niet meer gaat.' },
        { titel: 'Strengheid', tekst: 'Je gunt jezelf weinig; anderen merken dat aan hoe streng je ook naar hen kijkt.' }],
      relaties: 'Je toont liefde door er te zijn en dingen op te lossen, niet door grote woorden. Je hebt tijd nodig voordat je iemand binnenlaat, en daarna ben je er ook echt. Je leert het langzaamst dat kwetsbaarheid geen zwakte is.',
      slot: 'Dragen is jouw talent. Steunen op iemand is jouw oefening.' },

    { citaat: 'Je bekijkt je eigen gevoel graag van een afstandje.',
      tekst: 'Je hebt overzicht nodig om je veilig te voelen. Als het emotioneel druk wordt, stap je een meter naar achteren en ga je analyseren. Dat maakt je een uitstekende vriend in een crisis en een lastige partner in een ruzie.',
      sterk: [
        { titel: 'Rust in het oog van de storm', tekst: 'Jij houdt het hoofd koel wanneer anderen het kwijtraken.' },
        { titel: 'Oordeelt niet', tekst: 'Mensen kunnen je rare dingen vertellen zonder dat je terugdeinst.' },
        { titel: 'Trouw aan het principe', tekst: 'Je laat mensen niet vallen omdat het even ongemakkelijk is.' }],
      behoeften: [
        { icoon: 'users', tekst: 'Een kring van gelijkgestemden' },
        { icoon: 'wind', tekst: 'Ruimte, geen claim' },
        { icoon: 'book', tekst: 'Iets om te begrijpen' }],
      uitdagingen: [
        { titel: 'Koelte', tekst: 'Als het te dichtbij komt, ga je redeneren in plaats van voelen.' },
        { titel: 'Afstand als bescherming', tekst: 'Je noemt het onafhankelijkheid, maar soms is het gewoon niet durven.' }],
      relaties: 'Je hebt vrijheid nodig en geeft die ook. Claimen werkt bij jou averechts, ruimte krijgen maakt je juist trouw. Je grootste stap is aanwezig blijven op het moment dat je liever zou analyseren.',
      slot: 'Overzicht is jouw talent. Erin blijven is jouw oefening.' },

    { citaat: 'Je voelt alles, zelfs wat anderen proberen te verbergen.',
      tekst: 'De grens tussen jouw stemming en die van de kamer is dun. Je neemt op wat er hangt en merkt vaak pas later dat het niet van jou was. Je hebt regelmatig stilte nodig om te sorteren, anders raak je jezelf kwijt in andermans verhaal.',
      sterk: [
        { titel: 'Diepe empathie', tekst: 'Je voelt de emotionele golflengte van een kamer moeiteloos aan.' },
        { titel: 'Creatieve intuitie', tekst: 'Gevoel vertaalt zich bij jou vanzelf naar beeld, muziek of woorden.' },
        { titel: 'Grenzeloze mildheid', tekst: 'Je biedt een zachte landingsplek voor de pijn van anderen.' }],
      behoeften: [
        { icoon: 'moon', tekst: 'Tijd voor afzondering en stilte' },
        { icoon: 'palette', tekst: 'Een creatieve of spirituele uitlaatklep' },
        { icoon: 'waves', tekst: 'Water of natuur dichtbij' }],
      uitdagingen: [
        { titel: 'Emotionele spons', tekst: 'Je neemt stemmingen zo snel over dat je niet meer weet welke van jou zijn.' },
        { titel: 'Ontsnappingsdrang', tekst: 'Als de werkelijkheid hard wordt, neig je naar vluchten in dromen, media of illusies.' }],
      relaties: 'Je zoekt geen oppervlakkige connectie maar samensmelting. Je bent uiterst vergevingsgezind en ziet het hoogste in je partner, soms ten koste van wat er werkelijk gebeurt.',
      slot: 'Leer grenzen stellen uit liefde voor jezelf, niet als muur tegen anderen.' }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
