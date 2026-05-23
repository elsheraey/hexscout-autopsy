# hexscout-autopsy

A forensic archive and reconstruction of the retired **HEXscout** app
(iOS / Android / web, 2023–2026), captured 2026-05-15 after its Vercel
deployment was disabled and the apps were pulled from the stores.

This repo holds three independent artifacts:

| Folder | What it is |
|---|---|
| [`evidence/`](evidence/) | Forensic dump — 78 archived JS chunks across 17 production builds (June 2023 → Jan 2026) recovered via the Wayback Machine, plus a source-leak hunt, API/contract inventories, and notes on credentials that shipped in the client bundles. Start at [`evidence/README.md`](evidence/README.md). |
| [`snapshot/`](snapshot/) | A locally-serveable mirror of the production app (v1.0.34) extracted from the Android APK. 62 routes, 249 images, all JS chunks. `cd snapshot && python3 serve.py`. See [`snapshot/README.md`](snapshot/README.md). |
| [`prototype/`](prototype/) | A clean, from-scratch "museum" reconstruction — pure static HTML/CSS/JS, every number fabricated, 64 screens, no build step. Open [`prototype/sitemap.html`](prototype/sitemap.html) in a browser. See [`prototype/README.md`](prototype/README.md). |

Marketing screenshots that fed the reconstruction live in [`images/`](images/).
Source links (App Store, Play Store, marketing site, review videos) are
in [`links.txt`](links.txt).

## The original APK

`HEX.apk` (v1.0.34, 54 MB) is too large to track in-repo. It's attached
to the latest release:

**Download: [HEX.apk (latest release)](../../releases/latest/download/HEX.apk)**

## Disclaimer

Every number, balance, and chart in `prototype/` is fabricated for
navigation purposes. `snapshot/` runs the real production bundle locally
but external APIs (CoinGecko, PulseChain RPC, WalletConnect, etc.) will
fail or timeout - see `snapshot/README.md` for what works and what
doesn't.

This is documentation of a retired product. Nothing here is endorsed by,
affiliated with, or maintained by HEXscout's original authors.
