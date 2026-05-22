# Credentials embedded in production bundles

These are keys baked directly into the client-side JavaScript that HEXscout
shipped to every browser. They are not behind a server proxy — they go out as
plaintext on every page load. Recovered by `grep`ing the archived bundles in
`hexscout-com/historic-bundles/`.

> No keys were tested or used. They are documented here so the project owner
> can rotate them. If you re-deploy any of this for `pulsescout`, **route
> every paid API through your own backend** instead of inlining keys.

---

## 1. CoinGecko Pro — `CG-PuLr7guBkyo3YAYhxRkzRYsp`

Paid CoinGecko Pro API key, sent as the `x_cg_pro_api_key` query parameter.

Example occurrence (from `_app-a3089eb733c3e3cd.js`, June 2024):

```
"&x_cg_pro_api_key=CG-PuLr7guBkyo3YAYhxRkzRYsp"
```

Found in: every archived `_app-*.js` from May 2024 through Jan 2026
(`_app-a3089eb733c3e3cd.js`, `_app-10d88aa2be33f8a4.js`,
`_app-266dc784842f527a.js`, `_app-cbfdaa6a6ff24c87.js`, plus separate
page chunks like `7131-58df8ad1bb9ab6f1.js`).

Impact: anyone who downloaded the JS bundle (i.e. anyone who opened the
site) has read access to this key and could exhaust the CoinGecko Pro
monthly quota on the HEXscout account. CoinGecko's standard guidance is
that **Pro keys must be proxied server-side** — this is a real misuse.

## 2. ChangeNOW / on-ramp widget — `pk_live_GPBidbjKeILrNgjgNiqKyzqESzzuUIuJ`

Publishable key for the fiat → HEX on-ramp widget (shown in the
`/buy/changenow` and `/changenow` pages).

Example occurrence (from `changenow-e470f3592070f82c.js`, Jan 2026):

```
srcCurrency=EUR&srcChain=fiat&dstCurrency=HEX&dstChain=pulse-chain
  &paymentMode=sepa&apiKey=pk_live_GPBidbjKeILrNgjgNiqKyzqESzzuUIuJ
  &walletAddress=&walletAddressTag=
```

This is a *publishable* key (the `pk_` prefix), so it is intended to be
public on the provider's side and revenue still routes to the HEXscout
referral account. It is a referral identifier, not a secret — but it lets
anyone copy HEXscout's affiliate fees onto a competing site. Worth
rotating if the relationship is still active.

## 3. Nothing else

No `sk_live_…`, no AWS keys, no Stripe secret keys, no service-role
Supabase keys, no GitHub tokens. The team was careful about server-side
secrets; only these two client-side keys leaked.
