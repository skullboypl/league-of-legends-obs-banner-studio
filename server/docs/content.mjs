// Treść dokumentacji. Jedno źródło prawdy dla HTML (SSR), Markdown (.md, llms-full.txt),
// danych strukturalnych JSON-LD (TechArticle, HowTo, FAQPage) i mapy strony.
//
// Bloki: { p } { ul: [] } { ol: [] } { h3 } { code, lang } { note } { table: { head: [], rows: [[]] } }
// Tekst obsługuje: `kod`, **pogrubienie**, [tekst](/ścieżka).

export const SITE_NAME = 'LoL Banner Studio';
export const UPDATED = '2026-10-05';

export const groups = [
  { id: 'start', title: 'Pierwsze kroki' },
  { id: 'config', title: 'Konfiguracja' },
  { id: 'help', title: 'Pomoc' },
];

export const platforms = [
  ['euw1', 'EU West', 'europe'],
  ['eun1', 'EU Nordic & East', 'europe'],
  ['tr1', 'Türkiye', 'europe'],
  ['ru', 'Russia', 'europe'],
  ['na1', 'North America', 'americas'],
  ['br1', 'Brazil', 'americas'],
  ['la1', 'LAN', 'americas'],
  ['la2', 'LAS', 'americas'],
  ['kr', 'Korea', 'asia'],
  ['jp1', 'Japan', 'asia'],
  ['oc1', 'Oceania', 'sea'],
  ['ph2', 'Philippines', 'sea'],
  ['sg2', 'Singapore', 'sea'],
  ['th2', 'Thailand', 'sea'],
  ['tw2', 'Taiwan', 'sea'],
  ['vn2', 'Vietnam', 'sea'],
];

export const layouts = [
  ['crest', 'Prime', 'Pełny profil ranked', 820, 180],
  ['lane', 'Broadcast', 'Pasek transmisyjny', 980, 130],
  ['compact', 'Compact', 'Obok kamerki', 620, 140],
  ['card', 'Showcase', 'Karta gracza', 360, 340],
  ['split', 'Split', 'Dwie strony rankingu', 760, 200],
  ['minimal', 'Minimal', 'Czysta typografia', 640, 120],
  ['tower', 'Tower', 'Układ pionowy', 290, 420],
  ['scoreboard', 'Scoreboard', 'Wyniki na pierwszym planie', 820, 210],
];

const sizeRows = layouts.map(([id, name, note, w, h]) => [`**${name}**`, `\`${id}\``, note, `${w} × ${h}`]);
const serverRows = platforms.map(([id, name, region]) => [`\`${id}\``, name, region]);

export const pages = [
  {
    slug: 'szybki-start',
    group: 'start',
    title: 'Szybki start – baner rankingu LoL w OBS w 5 minut',
    h1: 'Szybki start',
    description:
      'Jak w 5 minut wygenerować baner rankingu League of Legends i dodać go do OBS lub Streamlabs. Wpisz Riot ID, wybierz styl, skopiuj link.',
    summary:
      'Wpisz Riot ID i serwer w Studio, wybierz układ banera, kliknij „Generuj link OBS” i wklej adres jako źródło „Przeglądarka” w OBS Studio lub Streamlabs. Baner aktualizuje się sam co 2 minuty.',
    sections: [
      {
        id: 'czym-jest',
        title: 'Czym jest LoL Banner Studio?',
        blocks: [
          {
            p: '**LoL Banner Studio** to darmowy generator banerów rankingu League of Legends dla streamerów. Pobiera dane z oficjalnego Riot API (ranga, LP, wygrane i porażki, win rate, poziom konta, ikona profilu) i udostępnia je jako przezroczysty widżet, który dodajesz do OBS Studio lub Streamlabs jako źródło przeglądarki.',
          },
          {
            p: 'Nie instalujesz żadnych programów ani wtyczek, a klucz Riot API nigdy nie trafia do przeglądarki ani do linku widżetu.',
          },
        ],
      },
      {
        id: 'kroki',
        title: 'Pięć kroków do banera na streamie',
        blocks: [
          {
            ol: [
              'Otwórz [Studio](/) i w zakładce **Podstawowe** wpisz Riot ID w formacie `Nazwa#TAG`.',
              'Wybierz serwer (np. EU West) i kolejkę: Ranked Solo / Duo albo Ranked Flex, a potem kliknij **Pobierz dane gracza**.',
              'W zakładce **Wygląd** wybierz jeden z 8 układów, kolory, krój pisma i efekty. Podgląd na żywo pokazuje efekt od razu.',
              'W zakładce **Statystyki** włącz lub wyłącz poszczególne elementy: LP, win rate, bilans, liczbę meczów, pasek LP.',
              'Kliknij **Generuj link OBS**, skopiuj adres i wklej go w OBS jako źródło „Przeglądarka” z podanymi wymiarami. Szczegóły znajdziesz w [instrukcji dla OBS Studio](/docs/obs-studio).',
            ],
          },
          {
            note: 'Ustawienia zapisują się automatycznie w Twojej przeglądarce (localStorage). Jeśli zmienisz wygląd banera, **wygeneruj nowy link** – stary zachowuje dawne ustawienia.',
          },
        ],
      },
      {
        id: 'co-dalej',
        title: 'Co dalej?',
        blocks: [
          {
            ul: [
              '[Dodawanie banera do OBS Studio](/docs/obs-studio) – krok po kroku',
              '[Dodawanie banera do Streamlabs](/docs/streamlabs)',
              '[Układy banerów i ich wymiary](/docs/uklady-banerow)',
              '[Personalizacja](/docs/personalizacja) – kolory, fonty, widoczność elementów',
              '[Parametry linku widżetu](/docs/parametry-url) – ręczna edycja adresu',
            ],
          },
        ],
      },
    ],
    faq: [
      ['Czy LoL Banner Studio jest darmowy?', 'Tak. Projekt jest darmowy i otwarty (licencja MIT). Nie wymaga konta ani logowania Riot.'],
      ['Ile trwa dodanie banera do OBS?', 'Około 5 minut: wpisujesz Riot ID, wybierasz styl, kopiujesz link i wklejasz go jako źródło „Przeglądarka”.'],
    ],
    howto: {
      name: 'Jak dodać baner rankingu League of Legends do OBS',
      description: 'Wygeneruj link widżetu w LoL Banner Studio i dodaj go do OBS jako źródło przeglądarki.',
      totalTime: 'PT5M',
      steps: [
        ['Wpisz Riot ID', 'W Studio wpisz Riot ID w formacie Nazwa#TAG, wybierz serwer i kolejkę, a następnie pobierz dane gracza.'],
        ['Dopasuj wygląd', 'Wybierz układ, kolory i widoczne elementy. Podgląd na żywo pokazuje efekt.'],
        ['Wygeneruj link', 'Kliknij „Generuj link OBS” i skopiuj adres widżetu oraz wymiary źródła.'],
        ['Dodaj źródło w OBS', 'W OBS dodaj źródło „Przeglądarka”, wklej adres i ustaw podaną szerokość i wysokość.'],
      ],
    },
    related: ['obs-studio', 'uklady-banerow', 'faq'],
  },

  {
    slug: 'obs-studio',
    group: 'start',
    title: 'Jak dodać baner rankingu LoL do OBS Studio – instrukcja',
    h1: 'Instrukcja OBS Studio',
    description:
      'Dodaj baner rankingu League of Legends do OBS Studio jako źródło „Przeglądarka”: link, wymiary, przezroczystość, odświeżanie i najczęstsze problemy.',
    summary:
      'W OBS Studio kliknij „+” w panelu Źródła, wybierz „Przeglądarka”, wklej link widżetu z Banner Studio i wpisz szerokość oraz wysokość pokazane w oknie eksportu. Tło jest przezroczyste, a dane odświeżają się co 2 minuty.',
    sections: [
      {
        id: 'przygotowanie',
        title: 'Przygotowanie linku widżetu',
        blocks: [
          {
            p: 'Link widżetu ma postać `https://twoja-domena/widget?riotId=…&platform=…&style=…`. Zawiera wyłącznie ustawienia wyglądu i Riot ID – nigdy klucz API. Wygenerujesz go przyciskiem **Generuj link OBS** w [Studio](/).',
          },
          {
            note: 'Znak `#` w Riot ID jest w linku zapisany jako `%23`. Nie zmieniaj tego ręcznie – bez kodowania przeglądarka potraktuje resztę adresu jako fragment i nie wczyta gracza.',
          },
        ],
      },
      {
        id: 'dodawanie',
        title: 'Jak dodać źródło „Przeglądarka” w OBS Studio',
        blocks: [
          {
            ol: [
              'W OBS wybierz scenę, do której chcesz dodać baner.',
              'W panelu **Źródła** kliknij **+** i wybierz **Przeglądarka** (Browser).',
              'Nazwij źródło, np. „Ranga LoL”, i potwierdź.',
              'Wklej link widżetu w pole **URL**. Pole „Plik lokalny” zostaw odznaczone.',
              'Wpisz **Szerokość** i **Wysokość** dokładnie takie, jak w oknie „Generuj link OBS” (zależą od układu i skali).',
              'Kliknij **OK**, a potem przeciągnij baner w wybrane miejsce sceny.',
            ],
          },
          {
            p: 'Pole „Własny CSS” może zostać domyślne. Widżet ma przezroczyste tło, więc baner nakłada się na grę lub kamerę bez ramki.',
          },
        ],
      },
      {
        id: 'wymiary',
        title: 'Jakie wymiary ustawić?',
        blocks: [
          {
            p: 'Wymiary zależą od układu i skali. Dla skali 100% są to:',
          },
          { table: { head: ['Układ', 'Kod stylu', 'Opis', 'Wymiary (px)'], rows: sizeRows } },
          {
            p: 'Przy skali innej niż 100% pomnóż wymiary przez skalę (np. Prime przy 120% to 984 × 216). Okno eksportu liczy to za Ciebie. Szczegóły w [układach banerów](/docs/uklady-banerow).',
          },
        ],
      },
      {
        id: 'odswiezanie',
        title: 'Odświeżanie danych',
        blocks: [
          {
            p: 'Widżet pobiera nowe dane co **2 minuty**, a serwer dodatkowo buforuje odpowiedź Riot API przez około 90 sekund, aby nie przekraczać limitów. Po zakończonym meczu ranga i LP mogą pojawić się z krótkim opóźnieniem po stronie Riot.',
          },
          {
            p: 'Aby wymusić odświeżenie, w OBS kliknij źródło prawym przyciskiem → **Właściwości** → **Odśwież pamięć podręczną bieżącej strony**.',
          },
        ],
      },
      {
        id: 'problemy',
        title: 'Baner się nie wyświetla?',
        blocks: [
          {
            ul: [
              'Sprawdź komunikat w źródle: „Nie znaleziono gracza…” oznacza błędny Riot ID lub serwer.',
              'Upewnij się, że wklejony link jest kompletny i zaczyna się od `https://`.',
              'Zweryfikuj wymiary źródła – zbyt małe obetną baner.',
            ],
          },
          { p: 'Pełna lista przyczyn: [rozwiązywanie problemów](/docs/rozwiazywanie-problemow).' },
        ],
      },
    ],
    faq: [
      ['Jakie źródło wybrać w OBS dla banera rankingu?', 'Wybierz źródło „Przeglądarka” (Browser) i wklej w pole URL link widżetu wygenerowany w Banner Studio.'],
      ['Czy tło banera jest przezroczyste?', 'Tak. Widżet ma przezroczyste tło, więc nakłada się na scenę bez ramki. Krycie samego banera ustawiasz suwakiem „Krycie tła”.'],
      ['Jak często odświeża się ranga w OBS?', 'Co 2 minuty. Serwer dodatkowo buforuje dane Riot API przez ok. 90 sekund.'],
      ['Dlaczego Riot ID w linku ma %23?', '%23 to zakodowany znak #. Dzięki temu przeglądarka poprawnie odczytuje tag gracza.'],
    ],
    howto: {
      name: 'Jak dodać baner rankingu League of Legends do OBS Studio',
      description: 'Dodaj widżet rankingu LoL do OBS Studio jako źródło „Przeglądarka”.',
      totalTime: 'PT3M',
      steps: [
        ['Wybierz scenę', 'W OBS Studio zaznacz scenę, do której chcesz dodać baner.'],
        ['Dodaj źródło Przeglądarka', 'W panelu Źródła kliknij „+” i wybierz „Przeglądarka”, a następnie nazwij źródło.'],
        ['Wklej link', 'W polu URL wklej link widżetu z Banner Studio. Nie zaznaczaj „Plik lokalny”.'],
        ['Ustaw wymiary', 'Wpisz szerokość i wysokość z okna „Generuj link OBS”.'],
        ['Ustaw położenie', 'Zatwierdź źródło i przeciągnij baner w wybrane miejsce sceny.'],
      ],
    },
    related: ['streamlabs', 'parametry-url', 'rozwiazywanie-problemow'],
  },

  {
    slug: 'streamlabs',
    group: 'start',
    title: 'Baner rankingu LoL w Streamlabs Desktop – instrukcja',
    h1: 'Instrukcja Streamlabs',
    description:
      'Jak dodać baner rankingu League of Legends do Streamlabs Desktop jako źródło przeglądarki. Link, wymiary i ustawienia przezroczystości.',
    summary:
      'W Streamlabs Desktop dodaj źródło „Źródło przeglądarki” (Browser Source), wklej link widżetu z Banner Studio i ustaw szerokość oraz wysokość z okna eksportu. Działa tak samo jak w OBS Studio.',
    sections: [
      {
        id: 'kroki',
        title: 'Dodawanie banera w Streamlabs Desktop',
        blocks: [
          {
            ol: [
              'W [Studio](/) kliknij **Generuj link OBS** i skopiuj adres oraz wymiary.',
              'W Streamlabs Desktop otwórz edytor i w panelu **Źródła** kliknij **+**.',
              'Wybierz **Źródło przeglądarki** (Browser Source) i kliknij **Dodaj źródło**.',
              'Wklej link widżetu w polu **URL**.',
              'Wpisz szerokość i wysokość z okna eksportu i zapisz ustawienia.',
              'Przeciągnij baner w miejsce na scenie i, jeśli trzeba, zablokuj źródło kłódką.',
            ],
          },
          {
            note: 'Nie skaluj źródła uchwytami na scenie – zmień skalę w Studio i wygeneruj nowy link. Dzięki temu tekst pozostaje ostry.',
          },
        ],
      },
      {
        id: 'roznice',
        title: 'Różnice względem OBS Studio',
        blocks: [
          {
            p: 'Widżet to zwykła strona internetowa, więc działa identycznie w każdym programie ze źródłem przeglądarki: OBS Studio, Streamlabs Desktop, TikTok LIVE Studio, XSplit czy vMix. Różnią się tylko nazwy opcji w menu. Pozostałe zasady są wspólne: [instrukcja OBS Studio](/docs/obs-studio).',
          },
        ],
      },
    ],
    faq: [
      ['Czy baner działa w Streamlabs Desktop?', 'Tak. Dodaj „Źródło przeglądarki”, wklej link widżetu i wpisz wymiary z okna eksportu.'],
      ['Czy mogę użyć banera w innym programie do streamowania?', 'Tak, w każdym programie obsługującym źródło przeglądarki (Browser Source) lub nakładkę z adresu URL.'],
    ],
    howto: {
      name: 'Jak dodać baner rankingu League of Legends do Streamlabs Desktop',
      description: 'Dodaj widżet rankingu LoL do Streamlabs jako źródło przeglądarki.',
      totalTime: 'PT3M',
      steps: [
        ['Skopiuj link', 'W Banner Studio kliknij „Generuj link OBS” i skopiuj adres oraz wymiary.'],
        ['Dodaj źródło', 'W Streamlabs Desktop w panelu Źródła kliknij „+” i wybierz „Źródło przeglądarki”.'],
        ['Wklej link i wymiary', 'Wklej adres w polu URL i wpisz szerokość oraz wysokość.'],
        ['Ustaw położenie', 'Przeciągnij baner w miejsce na scenie.'],
      ],
    },
    related: ['obs-studio', 'szybki-start'],
  },

  {
    slug: 'uklady-banerow',
    group: 'config',
    title: 'Układy banerów LoL: 8 stylów i ich wymiary w OBS',
    h1: 'Układy banerów',
    description:
      'Porównanie 8 układów banera rankingu League of Legends: Prime, Broadcast, Compact, Showcase, Split, Minimal, Tower, Scoreboard – z wymiarami w pikselach.',
    summary:
      'Banner Studio ma 8 układów: Prime, Broadcast, Compact, Showcase, Split, Minimal, Tower i Scoreboard. Wymiary przy skali 100% wahają się od 290 × 420 px (Tower) do 980 × 130 px (Broadcast).',
    sections: [
      {
        id: 'lista',
        title: 'Wszystkie układy i wymiary',
        blocks: [
          { table: { head: ['Układ', 'Kod stylu', 'Zastosowanie', 'Wymiary przy 100% (px)'], rows: sizeRows } },
          { p: 'Kod stylu to wartość parametru `style` w [linku widżetu](/docs/parametry-url).' },
        ],
      },
      {
        id: 'wybor',
        title: 'Który układ wybrać?',
        blocks: [
          {
            ul: [
              '**Obok kamerki** – Compact lub Minimal, bo zajmują mało miejsca.',
              '**Dolny pasek transmisji** – Broadcast, najszerszy i najniższy.',
              '**Boczny panel** – Tower, układ pionowy 290 × 420.',
              '**Pełny profil** – Prime lub Scoreboard, gdy chcesz pokazać wszystkie statystyki.',
              '**Karta gracza** – Showcase, dobry do ekranu startowego lub przerwy.',
              '**Dwie kolejki obok siebie** – Split.',
            ],
          },
        ],
      },
      {
        id: 'skala',
        title: 'Skala banera',
        blocks: [
          {
            p: 'Skala (parametr `scale`) mieści się w zakresie **60–160%**. Wymiary źródła w OBS to wymiary bazowe pomnożone przez skalę, zaokrąglone do pełnych pikseli. Przykład: Prime przy 150% = 1230 × 270 px.',
          },
        ],
      },
    ],
    faq: [
      ['Ile układów banera ma LoL Banner Studio?', 'Osiem: Prime, Broadcast, Compact, Showcase, Split, Minimal, Tower i Scoreboard.'],
      ['Jaki układ najlepiej pasuje obok kamerki?', 'Compact (620 × 140) lub Minimal (640 × 120), bo zajmują najmniej miejsca.'],
      ['W jakim zakresie można skalować baner?', 'Od 60% do 160%. Wymiary źródła w OBS to wymiary bazowe pomnożone przez skalę.'],
    ],
    related: ['personalizacja', 'obs-studio'],
  },

  {
    slug: 'personalizacja',
    group: 'config',
    title: 'Personalizacja banera LoL: kolory, fonty i widoczne elementy',
    h1: 'Personalizacja',
    description:
      'Jak dopasować baner rankingu League of Legends: kolor akcentu, tło, krój pisma, krycie, zaokrąglenie, poświata, animacja oraz widoczność elementów.',
    summary:
      'Możesz zmienić kolor akcentu, tła i tekstu, krój pisma (Inter, Barlow Condensed, monospace), krycie 10–100%, zaokrąglenie 0–32 px, poświatę i animację oraz włączyć lub wyłączyć 10 elementów banera.',
    sections: [
      {
        id: 'wyglad',
        title: 'Kolory i wykończenie',
        blocks: [
          {
            table: {
              head: ['Ustawienie', 'Zakres', 'Parametr'],
              rows: [
                ['Kolor akcentu', 'dowolny kolor HEX', '`accent`'],
                ['Tło banera', 'dowolny kolor HEX', '`background`'],
                ['Kolor tekstu', 'dowolny kolor HEX', '`textColor`'],
                ['Krycie tła', '10–100%', '`opacity`'],
                ['Zaokrąglenie', '0–32 px', '`radius`'],
                ['Skala', '60–160%', '`scale`'],
                ['Poświata akcentu', 'włączona / wyłączona', '`glow`'],
                ['Animowana linia akcentu', 'włączona / wyłączona', '`animate`'],
              ],
            },
          },
          {
            p: 'Gotowe palety: Hextech `#c89b3c`, Riot `#eb3d4d`, Ocean `#38c9d5`, Emerald `#42cf9b`, Arcane `#a18afb` i Ice `#d3e4f5`.',
          },
        ],
      },
      {
        id: 'czcionki',
        title: 'Krój pisma',
        blocks: [
          {
            ul: [
              '**Inter** (`sans`) – nowoczesny, domyślny.',
              '**Barlow Condensed** (`condensed`) – wąski, w stylu esportowych transmisji.',
              '**Monospace** (`mono`) – techniczny.',
            ],
          },
        ],
      },
      {
        id: 'elementy',
        title: 'Widoczne elementy banera',
        blocks: [
          {
            table: {
              head: ['Element', 'Parametr', 'Domyślnie'],
              rows: [
                ['Ikona gracza', '`showIcon`', 'włączona'],
                ['Poziom konta', '`showLevel`', 'włączony'],
                ['Tag Riot ID', '`showTag`', 'włączony'],
                ['Serwer', '`showRegion`', 'włączony'],
                ['Ranga i emblemat', '`showRank`', 'włączona'],
                ['Punkty ligowe (LP)', '`showLP`', 'włączone'],
                ['Win rate', '`showWinrate`', 'włączony'],
                ['Wygrane i porażki', '`showRecord`', 'włączone'],
                ['Liczba meczów', '`showGames`', 'wyłączona'],
                ['Pasek LP (0–100)', '`showProgress`', 'włączony'],
              ],
            },
          },
          { note: 'Pasek LP jest ukryty dla rang Master, Grandmaster i Challenger, bo tam LP nie ma górnego limitu 100.' },
        ],
      },
      {
        id: 'zapis',
        title: 'Zapis, udostępnianie i import',
        blocks: [
          {
            p: 'Ustawienia zapisują się automatycznie w przeglądarce. Przycisk z ikoną łącza kopiuje link do Studio z gotową konfiguracją, a sekcja **Wczytaj ustawienia z linku** pozwala zaimportować ustawienia z linku Studio lub widżetu. **Przywróć domyślne ustawienia** czyści konfigurację.',
          },
        ],
      },
    ],
    faq: [
      ['Jakie czcionki są dostępne w banerze?', 'Trzy: Inter (nowoczesny), Barlow Condensed (esportowy) i monospace (techniczny).'],
      ['Czy mogę ukryć winrate lub LP?', 'Tak. W zakładce Statystyki każdy z 10 elementów banera ma osobny przełącznik.'],
      ['Czy mogę przenieść ustawienia na inny komputer?', 'Tak. Skopiuj link do ustawień Studio lub widżetu i wklej go w sekcji „Wczytaj ustawienia z linku”.'],
    ],
    related: ['uklady-banerow', 'parametry-url'],
  },

  {
    slug: 'parametry-url',
    group: 'config',
    title: 'Parametry linku widżetu LoL Banner Studio (URL)',
    h1: 'Parametry linku widżetu',
    description:
      'Pełna lista parametrów adresu /widget: riotId, platform, queue, style, kolory, skala i przełączniki elementów. Wartości, zakresy i wartości domyślne.',
    summary:
      'Adres widżetu to /widget z parametrami w zapytaniu, m.in. riotId, platform, queue, style, accent, scale. Wartości logiczne zapisuje się jako 1 lub 0, a niepoprawne wartości są zastępowane domyślnymi.',
    sections: [
      {
        id: 'przyklad',
        title: 'Przykładowy link',
        blocks: [
          {
            code: '/widget?riotId=Nazwa%23TAG&platform=euw1&queue=solo&style=crest&accent=%23c89b3c&scale=100',
            lang: 'text',
          },
          {
            p: 'Wartości z `#` (Riot ID i kolory) muszą być zakodowane jako `%23`. Studio robi to automatycznie.',
          },
        ],
      },
      {
        id: 'podstawowe',
        title: 'Parametry podstawowe',
        blocks: [
          {
            table: {
              head: ['Parametr', 'Wartości', 'Domyślnie'],
              rows: [
                ['`riotId`', 'Nazwa#TAG (maks. 100 znaków)', 'przykładowy gracz'],
                ['`platform`', 'kod serwera, np. `euw1` ([lista](/docs/serwery-i-riot-id))', '`eun1`'],
                ['`queue`', '`solo` lub `flex`', '`solo`'],
                ['`style`', '`crest`, `lane`, `compact`, `card`, `split`, `minimal`, `tower`, `scoreboard`', '`crest`'],
                ['`font`', '`sans`, `condensed`, `mono`', '`sans`'],
              ],
            },
          },
        ],
      },
      {
        id: 'wyglad',
        title: 'Parametry wyglądu',
        blocks: [
          {
            table: {
              head: ['Parametr', 'Wartości', 'Domyślnie'],
              rows: [
                ['`accent`', 'kolor `#rrggbb`', '`#c89b3c`'],
                ['`background`', 'kolor `#rrggbb`', '`#111318`'],
                ['`textColor`', 'kolor `#rrggbb`', '`#f5f5f7`'],
                ['`opacity`', '10–100', '96'],
                ['`radius`', '0–32', '12'],
                ['`scale`', '60–160', '100'],
                ['`glow`', '`1` / `0`', '1'],
                ['`animate`', '`1` / `0`', '0'],
              ],
            },
          },
        ],
      },
      {
        id: 'elementy',
        title: 'Przełączniki elementów',
        blocks: [
          {
            p: 'Każdy z poniższych parametrów przyjmuje `1` (pokaż) lub `0` (ukryj): `showIcon`, `showLevel`, `showTag`, `showRegion`, `showRank`, `showLP`, `showWinrate`, `showRecord`, `showGames`, `showProgress`. Opis elementów: [personalizacja](/docs/personalizacja).',
          },
          { p: 'Starsze parametry `icon`, `record` i `winrate` nadal działają i odpowiadają `showIcon`, `showRecord` i `showWinrate`.' },
        ],
      },
      {
        id: 'walidacja',
        title: 'Walidacja wartości',
        blocks: [
          {
            p: 'Nieznane lub niepoprawne wartości są ignorowane i zastępowane domyślnymi. Liczby spoza zakresu są przycinane do minimum lub maksimum. Dzięki temu błąd w ręcznie edytowanym linku nie psuje banera.',
          },
        ],
      },
    ],
    faq: [
      ['Jak ręcznie zmienić ustawienia w linku widżetu?', 'Edytuj parametry w adresie /widget, np. `style=lane` lub `scale=120`. Wartości logiczne zapisuj jako 1 lub 0.'],
      ['Co się stanie przy błędnej wartości parametru?', 'Zostanie zastąpiona wartością domyślną, a liczby spoza zakresu zostaną przycięte do minimum lub maksimum.'],
    ],
    related: ['personalizacja', 'uklady-banerow'],
  },

  {
    slug: 'serwery-i-riot-id',
    group: 'help',
    title: 'Serwery LoL i Riot ID – kody regionów dla banera',
    h1: 'Serwery i Riot ID',
    description:
      'Lista obsługiwanych serwerów League of Legends (euw1, eun1, na1, kr i inne) z regionami Riot API oraz zasady poprawnego wpisywania Riot ID.',
    summary:
      'Banner Studio obsługuje 16 serwerów LoL (m.in. euw1, eun1, na1, kr). Riot ID wpisujesz jako Nazwa#TAG, a serwer musi zgadzać się z regionem, na którym grasz.',
    sections: [
      {
        id: 'riot-id',
        title: 'Jak wpisać Riot ID?',
        blocks: [
          {
            p: 'Riot ID składa się z nazwy gracza i tagu oddzielonych znakiem `#`, np. `Nazwa#TAG`. Znajdziesz go w kliencie Riot obok nazwy konta. Wielkość liter nie ma znaczenia przy wyszukiwaniu.',
          },
          {
            p: 'Studio nie prosi o hasło Riot ani o logowanie. Ranking jest publiczną informacją udostępnianą przez Riot API.',
          },
        ],
      },
      {
        id: 'serwery',
        title: 'Obsługiwane serwery',
        blocks: [
          {
            table: { head: ['Kod serwera', 'Nazwa', 'Region Riot API'], rows: serverRows },
          },
          {
            p: 'Region Riot API służy do odnalezienia konta Riot ID, a kod serwera do pobrania profilu i rankingu. Jeśli wybierzesz zły serwer, zobaczysz komunikat „Nie znaleziono gracza”.',
          },
        ],
      },
      {
        id: 'kolejki',
        title: 'Kolejki rankingowe',
        blocks: [
          {
            ul: [
              '**Ranked Solo / Duo** (`solo`) – domyślna kolejka rankingowa.',
              '**Ranked Flex** (`flex`) – ranking drużynowy.',
            ],
          },
          {
            p: 'Jeśli gracz nie ma rangi w wybranej kolejce, baner pokazuje stan „UNRANKED”.',
          },
        ],
      },
    ],
    faq: [
      ['Jaki serwer wybrać dla Polski?', 'Polscy gracze zwykle grają na EU Nordic & East (`eun1`). Gracze z Europy Zachodniej korzystają z EU West (`euw1`).'],
      ['Gdzie znajdę swój Riot ID?', 'W kliencie Riot, obok nazwy konta, w formacie Nazwa#TAG.'],
      ['Ile serwerów obsługuje LoL Banner Studio?', 'Szesnaście, w tym euw1, eun1, na1, kr, br1, jp1, tr1, la1, la2, oc1, ru, ph2, sg2, th2, tw2 i vn2.'],
    ],
    related: ['rozwiazywanie-problemow', 'parametry-url'],
  },

  {
    slug: 'rozwiazywanie-problemow',
    group: 'help',
    title: 'Rozwiązywanie problemów z bannerem LoL w OBS',
    h1: 'Rozwiązywanie problemów',
    description:
      'Baner rankingu LoL się nie ładuje? Sprawdź komunikaty błędów (nie znaleziono gracza, limit zapytań, klucz Riot API) i ich rozwiązania.',
    summary:
      'Najczęstsze przyczyny to błędny Riot ID lub serwer (404), przekroczony limit zapytań (429) oraz wygasły klucz Riot API po stronie serwera (401/403). Każdy komunikat ma proste rozwiązanie.',
    sections: [
      {
        id: 'komunikaty',
        title: 'Komunikaty błędów i co z nimi zrobić',
        blocks: [
          {
            table: {
              head: ['Komunikat', 'Przyczyna', 'Rozwiązanie'],
              rows: [
                [
                  'Nie znaleziono gracza o takim Riot ID w wybranym regionie.',
                  'Literówka w Riot ID lub zły serwer.',
                  'Sprawdź nazwę, tag i [serwer](/docs/serwery-i-riot-id).',
                ],
                [
                  'Podaj poprawny Riot ID i obsługiwany region.',
                  'Brak tagu lub nieobsługiwany serwer.',
                  'Wpisz Riot ID w formacie Nazwa#TAG i wybierz serwer z listy.',
                ],
                [
                  'Za dużo zapytań. Spróbuj ponownie za minutę.',
                  'Limit 60 zapytań na minutę z jednego adresu IP.',
                  'Odczekaj minutę. Nie odświeżaj widżetu ręcznie w pętli.',
                ],
                [
                  'Limit Riot API został chwilowo wyczerpany.',
                  'Wiele osób odpytuje serwer jednocześnie.',
                  'Poczekaj kilka minut – widżet spróbuje ponownie sam.',
                ],
                [
                  'Klucz Riot API jest nieprawidłowy lub wygasł.',
                  'Problem po stronie konfiguracji serwera (wygasły klucz).',
                  'Jeśli hostujesz własną instancję, ustaw nowy `RIOT_API_KEY`.',
                ],
                [
                  'Serwer nie ma skonfigurowanego klucza RIOT_API_KEY.',
                  'Brak zmiennej środowiskowej na serwerze.',
                  'Dodaj `RIOT_API_KEY` w konfiguracji aplikacji i uruchom ją ponownie.',
                ],
              ],
            },
          },
        ],
      },
      {
        id: 'obs',
        title: 'Problemy po stronie OBS',
        blocks: [
          {
            ul: [
              '**Biały lub czarny prostokąt** – sprawdź, czy w polu URL jest pełny link, a „Plik lokalny” jest odznaczony.',
              '**Obcięty baner** – wymiary źródła są mniejsze niż w oknie eksportu.',
              '**Rozmyty tekst** – źródło zostało rozciągnięte myszą. Przywróć wymiary i użyj opcji skali w Studio.',
              '**Stare dane** – kliknij „Odśwież pamięć podręczną bieżącej strony” we właściwościach źródła.',
              '**Nie zmienia się wygląd** – po zmianach w Studio wygeneruj nowy link.',
            ],
          },
        ],
      },
      {
        id: 'ranga',
        title: 'Ranga się nie zgadza',
        blocks: [
          {
            p: 'Dane pochodzą z Riot API i są buforowane do ok. 90 sekund, a widżet odświeża się co 2 minuty. Po meczu może minąć chwila, zanim Riot zaktualizuje LP. Jeśli konto nie ma rangi w wybranej kolejce, zmień kolejkę w ustawieniach.',
          },
        ],
      },
    ],
    faq: [
      ['Dlaczego baner pokazuje „Nie znaleziono gracza”?', 'Najczęściej Riot ID zawiera literówkę lub wybrano zły serwer. Sprawdź nazwę, tag i region.'],
      ['Co oznacza komunikat o zbyt dużej liczbie zapytań?', 'Z jednego adresu IP można wysłać 60 zapytań na minutę. Odczekaj minutę i spróbuj ponownie.'],
      ['Dlaczego LP nie zmieniło się po meczu?', 'Dane są buforowane do ok. 90 sekund, widżet odświeża się co 2 minuty, a Riot może aktualizować LP z krótkim opóźnieniem.'],
    ],
    related: ['obs-studio', 'faq'],
  },

  {
    slug: 'prywatnosc-i-bezpieczenstwo',
    group: 'help',
    title: 'Prywatność, bezpieczeństwo i zgodność z Riot Games',
    h1: 'Prywatność i bezpieczeństwo',
    description:
      'Jak LoL Banner Studio chroni klucz Riot API, jakie dane przetwarza i dlaczego nie wymaga logowania. Informacja o niezależności od Riot Games.',
    summary:
      'Klucz Riot API pozostaje wyłącznie na serwerze i nie trafia do przeglądarki ani do linku widżetu. Studio nie wymaga konta ani hasła Riot, a ustawienia zapisuje lokalnie w Twojej przeglądarce.',
    sections: [
      {
        id: 'klucz',
        title: 'Ochrona klucza Riot API',
        blocks: [
          {
            p: 'Przeglądarka komunikuje się wyłącznie z publicznym punktem `/api/player` na serwerze Banner Studio. To serwer dołącza klucz Riot API do zapytań, a klucz jest zmienną środowiskową uruchomionej aplikacji. Link widżetu zawiera tylko ustawienia wyglądu i Riot ID.',
          },
        ],
      },
      {
        id: 'dane',
        title: 'Jakie dane są przetwarzane?',
        blocks: [
          {
            ul: [
              '**Riot ID, serwer i kolejka** – wysyłane do serwera, aby pobrać publiczny ranking z Riot API.',
              '**Odpowiedzi Riot API** – krótko buforowane w pamięci serwera (ok. 90 sekund), by nie przekraczać limitów.',
              '**Ustawienia banera** – zapisywane lokalnie w przeglądarce (`localStorage`) i w linku widżetu.',
            ],
          },
          {
            p: 'Projekt nie prosi o hasło Riot, nie automatyzuje rozgrywki, nie szacuje ukrytego MMR i nie wymaga konta użytkownika. Serwer ogranicza liczbę zapytań do 60 na minutę z jednego adresu IP.',
          },
        ],
      },
      {
        id: 'riot',
        title: 'Niezależność od Riot Games',
        blocks: [
          {
            note: 'LoL Banner Studio is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.',
          },
          { p: 'To niezależne narzędzie społeczności. Korzysta z oficjalnego Riot API zgodnie z jego zasadami.' },
        ],
      },
      {
        id: 'licencja',
        title: 'Licencja',
        blocks: [{ p: 'Projekt jest udostępniony na licencji MIT. Możesz uruchomić własną instancję na swoim serwerze, np. w CapRover, z własnym kluczem Riot API.' }],
      },
    ],
    faq: [
      ['Czy LoL Banner Studio widzi moje hasło do Riot?', 'Nie. Narzędzie nigdy nie prosi o hasło ani logowanie. Korzysta wyłącznie z publicznych danych rankingowych Riot API.'],
      ['Czy mój klucz Riot API jest widoczny w linku do OBS?', 'Nie. Klucz jest przechowywany na serwerze, a link zawiera tylko Riot ID i ustawienia wyglądu.'],
      ['Czy Riot Games popiera to narzędzie?', 'Nie. To niezależny projekt społeczności, niezwiązany z Riot Games i przez nich niepopierany.'],
    ],
    related: ['faq', 'serwery-i-riot-id'],
  },

  {
    slug: 'faq',
    group: 'help',
    title: 'FAQ – najczęstsze pytania o LoL Banner Studio',
    h1: 'Najczęstsze pytania (FAQ)',
    description:
      'Odpowiedzi na najczęstsze pytania o LoL Banner Studio: cena, OBS, Streamlabs, odświeżanie rangi, serwery, bezpieczeństwo i własna instancja.',
    summary:
      'LoL Banner Studio jest darmowym generatorem banerów rankingu LoL dla OBS i Streamlabs. Poniżej znajdziesz zwięzłe odpowiedzi na najczęstsze pytania.',
    sections: [],
    faq: [
      ['Czym jest LoL Banner Studio?', 'To darmowy generator banerów rankingu League of Legends dla OBS Studio i Streamlabs. Pobiera dane z Riot API i udostępnia je jako przezroczysty widżet przeglądarki.'],
      ['Czy trzeba płacić albo się logować?', 'Nie. Narzędzie jest darmowe, otwarte (MIT) i nie wymaga konta ani logowania Riot.'],
      ['Jak dodać baner do OBS?', 'Wygeneruj link w Studio, w OBS dodaj źródło „Przeglądarka”, wklej adres i ustaw wymiary z okna eksportu. Zobacz [instrukcję OBS Studio](/docs/obs-studio).'],
      ['Czy działa ze Streamlabs?', 'Tak, jako „Źródło przeglądarki”. Zobacz [instrukcję Streamlabs](/docs/streamlabs).'],
      ['Jak często odświeża się ranga?', 'Widżet odświeża dane co 2 minuty, a serwer buforuje odpowiedzi Riot API przez ok. 90 sekund.'],
      ['Jakie dane pokazuje baner?', 'Rangę i emblemat, LP, win rate, wygrane i porażki, liczbę meczów, pasek LP, poziom konta, ikonę profilu, tag i serwer.'],
      ['Ile jest układów banera?', 'Osiem. Zobacz [układy banerów](/docs/uklady-banerow).'],
      ['Które serwery są obsługiwane?', 'Szesnaście serwerów LoL, m.in. euw1, eun1, na1, kr. Pełna lista: [serwery i Riot ID](/docs/serwery-i-riot-id).'],
      ['Czy mój klucz Riot API jest bezpieczny?', 'Tak. Klucz jest tylko na serwerze i nie trafia do przeglądarki ani do linku. Zobacz [prywatność i bezpieczeństwo](/docs/prywatnosc-i-bezpieczenstwo).'],
      ['Mogę uruchomić własną instancję?', 'Tak. Projekt ma gotową konfigurację do CapRover (Dockerfile, Nginx, serwer Node). Potrzebujesz własnego klucza Riot API.'],
      ['Baner nie działa – co robić?', 'Sprawdź komunikat błędu i skorzystaj z [rozwiązywania problemów](/docs/rozwiazywanie-problemow).'],
    ],
    related: ['szybki-start', 'rozwiazywanie-problemow'],
  },
];

export const pageBySlug = new Map(pages.map((p) => [p.slug, p]));
