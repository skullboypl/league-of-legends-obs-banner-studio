import { groups, pages, pageBySlug, SITE_NAME, UPDATED } from './content.mjs';

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- tekst -> HTML / Markdown / zwykły tekst -------------------------------------------------

export function inlineHtml(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function plain(text) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*]/g, '');
}

function absolutize(text, site) {
  return text.replace(/\]\(\//g, `](${site}/`);
}

function blockHtml(block) {
  if (block.p) return `<p>${inlineHtml(block.p)}</p>`;
  if (block.h3) return `<h3>${inlineHtml(block.h3)}</h3>`;
  if (block.ul) return `<ul>${block.ul.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</ul>`;
  if (block.ol) return `<ol>${block.ol.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</ol>`;
  if (block.note) return `<aside class="note">${inlineHtml(block.note)}</aside>`;
  if (block.code) return `<pre><code>${escapeHtml(block.code)}</code></pre>`;
  if (block.table) {
    const { head, rows } = block.table;
    return (
      '<div class="table-wrap"><table><thead><tr>' +
      head.map((h) => `<th scope="col">${inlineHtml(h)}</th>`).join('') +
      '</tr></thead><tbody>' +
      rows.map((r) => `<tr>${r.map((c) => `<td>${inlineHtml(c)}</td>`).join('')}</tr>`).join('') +
      '</tbody></table></div>'
    );
  }
  return '';
}

function blockMarkdown(block) {
  if (block.p) return block.p;
  if (block.h3) return `### ${block.h3}`;
  if (block.ul) return block.ul.map((i) => `- ${i}`).join('\n');
  if (block.ol) return block.ol.map((i, n) => `${n + 1}. ${i}`).join('\n');
  if (block.note) return `> ${block.note}`;
  if (block.code) return '```' + (block.lang || '') + '\n' + block.code + '\n```';
  if (block.table) {
    const { head, rows } = block.table;
    return [
      `| ${head.join(' | ')} |`,
      `| ${head.map(() => '---').join(' | ')} |`,
      ...rows.map((r) => `| ${r.join(' | ')} |`),
    ].join('\n');
  }
  return '';
}

export function pageMarkdown(page, site) {
  const out = [`# ${page.h1}`, '', `> ${page.summary}`, ''];
  for (const section of page.sections) {
    out.push(`## ${section.title}`, '');
    for (const block of section.blocks) out.push(blockMarkdown(block), '');
  }
  if (page.faq?.length) {
    out.push('## Najczęstsze pytania', '');
    for (const [q, a] of page.faq) out.push(`### ${q}`, '', a, '');
  }
  out.push(`Źródło: ${site}/docs/${page.slug} · Zaktualizowano: ${UPDATED}`, '');
  return absolutize(out.join('\n'), site);
}

// --- dane strukturalne -----------------------------------------------------------------------

const publisher = (site) => ({
  '@type': 'Organization',
  '@id': `${site}/#organization`,
  name: SITE_NAME,
  url: `${site}/`,
});

const application = (site) => ({
  '@type': 'SoftwareApplication',
  '@id': `${site}/#app`,
  name: SITE_NAME,
  url: `${site}/`,
  applicationCategory: 'MultimediaApplication',
  applicationSubCategory: 'Stream overlay generator',
  operatingSystem: 'Web, OBS Studio, Streamlabs Desktop',
  inLanguage: 'pl',
  description:
    'Darmowy generator banerów rankingu League of Legends dla OBS Studio i Streamlabs z danymi z oficjalnego Riot API.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' },
  license: 'https://opensource.org/licenses/MIT',
});

function jsonLd(graph) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

function pageGraph(page, site) {
  const url = `${site}/docs/${page.slug}`;
  const graph = [
    publisher(site),
    application(site),
    {
      '@type': 'WebSite',
      '@id': `${site}/#website`,
      url: `${site}/`,
      name: SITE_NAME,
      inLanguage: 'pl',
      publisher: { '@id': `${site}/#organization` },
    },
    {
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: page.title,
      description: page.description,
      abstract: page.summary,
      inLanguage: 'pl',
      url,
      mainEntityOfPage: url,
      dateModified: UPDATED,
      datePublished: UPDATED,
      author: { '@id': `${site}/#organization` },
      publisher: { '@id': `${site}/#organization` },
      about: { '@id': `${site}/#app` },
      isPartOf: { '@id': `${site}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Dokumentacja', item: `${site}/docs` },
        { '@type': 'ListItem', position: 3, name: page.h1, item: url },
      ],
    },
  ];
  if (page.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: 'pl',
      mainEntity: page.faq.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: plain(a) },
      })),
    });
  }
  if (page.howto) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${url}#howto`,
      name: page.howto.name,
      description: page.howto.description,
      inLanguage: 'pl',
      totalTime: page.howto.totalTime,
      tool: [{ '@type': 'HowToTool', name: 'OBS Studio lub Streamlabs Desktop' }],
      step: page.howto.steps.map(([name, text], i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name,
        text,
      })),
    });
  }
  return graph;
}

// --- układ strony ----------------------------------------------------------------------------

const css = `
:root{color-scheme:dark;--bg:#0c0c0f;--panel:#111114;--line:#29292f;--text:#eeeeef;--muted:#9a9aa4;--red:#eb3d4d;--gold:#c89b3c}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.7 Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif}
a{color:#f0c46a;text-decoration:none}a:hover{text-decoration:underline}
a:focus-visible,summary:focus-visible{outline:2px solid var(--red);outline-offset:3px}
.skip{position:absolute;left:-999px}.skip:focus{left:12px;top:12px;background:#fff;color:#000;padding:8px 12px;z-index:9}
.layout{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:100vh}
.side{position:sticky;top:0;align-self:start;height:100vh;overflow:auto;background:var(--panel);border-right:1px solid var(--line);padding:28px 18px}
.brand{display:block;font-weight:800;font-size:22px;letter-spacing:-.8px;color:var(--text)}
.brand b{color:var(--red)}.brand small{display:block;font-size:10px;letter-spacing:2px;color:var(--muted);font-weight:500}
.back{display:inline-block;margin:18px 0 6px;font-size:13px;border:1px solid var(--line);border-radius:6px;padding:8px 12px;color:var(--text)}
.side h2{font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#6f6f7a;margin:24px 0 8px}
.side ul{list-style:none;margin:0;padding:0}
.side li a{display:block;padding:7px 10px;border-radius:6px;font-size:14px;color:#b1b1ba}
.side li a:hover{background:#1b1b21;color:#fff;text-decoration:none}
.side li a[aria-current=page]{background:#29191e;color:#fff;box-shadow:inset 3px 0 var(--red)}
main{padding:40px clamp(18px,5vw,64px) 56px;max-width:920px;width:100%}
.crumbs{font-size:13px;color:var(--muted);margin-bottom:18px}.crumbs a{color:var(--muted)}
h1{font-size:clamp(28px,4vw,40px);line-height:1.15;letter-spacing:-1px;margin:0 0 18px}
h2{font-size:24px;letter-spacing:-.5px;margin:44px 0 12px;scroll-margin-top:20px}
h3{font-size:17px;margin:22px 0 6px}
p,ul,ol{margin:0 0 14px}li{margin:4px 0}
.answer{border:1px solid #4b262e;background:#1a1114;border-radius:10px;padding:16px 18px;margin:0 0 26px}
.answer strong{display:block;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:var(--red);margin-bottom:4px}
.answer p{margin:0}
.toc{border:1px solid var(--line);border-radius:10px;padding:14px 18px;margin:0 0 8px}
.toc strong{font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:var(--muted)}
.toc ol{margin:8px 0 0;padding-left:20px}
code{background:#1c1c22;border:1px solid #2c2c34;border-radius:4px;padding:1px 6px;font:13px ui-monospace,SFMono-Regular,Menlo,monospace}
pre{background:#14141a;border:1px solid var(--line);border-radius:8px;padding:14px;overflow:auto}pre code{border:0;padding:0;background:none}
.note{border-left:3px solid var(--gold);background:#17140c;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 16px}
.table-wrap{overflow-x:auto;margin:0 0 16px;border:1px solid var(--line);border-radius:8px}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{background:#16161b;color:#c9c9d1;font-size:12px;letter-spacing:.6px;text-transform:uppercase}tr:last-child td{border-bottom:0}
.faq details{border:1px solid var(--line);border-radius:8px;margin:0 0 8px;padding:0 16px;background:#101014}
.faq summary{cursor:pointer;padding:13px 0;font-weight:600}
.faq details[open] summary{color:#fff}.faq details p{color:#c3c3cb}
.meta{font-size:13px;color:var(--muted);margin-top:36px;border-top:1px solid var(--line);padding-top:16px}
.cta{display:inline-block;background:var(--red);color:#fff;font-weight:700;border-radius:8px;padding:12px 20px;margin:6px 0}
.cta:hover{text-decoration:none;filter:brightness(1.1)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin:0 0 20px}
.card{display:block;border:1px solid var(--line);background:#101014;border-radius:10px;padding:16px;color:var(--text)}
.card:hover{border-color:#555560;text-decoration:none}.card b{display:block;margin-bottom:4px}.card span{font-size:14px;color:var(--muted)}
.related ul{padding-left:20px}
footer.site{border-top:1px solid var(--line);margin-top:48px;padding-top:18px;font-size:12px;color:#7a7a84;line-height:1.6}
@media(max-width:860px){.layout{display:block}.side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}.side ul{display:flex;flex-wrap:wrap;gap:4px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
`;

function sidebar(currentSlug) {
  const groupsHtml = groups
    .map((group) => {
      const items = pages
        .filter((p) => p.group === group.id)
        .map(
          (p) =>
            `<li><a href="/docs/${p.slug}"${p.slug === currentSlug ? ' aria-current="page"' : ''}>${escapeHtml(p.h1)}</a></li>`,
        )
        .join('');
      return `<h2>${escapeHtml(group.title)}</h2><ul>${items}</ul>`;
    })
    .join('');
  return `<aside class="side"><a class="brand" href="/docs">Banner<b>.</b>Docs<small>LOL BANNER STUDIO</small></a><a class="back" href="/">← Wróć do Studio</a><nav aria-label="Dokumentacja">${groupsHtml}</nav></aside>`;
}

const footer =
  '<footer class="site"><p>LoL Banner Studio is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p></footer>';

function head({ title, description, url, site, graph, noindex = false, ogType = 'article' }) {
  const robots = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#0c0c0f">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="pl" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<link rel="alternate" type="text/markdown" href="${url}.md">
<link rel="sitemap" type="application/xml" href="${site}/sitemap.xml">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="pl_PL">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
${graph ? `<script type="application/ld+json">${jsonLd(graph)}</script>` : ''}
<style>${css}</style>
</head>`;
}

function faqHtml(page) {
  if (!page.faq?.length) return '';
  return `<section class="faq" id="faq"><h2>Najczęstsze pytania</h2>${page.faq
    .map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${inlineHtml(a)}</p></details>`)
    .join('')}</section>`;
}

export function renderPage(page, site) {
  const url = `${site}/docs/${page.slug}`;
  const toc = [
    ...page.sections.map((s) => [s.id, s.title]),
    ...(page.faq?.length && page.sections.length ? [['faq', 'Najczęstsze pytania']] : []),
  ];
  const tocHtml =
    toc.length > 2
      ? `<nav class="toc" aria-label="Spis treści"><strong>Na tej stronie</strong><ol>${toc
          .map(([id, t]) => `<li><a href="#${id}">${escapeHtml(t)}</a></li>`)
          .join('')}</ol></nav>`
      : '';
  const body = page.sections
    .map((s) => `<section id="${s.id}"><h2>${escapeHtml(s.title)}</h2>${s.blocks.map(blockHtml).join('')}</section>`)
    .join('');
  const related = (page.related || [])
    .map((slug) => pageBySlug.get(slug))
    .filter(Boolean)
    .map((p) => `<li><a href="/docs/${p.slug}">${escapeHtml(p.h1)}</a></li>`)
    .join('');

  return `${head({ title: page.title, description: page.description, url, site, graph: pageGraph(page, site) })}
<body>
<a class="skip" href="#content">Przejdź do treści</a>
<div class="layout">
${sidebar(page.slug)}
<main id="content">
<nav class="crumbs" aria-label="Okruszki"><a href="/">${SITE_NAME}</a> › <a href="/docs">Dokumentacja</a> › <span>${escapeHtml(page.h1)}</span></nav>
<article>
<h1>${escapeHtml(page.h1)}</h1>
<div class="answer"><strong>Krótka odpowiedź</strong><p>${inlineHtml(page.summary)}</p></div>
${tocHtml}
${body}
${faqHtml(page)}
</article>
<p><a class="cta" href="/">Otwórz Banner Studio</a></p>
${related ? `<section class="related"><h2>Zobacz też</h2><ul>${related}</ul></section>` : ''}
<p class="meta">Zaktualizowano: <time datetime="${UPDATED}">${UPDATED}</time> · <a href="/docs/${page.slug}.md">Wersja Markdown</a></p>
${footer}
</main>
</div>
</body>
</html>`;
}

export function renderIndex(site) {
  const url = `${site}/docs`;
  const title = 'Dokumentacja LoL Banner Studio – baner rankingu LoL w OBS';
  const description =
    'Dokumentacja LoL Banner Studio: instrukcje dla OBS Studio i Streamlabs, układy banerów, personalizacja, parametry linku, serwery LoL, FAQ i rozwiązywanie problemów.';
  const graph = [
    publisher(site),
    application(site),
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      name: title,
      description,
      url,
      inLanguage: 'pl',
      isPartOf: { '@id': `${site}/#organization` },
      about: { '@id': `${site}/#app` },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: pages.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${site}/docs/${p.slug}`,
          name: p.h1,
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Dokumentacja', item: url },
      ],
    },
  ];
  const cardsByGroup = groups
    .map(
      (g) =>
        `<h2>${escapeHtml(g.title)}</h2><div class="cards">${pages
          .filter((p) => p.group === g.id)
          .map((p) => `<a class="card" href="/docs/${p.slug}"><b>${escapeHtml(p.h1)}</b><span>${escapeHtml(p.description)}</span></a>`)
          .join('')}</div>`,
    )
    .join('');
  return `${head({ title, description, url, site, graph, ogType: 'website' })}
<body>
<a class="skip" href="#content">Przejdź do treści</a>
<div class="layout">
${sidebar('')}
<main id="content">
<nav class="crumbs" aria-label="Okruszki"><a href="/">${SITE_NAME}</a> › <span>Dokumentacja</span></nav>
<h1>Dokumentacja LoL Banner Studio</h1>
<div class="answer"><strong>Krótka odpowiedź</strong><p><strong style="display:inline;font-size:inherit;letter-spacing:0;text-transform:none;color:inherit">LoL Banner Studio</strong> to darmowy generator banerów rankingu League of Legends dla OBS Studio i Streamlabs. Wpisz Riot ID, wybierz jeden z 8 układów i wklej wygenerowany link jako źródło „Przeglądarka”.</p></div>
${cardsByGroup}
<p><a class="cta" href="/">Otwórz Banner Studio</a></p>
<p class="meta">Zaktualizowano: <time datetime="${UPDATED}">${UPDATED}</time> · <a href="/llms.txt">llms.txt</a> · <a href="/sitemap.xml">Mapa strony</a></p>
${footer}
</main>
</div>
</body>
</html>`;
}

export function renderNotFound(site) {
  return `${head({ title: 'Nie znaleziono strony – dokumentacja', description: 'Taka strona dokumentacji nie istnieje.', url: `${site}/docs`, site, noindex: true, ogType: 'website' })}
<body>
<div class="layout">
${sidebar('')}
<main id="content">
<h1>Nie znaleziono strony</h1>
<p>Taka strona dokumentacji nie istnieje. Wybierz temat z menu albo wróć do <a href="/docs">spisu dokumentacji</a>.</p>
${footer}
</main>
</div>
</body>
</html>`;
}

// --- pliki dla robotów -----------------------------------------------------------------------

export function sitemapXml(site) {
  const urls = [
    [`${site}/`, '1.0'],
    [`${site}/docs`, '0.9'],
    ...pages.map((p) => [`${site}/docs/${p.slug}`, '0.8']),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(([loc, priority]) => `  <url><loc>${loc}</loc><lastmod>${UPDATED}</lastmod><priority>${priority}</priority></url>`)
  .join('\n')}
</urlset>
`;
}

const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export function robotsTxt(site) {
  const rules = ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /widget', ''];
  for (const bot of aiBots) rules.push(`User-agent: ${bot}`, 'Allow: /docs', 'Allow: /llms.txt', 'Disallow: /api/', 'Disallow: /widget', '');
  rules.push(`Sitemap: ${site}/sitemap.xml`, '');
  return rules.join('\n');
}

export function llmsTxt(site) {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    '> Darmowy generator banerów rankingu League of Legends dla OBS Studio i Streamlabs. Pobiera dane z oficjalnego Riot API (ranga, LP, win rate, bilans, poziom) i udostępnia przezroczysty widżet przeglądarki. Niezależny projekt społeczności, niepopierany przez Riot Games.',
    '',
    'Kluczowe fakty:',
    '',
    '- 8 układów banera: Prime, Broadcast, Compact, Showcase, Split, Minimal, Tower, Scoreboard.',
    '- Obsługa 16 serwerów LoL i kolejek Ranked Solo/Duo oraz Ranked Flex.',
    '- Widżet odświeża dane co 2 minuty; adres to /widget z parametrami w zapytaniu.',
    '- Klucz Riot API pozostaje na serwerze i nie trafia do przeglądarki ani do linku.',
    '- Licencja MIT; bez konta i bez logowania Riot.',
    '',
    '## Dokumentacja',
    '',
    ...pages.map((p) => `- [${p.h1}](${site}/docs/${p.slug}.md): ${p.summary}`),
    '',
    '## Pozostałe',
    '',
    `- [Studio (generator)](${site}/): aplikacja do tworzenia banera`,
    `- [Pełna dokumentacja w jednym pliku](${site}/llms-full.txt)`,
    `- [Mapa strony](${site}/sitemap.xml)`,
    '',
  ];
  return lines.join('\n');
}

export function llmsFullTxt(site) {
  return [
    `# ${SITE_NAME} – pełna dokumentacja`,
    '',
    `> Zaktualizowano: ${UPDATED}. Źródło: ${site}/docs`,
    '',
    ...pages.flatMap((p) => [pageMarkdown(p, site).replace(/^# /, '# '), '', '---', '']),
  ].join('\n');
}
