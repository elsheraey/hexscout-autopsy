# APK extraction — index

Source APK: [`hexscout/HEX.apk`](../../HEX.apk) (54 MB,
`dev.cardio.hexscout` v1.0.34, pulled via `adb`)

Extracted to: [`hexscout/dump/apk-extract/`](../apk-extract/) — 62 MB, 683
files.

## What lives where

| Path under `apk-extract/` | What it is |
|---|---|
| `AndroidManifest.xml` | Binary AXML. `strings -e l` to read it. |
| `META-INF/` | APK signing manifest, cert |
| `classes.dex` | All Android Java/Kotlin code (Capacitor runtime, Cordova compat, native plugins) |
| `kotlin/` | Kotlin metadata (.kotlin_builtins, .kotlin_metadata) |
| `org/` | Bouncy Castle crypto provider |
| `res/` | Android resources (layouts, drawables, values) |
| `resources.arsc` | Compiled resource table |
| `assets/capacitor.config.json` | **Capacitor app config — verbatim** |
| `assets/capacitor.plugins.json` | **Plugin registration (only 2 plugins)** |
| `assets/native-bridge.js` | Capacitor JS bridge (48 KB) |
| `assets/dexopt/` | Capacitor dex optimization cache |
| `assets/public/` | **The entire web bundle (the Next.js `out/` directory)** |

## Inside `assets/public/` — the recovered web bundle

| Path | Contents | Count |
|---|---|---|
| `*.html` (root + subfolders) | Statically pre-rendered Next.js pages (`next export`) | **62 HTML files** |
| `_next/static/chunks/pages/` | Per-route JS bundles | **43 files** including all 35 Wayback never archived (`portfolio`, `stake`, `market`, `whalewatch`, `chart`, `deepdive`, `liquidity`, …) |
| `_next/static/chunks/*.js` | Vendor/shared JS chunks | **39 files** |
| `_next/static/css/` | Stylesheets | 1 main bundle |
| `_next/static/<buildId>/_buildManifest.js` & `_ssgManifest.js` | Build metadata. `buildId = op2WxWQ7OSKT8a8D-bBea` (Play-Store-only build) | 2 files |
| `_next/data/<buildId>/learn/*.json` | SSG props for `/learn/*` wiki pages — minimal stubs | 9 files |
| `img/` | Logos, wallet icons, league badges, hero images, OG cards | **249 images** |
| `cordova.js`, `cordova_plugins.js` | Cordova compat shims (Capacitor uses these for legacy plugin support) | 2 files |
| `favicon.ico`, `hexscout_og.png`, `hexscout_tw.png` | Standard meta assets | |

## Quick wins for `pulsescout` reverse-engineering

Open these directly to see the deobfuscated structure of each feature:

| Feature | Open this file |
|---|---|
| Routing / app shell | `apk-extract/assets/public/_next/static/chunks/pages/_app-99b6d55180eb21f3.js` (2.79 MB — the master) |
| Portfolio | `pages/portfolio-d8532dde666b0002.js` |
| Stake / staking | `pages/stake-726167e8a4b92f4a.js` |
| Market chart | `pages/market-a3d1dc1f0afaa3ee.js` |
| Whale-watch list | `pages/whalewatch-614d864551fca3a0.js` |
| Embedded chart (TradingView/DexScreener) | `pages/chart-bf5510b212fc4964.js` + `chart.html` |
| Ladder calculator | `pages/ladder-ecf92a95f1a0505c.js` |
| Leagues (T-share ranks) | `pages/leagues-e300779f9a0db731.js` |
| Buy/onramp flow | `pages/changenow-17063a32a1f55265.js` + `pages/buy-2b05c6dfec2fe785.js` + `pages/changenow.html` |
| Swap | `pages/swap-f5042d1c74d06f20.js` |
| Onboarding "what-if" simulator | `pages/start-f1aaa0b9eff15dcd.js` + `pages/start/*` |
| News | `pages/news-9f20daa083b88225.js` |
| Wiki/Learn | `pages/[slug]-739cee9819ae0fee.js` + `learn/*.html` |
| Settings | `pages/settings-337c62c862f97202.js` |

All chunks are minified but readable enough to grep for API endpoints,
contract addresses, and React component patterns. They are *not* source
code — variable names are mangled and JSX is compiled away — but the
control flow and data shape are intact.

## What this **does not** give you

- Original `.tsx`/`.jsx` source files (no source maps in any build)
- TypeScript types or interface definitions
- Tailwind/CSS-in-JS authoring source
- Component file names or directory structure
- Commit history or any version control metadata

To rewrite a HEXscout feature for `pulsescout`, treat the minified chunk as
a behavioural spec: read what it fetches and computes, then reimplement
the React component from scratch in TypeScript.
