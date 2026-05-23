# HEXscout forensic dump

Captured 2026-05-15 by inspecting the live `about.hexscout.com` site, the Vercel
response headers for `hexscout.com`, and **78 archived JS chunks across 17 distinct
production builds** from the Internet Archive (June 2023 → Jan 2026).

`hexscout.com` and `cardiorta.vercel.app` were both returning
`HTTP 402 DEPLOYMENT_DISABLED` from Vercel at capture time, so production
bundles were retrieved through Wayback Machine.

For the source-leak hunt results (executive summary + key findings), see
[`LEAK-HUNT.md`](LEAK-HUNT.md). For the two leaked credentials and the
undocumented sibling app, see [`extracted/leaked-credentials.md`](extracted/leaked-credentials.md).

## What's where

### `headers/`
- `probes.txt` - `curl -I` output for `hexscout.com`, `www.hexscout.com`,
  `about.hexscout.com`, `app.hexscout.com`. `hexscout.com` clearly shows
  `server: Vercel` and `x-vercel-error: DEPLOYMENT_DISABLED`.
- `dns.txt` - A record for `hexscout.com` (`76.76.21.21`, Vercel's anycast IP)
  and the `cname.vercel-dns.com` CNAME for `www`.

### `wayback/`
JSON responses from `archive.org/wayback/available?url=…` proving which
domains have archived snapshots.

### `about-hexscout/`
The marketing site at `about.hexscout.com` (currently live, behind Cloudflare).
- `index.html` - raw production HTML
- `bundles/` - every JS/CSS chunk referenced in `index.html`
  (Next.js static export: `_app`, `framework`, `main`, `webpack`, the page
  chunk, plus CSS).

### `hexscout-com/`
The main app, retrieved via Wayback.
- `wayback-snapshot.html` - full archived HTML of the Jan 2026 snapshot
- `all-archived-urls.txt` - every URL Wayback ever crawled (302 unique)
- `all-page-chunks.txt` - all 57 page chunks listed in the 2026 `_buildManifest.js`
- `bundles/` - Jan 2026 build, fetched via Wayback's `js_/` (wombat-wrapped) prefix
- `historic-bundles/` - **78 distinct chunks across 17 production builds**
  (June 2023 → Jan 2026), each filename prefixed with its archive timestamp.
  These were fetched via Wayback's `id_/` prefix, which returns the *raw*
  production asset (no wombat wrapper) - so they're smaller and cleaner than
  the matching files in `bundles/`. Includes multiple historic `_app-*.js`
  versions, page chunks for `market`, `portfolio`, `stake`, `start/*`,
  `changenow`, `buy`, `ladder`, `leagues`, `news`, `pulse`, `support`,
  `stats`, `tos`, `privacy`, plus every build manifest.

### `launch-hexscout/`
The original June 2023 deployment at `launch.hexscout.com` (now a 308 redirect).
- `index.html` - archived landing page
- `bundles/` - runtime chunks. **Note**: `framework`, `main`, `polyfills` have
  the *same hashes* as the Jan 2026 build, meaning the underlying Next.js
  version didn't change in 2.5 years.
- `misc/millennium_wealth-building_opportunity.pdf` - marketing brochure they
  hosted alongside the app

### `misc/`
- `cardiorta-headers.txt` - `curl -I` proving `cardiorta.vercel.app` is a
  separate (now-disabled) Vercel app from the same team
- `robots.txt` - minimal, only excludes `/nogooglebot/`

### `extracted/`
Derived intel - everything in the summary I gave was pulled from here.

- `capacitor-evidence.txt` - verbatim Capacitor banner + `CapacitorPlatforms`
  references in `_app.js`. This is the smoking gun that web + iOS + Android
  are all the same code.
- `library-fingerprints.txt` - every library marker found (wagmi, viem,
  ethers, Web3Modal, WalletConnect, MetaMask, CoinbaseWallet, Capacitor,
  @emotion, moti, chart.js, chartjs-plugin-annotation, swr, amplitude).
- `api-endpoints-all.txt` - every URL hard-coded in `_app.js` (Wayback prefix
  stripped).
- `api-endpoints-hex-ecosystem.txt` - the HEX/PulseChain-specific subset.
  This is the master list of data sources HEXscout uses.
- `sitemap.txt` - every route in the app, derived from `_buildManifest.js`.
  Shows the full feature surface (`/portfolio`, `/stake`, `/ladder`,
  `/leagues`, `/whalewatch`, `/start/*` onboarding flow, `/buy/{ramp,transak,
  changenow}`, `/swap`, `/wiki/[[...slug]]`, etc.).
- `contract-addresses.txt` - all 212 unique 0x-addresses in `_app.js`
  (HEX, HSI, Hedron, PLSX, INC + WETH/USDC/USDT/DAI + ~190 more, mostly
  PulseX pair contracts and individual stake instances).
- `contract-addresses-annotated.txt` - the subset I could label by hand.
- `leaked-credentials.md` - two real credential leaks (CoinGecko Pro key,
  ChangeNOW pk_live key) baked into client-side JS, plus the discovery of
  the `cardiorta.vercel.app` sibling app.

## How to reproduce

```bash
# 1. Confirm Vercel hosting
curl -I https://hexscout.com

# 2. Find a Wayback snapshot
curl -s "https://archive.org/wayback/available?url=hexscout.com"

# 3. Pull the HTML through Wayback
curl -sL "https://web.archive.org/web/20260117061911/https://hexscout.com/" \
  -o snapshot.html

# 4. Extract chunk URLs and download them via the "js_" prefix
grep -oE '/_next/static/[^"]+\.js' snapshot.html \
  | while read p; do
      curl -sL "https://web.archive.org/web/20260117061911js_/https://hexscout.com${p}" \
        -o "$(basename "$p")"
    done

# 5. Fingerprint the bundle
strings _app-*.js | grep -E '(capacitor|wagmi|viem|pulsefusion|hexstats|pro-api\.coingecko)'
```

The Next.js production bundle inlines every `process.env.NEXT_PUBLIC_*` value
and string literal at build time, which is why grepping it surfaces every
API URL the app uses.

## Notable findings (TL;DR)

1. **Next.js (Pages Router) on Vercel** - confirmed by Vercel header +
   `_next/static/` paths + `__NEXT_DATA__` + `pages/_app`.
2. **Capacitor wraps the web bundle as iOS/Android apps** - confirmed by the
   `/*! Capacitor: https://capacitorjs.com/ */` banner inside the production
   `_app.js`. Same code on all three platforms.
3. **Data layer**: HEXDailyStats (`hexstats.today`) + pulsefusion subgraphs
   (HEX + Hedron, both ETH and PLS) + CoinGecko **Pro** API +
   GeckoTerminal + DexScreener + their own Next.js API routes
   (`/api/market/data`) and a side service (`hexscoutcalls.com/api/data/daily`).
4. **Chain interaction**: wagmi + viem + ethers, `rpc.pulsechain.com` +
   `rpc-pulsechain.g4mm4.io` as RPC providers, Web3Modal v2 + WalletConnect +
   MetaMask + CoinbaseWallet connectors.
5. **Charts**: chart.js + `chartjs-plugin-annotation`.
6. **Analytics**: Amplitude.
