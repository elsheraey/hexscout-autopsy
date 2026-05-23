# HEXscout · museum prototype

A clean, from-scratch reconstruction of the retired HEXscout app - built
to be navigated, not to be functional. Every number is fabricated. **Pure
static HTML / CSS / vanilla JS** - no server, no build step, no
dependencies. Open the entry point in a browser and click around.

Unlike [`../snapshot/`](../snapshot/) (which extracts the production
React bundle from the APK and tries to revive it), this folder is
brand-new HTML designed from the marketing screenshots and the recovered
design tokens.

## Run it

There is no server. Just open one of:

- **`sitemap.html`** - gallery view, all 64 screens (recommended entry)
- **`src/index.html`** - the actual onboarding landing page

Double-click in your file manager, or `xdg-open sitemap.html` / `open
sitemap.html` / `start sitemap.html` from a terminal.

Every internal link uses relative paths with `.html` extensions, so
clicking around just navigates between files on disk.

## Structure

```
prototype/
├── README.md          ← this file
├── sitemap.html       ← museum index, the entry point
└── src/               ← everything else
    ├── index.html
    ├── portfolio.html, stake.html, market.html, ...   (~35 root pages)
    ├── start/         ← 12-page onboarding flow
    ├── learn/         ← 9 wiki articles
    ├── buy/           ← 4 onramp variants
    ├── support/       ← 3 help pages
    ├── swap/, admin2000/
    ├── css/style.css  ← one stylesheet
    ├── js/data.js     ← all fake data
    ├── js/app.js      ← shared layout + chart helpers
    └── img-marketing/ ← the original marketing screenshots
```

## Interactive bits

| Screen | Try this |
|---|---|
| `src/index.html` | Drag the investment slider - value updates |
| `src/portfolio.html` | Donut chart + asset list render from SAMPLE data |
| `src/stake.html` | Drag amount + days sliders - T-shares, APY, maturity all recalc live |
| `src/ladder.html` | Drag rung-count slider - bar chart and schedule rebuild |
| `src/market.html` | Toggle time-range buttons (cosmetic) |
| `src/swap.html` | Type in From input - conversion happens live |
| `src/settings.html` | Click any switch - it toggles |
| `sitemap.html` | One-click access to every screen |

Click the HEXscout logo on any page → goes back to the sitemap.

## How it's wired

Each HTML page sets `window.PREFIX` based on its folder depth within
`src/` (root = `""`, `src/start/about.html` = `"../"`,
`src/start/stake/types.html` = `"../../"`). The shared `app.js` uses
that prefix to build the bottom-nav and logo hrefs. Same nav code works
no matter where it's loaded from.

The logo link points to `${PFX}../sitemap.html` since the sitemap lives
one level above `src/`.

## Going more offline

Fonts (Exo, Russo One) load from `fonts.googleapis.com`. If you want
zero network access, download the WOFF2 files and replace the `@import`
line at the top of `src/css/style.css` with local `@font-face`
declarations. The fallback is `-apple-system, BlinkMacSystemFont, "Segoe
UI", Roboto` so the site is still perfectly readable without them.

Everything else (icons, charts, layout, screenshots) is local.

## Caveat

This is a museum reconstruction, not the real app. Real HEXscout is at
`../snapshot/` if you want to see the actual minified production code.
Numbers, names, news headlines, wallet addresses, T-share counts - all
fabricated to look plausible.
