import { pageBySlug } from './content.mjs';
import {
  llmsFullTxt,
  llmsTxt,
  pageMarkdown,
  renderIndex,
  renderNotFound,
  renderPage,
  robotsTxt,
  sitemapXml,
} from './render.mjs';

// Kanoniczny adres witryny: SITE_URL, a bez niego host z żądania (tylko poprawne nazwy hostów).
function siteUrl(request) {
  const configured = String(process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (/^https?:\/\/[^\s/]+$/i.test(configured)) return configured;
  const host = String(request.get('host') || '');
  const proto = request.get('x-forwarded-proto')?.split(',')[0].trim() === 'http' ? 'http' : 'https';
  const safeHost = /^[a-z0-9.-]+(:\d{1,5})?$/i.test(host) ? host : 'localhost';
  const scheme = /^(localhost|127\.|\[)/.test(safeHost) ? 'http' : proto;
  return `${scheme}://${safeHost}`;
}

const cache = 'public, max-age=300, stale-while-revalidate=86400';

function send(response, type, body, extra = {}) {
  response.set({ 'Cache-Control': cache, 'X-Content-Type-Options': 'nosniff', ...extra });
  return response.type(type).send(body);
}

export function registerDocs(app) {
  app.get('/docs', (request, response) => send(response, 'html', renderIndex(siteUrl(request))));

  app.get('/docs/:page', (request, response) => {
    const site = siteUrl(request);
    const raw = request.params.page;
    const markdown = raw.endsWith('.md');
    const page = pageBySlug.get(markdown ? raw.slice(0, -3) : raw);
    if (!page) {
      return response
        .status(404)
        .set({ 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' })
        .type('html')
        .send(renderNotFound(site));
    }
    if (markdown) return send(response, 'text/markdown; charset=utf-8', pageMarkdown(page, site));
    return send(response, 'html', renderPage(page, site));
  });

  app.get('/sitemap.xml', (request, response) => send(response, 'application/xml', sitemapXml(siteUrl(request))));
  app.get('/robots.txt', (request, response) => send(response, 'text/plain', robotsTxt(siteUrl(request))));
  app.get('/llms.txt', (request, response) => send(response, 'text/plain; charset=utf-8', llmsTxt(siteUrl(request))));
  app.get('/llms-full.txt', (request, response) =>
    send(response, 'text/plain; charset=utf-8', llmsFullTxt(siteUrl(request))),
  );
}
