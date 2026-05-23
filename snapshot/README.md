# HEXscout · static snapshot

A locally-serveable mirror of the now-retired HEXscout app (v1.0.34),
reconstructed from the Android APK. Every screen, every image, every JS
chunk, every CSS file - preserved on disk and clickable as if the app
were still live.

## Run it

```bash
cd hexscout/snapshot
python3 serve.py
# open http://localhost:8080/sitemap   ← navigation grid (62 screens)
# open http://localhost:8080/          ← the actual HEXscout home
```

Custom port: `PORT=3000 python3 serve.py`.

The server is a 40-line `SimpleHTTPRequestHandler` subclass that
resolves clean URLs the same way `next start` did - so `/portfolio`
maps to `portfolio.html` automatically.

## Where everything came from

| Source | Role |
|---|---|
| `apk-extract/assets/public/*` | The Next.js `next export` output bundled inside the APK. Copied here verbatim. |
| `hexscout/images/*` | The original marketing screenshots. Copied to `_marketing/` here so the sitemap can show thumbnails next to each card. |
| `sitemap.html` | New - a hand-curated navigation grid. Not part of the original app. |
| `serve.py` | New - clean-URL static server. |

## What works

- All 62 routes (every `.html` page) and their internal links.
- All 249 images: logos, wallet icons, league badges, hero art, OG cards.
- All CSS bundles (the dark gradient + Exo/Russo One typography renders correctly).
- All 82 JS chunks (so React/wagmi/Web3Modal *try* to hydrate).
- Routing between pages via in-app `<Link>` components.
- The console "%cSTOP! NEVER paste anything in here!" Easter egg.

## What doesn't

- **Live data**. CoinGecko, Pulsefusion subgraphs, HEXDailyStats, GeckoTerminal, DexScreener, the PulseChain RPC, and `cardiorta.vercel.app` are all called from the bundled JS - they'll fail/timeout. Charts and balances show their loading states.
- **WalletConnect / MetaMask**. Connectors initialize but no wallet flow completes.
- **Google Fonts**. Loaded from `fonts.googleapis.com` - needs internet for the proper typography. The page is still readable with the system font fallback.
- **The dynamic share route** `/[a]` (used for wallet portfolio share URLs like `/0x123…`). The catch-all renders but has no data to display.

## Pages by category (mirrors the sitemap)

- **Landing & onboarding** - `/`, `/start`, `/start/about`, `/start/buy`, `/start/buy/selecthex`, `/start/staking`, `/start/stake`, `/start/stake/types`, `/start/stake/info`, `/start/stake/execute`, `/start/support`
- **Portfolio & staking** - `/portfolio`, `/stake`, `/ladder`, `/leagues`, `/whalewatch`, `/stats`, `/settings`
- **Market & charts** - `/market`, `/chart`, `/deepdive`, `/liquidity`, `/news`
- **Buy / on-ramp / swap** - `/buy`, `/buy/changenow`, `/buy/ramp`, `/buy/transak`, `/buyEmbed`, `/changenow`, `/letsexchange`, `/swap`, `/swap/index_original`, `/uniswap`, `/piteas`, `/gopulse`
- **Learn & wiki** - `/learn`, `/learn/hex`, `/learn/staking`, `/learn/ladder`, `/learn/crypto`, `/learn/trade`, `/learn/tax`, `/learn/storage`, `/learn/trust`, `/learn/marketing`, `/wiki/[[...slug]]`
- **Support & legal** - `/support`, `/support/more`, `/support/success`, `/support/adm`, `/about`, `/brand`, `/disclaimer`, `/privacy`, `/tos`
- **Internal / curious** - `/app`, `/admin2000`, `/admin2000/news`, `/pulse`, `/test`, `/[a]`, `/404`

## Going fully offline

If you want a museum-quality snapshot with no network reads at all:

1. Block the bundled JS from running - append `?nojs=1` query handling in
   `serve.py`, or strip every `<script>` tag with a `sed` pass over the
   `*.html` files. The static UI shell will then render cleanly without
   API failures cluttering the DevTools console.
2. Download the Google Fonts WOFF2s and rewrite the `@font-face` URLs in
   `_next/static/css/*.css` to local paths. The fonts in question:
   `Exo` (4 weights) and `Russo One` (regular). Each is ~25 KB.
3. The chart embeds at `/chart` use `dexscreener.com` and `tradingview.com`
   inside `<iframe>`s. Those will always need internet to load. Replace
   with a screenshot if needed.

Or just open the relevant `.html` file directly from `file://` -
absolute paths like `/_next/...` won't resolve, but the on-page text
content is still readable in your editor.

## Size

`66 MB / 449 files` total. The bulk is `/img/*` (44 MB - they ship every
wallet logo, league badge, league hero, onboarding illustration, news
thumbnail, etc.) and `/_next/*` (6.6 MB of minified JS + CSS).

## Caveat

This is the app as the team last shipped it. The Vercel deployment
(`hexscout.com`) is now `HTTP 402 DEPLOYMENT_DISABLED`, and the Play
Store version 1.0.34 is the final build. Treat this folder as an
archival mirror, not as a working product.
