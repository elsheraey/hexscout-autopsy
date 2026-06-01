# How HEXScout builds its HEX stake rankings

Reconstructed from the leagues page chunk in this dump:
[`hexscout-com/historic-bundles/20241119015554_leagues-e300779f9a0db731.js`](hexscout-com/historic-bundles/20241119015554_leagues-e300779f9a0db731.js)
(webpack module `99409` = the `/leagues` page).

## The core idea: rank by your share of all T-Shares

Everything is built on one number: **T-Shares**. When you stake HEX, the
protocol gives you T-Shares (more for longer/bigger stakes). HEXScout doesn't
rank you by how much HEX you own or how many dollars you staked — it ranks you
by **what fraction of the entire global T-Share pool you hold**.

The ranking question is always: *"Out of every T-Share that exists across all
stakers, what slice is yours?"*

## Step 1 — Add up *your* T-Shares

Your personal total is the sum of three buckets pulled from your wallet:

1. **Native** — your normal active HEX stakes.
2. **Hedron** — HEX stakes tokenized as HSI (Hedron stake instances).
3. **Pooled** — HEX held indirectly through pooled-staking tokens (the app
   converts your token balance into the underlying T-Shares).

Add those three → that's **"Your T-Shares"** (e.g. 10,700 in the UI).

## Step 2 — Know the global picture

HEXScout maintains, for the whole network:

- **Total T-Shares** in existence.
- **Total number of stakers**.
- A per-league breakdown (stakers and T-Shares in each tier).

This is indexed from the chain (HEX/Hedron subgraphs) and served to the app as
the global leagues data via `GET /api/leagues`.

## Step 3 — The 8 leagues are fixed percentage tiers

Leagues are **not** "top 10 / top 100" cutoffs. They are orders of magnitude of
ownership share — each tier is 10× smaller than the one above:

| League  | You own more than…        |
|---------|---------------------------|
| Whale   | 1% of all T-Shares        |
| Shark   | 0.1%                      |
| Dolphin | 0.01%                     |
| Squid   | 0.001%                    |
| Turtle  | 0.0001%                   |
| Crab    | 0.00001%                  |
| Shrimp  | 0.000001%                 |
| Shell   | less than that            |

(There is a hidden top tier, **Poseidon**, for >10%, which the table hides.)

Your **league** is decided purely by `your T-Shares ÷ total T-Shares` → which
percentage bracket it falls into. The "Min. T-Shares" column is just each
percentage applied to the current global total (e.g. Whale threshold = total ÷ 100).

## Step 4 — Your position within a league and globally

Two ranking numbers come from `GET /api/leagues/personal?t={yourTShares}`:

- **Rank in League** (`#74`) — your position (`leaguePos`) among everyone in
  your league.
- **Global Rank** (`#91`) — your position (`globalPos`) among *all* stakers.

The **Level** gauge (e.g. 10%) is your league rank as a percentile:

```
level = 1 − (leaguePos ÷ stakersInYourLeague)
```

Near the top of the league → high %; near the bottom → low %.

## Step 5 — "How do I rank up?"

Because tiers are share-based, leveling up means owning a bigger slice. The app
computes the gap — *T-Shares needed for the next league* minus *what you have* —
converts it to a HEX amount at the current share price, and offers a pre-filled
max-length stake (`/stake?hex={amount}&days=5555`) to close the gap.

## One-sentence summary

> HEXScout ranks every staker by their fraction of the total global T-Share
> pool — it sums your native + HSI + pooled T-Shares, divides by the network
> total to place you in one of 8 percentage-based leagues, then shows your
> position within that league and across all stakers.

## Caveat

The actual **per-staker ranking math** (computing `leaguePos` / `globalPos` and
the total counts) happens server-side in the `/api/leagues` route, which is
**not in this dump** — we only have the client code that consumes it. The
ranking *model* above is exact; the precise aggregation/sorting query (the
subgraph calls that produce the sorted staker list) would have to be inferred
or rebuilt.
