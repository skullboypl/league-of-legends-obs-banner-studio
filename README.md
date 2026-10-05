# LoL Banner Studio

LoL Banner Studio is a League of Legends ranked overlay generator for OBS Studio and Streamlabs. Enter a Riot ID, choose a server, customize the banner and copy one browser-source URL into your scene.

The project is an independent community tool inspired by the workflow of FACEIT Banner Studio. It uses the official Riot API through a small server-side proxy, so the API key never ships to the browser or appears in generated widget URLs.

## Current features

- Riot ID lookup, including profile icon and summoner level.
- Ranked Solo/Duo and Ranked Flex data.
- Rank, League Points, win rate, wins, losses, total games and LP progress.
- Twenty-two banner layouts: fourteen classic (Prime, Broadcast, Compact, Showcase, Split, Minimal, Tower, Scoreboard, Slim, Wide, Info, Stripe, Badge, Ticket) and eight animated (Deck, Orbit, Marquee, Hextech, Tabs, Radar, Flip, Ladder), plus seven themes for the classic layouts.
- Riot-inspired themes, custom colors, three fonts, opacity, radius, scale, glow and animation controls.
- Individual visibility switches for profile and ranked information.
- Live Studio preview, local settings, settings import/share and OBS export dialog.
- Responsive Studio layout and a transparent Browser Source widget at `/widget`.

## Documentation (SSR, SEO, AEO, GEO)

Public documentation is rendered on the server by Express (no client-side JavaScript needed) and lives at `/docs`. The Studio sidebar links to it at the bottom ("Instrukcja OBS" and "Dokumentacja").

- Content: `server/docs/content.mjs` (single source for HTML, Markdown and JSON-LD).
- Rendering and SEO: `server/docs/render.mjs`; routes: `server/docs/routes.mjs`.
- **SEO**: unique titles/descriptions, canonical, hreflang, Open Graph, `sitemap.xml`, `robots.txt`.
- **AEO**: a "Krótka odpowiedź" summary on top of each page, FAQ sections, and `FAQPage`, `HowTo`, `TechArticle` and `BreadcrumbList` JSON-LD.
- **GEO**: `/llms.txt`, `/llms-full.txt`, a Markdown version of every page (`/docs/<slug>.md`), and explicit AI-crawler rules in `robots.txt`.
- Set `SITE_URL` (e.g. `https://your-domain`) so canonical URLs and the sitemap use the public domain; otherwise the request host is used.

## Local development

Requirements: Node.js 22+ and pnpm 9+.

```bash
pnpm install
copy .env.example .env.dev
pnpm dev
```

The Studio runs at `http://localhost:5175`. The local API runs at `http://localhost:8787`.

Put your development key in `.env.dev`:

```env
RIOT_API_KEY=RGAPI-your-development-key
RIOT_VERIFY=riot-verification-code
PORT=8787
```

Development keys expire after 24 hours. Never commit `.env.dev`, `.env`, or a private deploy key.

## CapRover deployment

This repository includes `captain-definition`, `Dockerfile` and `deploy/nginx.conf` for a single-container CapRover deployment.

1. Create or select a CapRover app.
2. Deploy this repository using the Captain Definition method.
3. In **App Configs → Environmental Variables**, set `RIOT_API_KEY` to the production Riot key.
4. Keep `PORT=8787` if you use the included defaults. CapRover exposes the Nginx HTTP port `80`.
5. Set the app domain and enable HTTPS before sharing the widget URL.

Nginx serves the built Studio on port 80 and proxies `/api/*` to the internal Node API on port 8787. The browser only sees the public API routes; the Riot key remains a runtime environment variable.

For Riot product verification, set `RIOT_VERIFY` in the same environment. The backend generates `https://your-domain/riot.txt` at runtime with exactly that value, so the verification code does not need to be committed to the repository.

## Project structure

```text
src/                 React Studio, widget and banner renderer
server/index.mjs     Riot API proxy, cache and rate limit
deploy/nginx.conf    CapRover reverse proxy and SPA routing
captain-definition   CapRover Docker deployment entrypoint
Dockerfile           Multi-stage build: Vite + Nginx + Node API
```

## API flow

The backend resolves a Riot ID through `ACCOUNT-V1`, loads the summoner profile through `SUMMONER-V4`, and retrieves ranked entries through `LEAGUE-V4` by PUUID. Data Dragon is used for the profile icon asset. Responses are cached briefly to keep normal OBS refreshes within Riot rate limits.

## Riot policy notice

LoL Banner Studio is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

The product does not request Riot passwords, automate gameplay, estimate hidden MMR or organize tournaments. Before a public launch, register the product in the Riot Developer Portal and use the approved production key for this application.

## License

The project is released under the MIT License. See `LICENSE` when the project license is added.
