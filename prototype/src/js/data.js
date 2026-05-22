// Sample data for the HEXscout prototype. None of this is real — every number
// is fabricated for the museum experience.

window.SAMPLE = {
  user: { wallet: "0xAB12…3F4D", ens: "moonbeam.pls" },

  prices: {
    hexUSD: 0.0093,
    hexUSDChange: 4.8,
    plsUSD: 0.000061,
    plsxUSD: 0.000035,
    incUSD: 18.42,
    btcUSD: 96420.31,
    ethUSD: 3812.54,
  },

  portfolio: {
    networthUSD: 1352640,
    networthDelta24h: 2.4,
    breakdown: [
      { name: "eHEX Stakes", color: "#ff4a2b", usd: 612000, pct: 45.3 },
      { name: "pHEX Stakes", color: "#d92cb0", usd: 421000, pct: 31.1 },
      { name: "PLSX",        color: "#7a3bff", usd: 142800, pct: 10.6 },
      { name: "PLS",         color: "#45a7ff", usd:  86200, pct:  6.4 },
      { name: "DECI",        color: "#f48a1f", usd:  55400, pct:  4.1 },
      { name: "INC",         color: "#1ed760", usd:  35240, pct:  2.6 },
    ],
    totals: { hex: 130106781, ehex: 78400000, phex: 51706781 },
    stakeYield24h: 972068,
  },

  assets: [
    { sym: "PLS",   name: "Pulse",          bal: 1480000000, usd:  90280 },
    { sym: "PLSX",  name: "PulseX",         bal: 5400000000, usd: 189000 },
    { sym: "INC",   name: "Incentive",      bal:        6.21, usd:   114.39 },
    { sym: "DECI",  name: "DECI maxi HSI",  bal: 14200,       usd:  55400 },
  ],

  stakes: [
    { type: "Native HEX",  chain: "PulseChain", principal: 12000000, tshares: 142.3, startDate: "24 Dec 2023", endDate: "23 Dec 2024", progress: 78, days: 365 },
    { type: "Native HEX",  chain: "Ethereum",   principal:  5400000, tshares:  61.7, startDate: "05 Nov 2023", endDate: "01 Jun 2025", progress: 42, days: 574 },
    { type: "HSI",         chain: "PulseChain", principal: 28000000, tshares: 320.1, startDate: "12 Mar 2024", endDate: "21 Sep 2028", progress: 18, days: 1654 },
    { type: "Native HEX",  chain: "PulseChain", principal:  3200000, tshares:  39.8, startDate: "02 Feb 2024", endDate: "10 Feb 2026", progress: 56, days: 740 },
  ],

  league: {
    yourTshares: 4710,
    tier: "Shark",
    contribution: { hex: 113, pls: 87, plsx: 212 },
    tiers: [
      { name: "Turtles",  icon: "🐢", min: 100215, count: 17,     color: "#7a3bff" },
      { name: "Crabs",    icon: "🦀", min: 10021,  count: 82,     color: "#f48a1f" },
      { name: "Sharks",   icon: "🦈", min: 1002,   count: 880,    color: "#45a7ff" },
      { name: "Squids",   icon: "🦑", min: 100,    count: 4376,   color: "#d92cb0" },
      { name: "Stars",    icon: "⭐", min: 10,     count: 16089,  color: "#ffd23f" },
      { name: "Octos",    icon: "🐙", min: 1,      count: 38359,  color: "#1ed760" },
      { name: "Shrimp",   icon: "🦐", min: 0.1,    count: 37591,  color: "#ff4a2b" },
      { name: "Plankton", icon: "🟢", min: 0.01,   count: 30690,  color: "#5a8b5a" },
    ],
    distribution: [
      { color: "#7a3bff", pct: 38 },
      { color: "#f48a1f", pct: 21 },
      { color: "#45a7ff", pct: 14 },
      { color: "#d92cb0", pct: 11 },
      { color: "#ffd23f", pct: 8  },
      { color: "#1ed760", pct: 5  },
      { color: "#ff4a2b", pct: 2  },
      { color: "#5a8b5a", pct: 1  },
    ],
    totalStaked: 648_000_000,
  },

  // 730 days of fake HEX price history
  marketChart: (() => {
    const days = 730; const out = [];
    let p = 0.00018;
    const now = Date.now();
    for (let i = 0; i < days; i++) {
      // upward drift with volatility, occasional crashes
      const drift = 1 + 0.0035;
      const noise = 1 + (Math.sin(i / 7) + Math.sin(i / 23) * 0.6) * 0.04 + (Math.random() - 0.5) * 0.07;
      p = Math.max(0.0001, p * drift * noise);
      if (i === 180) p *= 0.45;        // first crash
      if (i === 360) p = Math.max(p, 0.005);
      if (i === 540) p *= 0.72;        // second crash
      out.push({ t: now - (days - i) * 86400000, p: p });
    }
    out[days - 1].p = 0.0093; // anchor today to our headline price
    return out;
  })(),

  ladder: [
    { y: 1,  pct: 10, tshares:  4.2 },
    { y: 2,  pct: 15, tshares: 13.1 },
    { y: 3,  pct: 20, tshares: 26.8 },
    { y: 4,  pct: 20, tshares: 38.4 },
    { y: 5,  pct: 15, tshares: 36.9 },
    { y: 6,  pct: 10, tshares: 29.7 },
    { y: 7,  pct: 6,  tshares: 21.0 },
    { y: 8,  pct: 4,  tshares: 16.8 },
  ],

  news: [
    { title: "PulseX V3 quietly ships concentrated liquidity",       src: "PulseChain.com",   ago: "2h",  cat: "Ecosystem"  },
    { title: "HEX endstaker incentive proposal hits 92% approval",   src: "Hedron Forum",     ago: "5h",  cat: "Governance" },
    { title: "Validator count crosses 16,000 — fees keep falling",   src: "DexBase",          ago: "9h",  cat: "Network"    },
    { title: "Maxi token rotation: TRIO reaches midway redemption",  src: "HexDailyStats",    ago: "1d",  cat: "Maxi"       },
    { title: "Mining nodes return to >10k uptime after patch v1.3",  src: "PulseTeam Blog",   ago: "1d",  cat: "Mining"     },
    { title: "RH stake ends in 1,247 days — what holders expect",    src: "CommunityPodcast", ago: "2d",  cat: "Culture"    },
  ],

  ramps: [
    { name: "ChangeNOW",   note: "No KYC up to €700, EUR/USD, SEPA",     fee: "0.9%", est: "~5 min" },
    { name: "Transak",     note: "KYC required, EUR/USD, card + bank",   fee: "2.1%", est: "~3 min" },
    { name: "Ramp Network",note: "EUR/USD/GBP, SEPA & open banking",     fee: "1.8%", est: "~5 min" },
    { name: "LetsExchange",note: "Crypto → HEX swap, no KYC",            fee: "0.5%", est: "~2 min" },
  ],

  whales: [
    { addr: "0x4fbB…D314", tshares: 12480.2, totalHEX: 920_000_000, lastMove: "2h" },
    { addr: "0xDeb3…7Ae1", tshares:  9810.5, totalHEX: 740_000_000, lastMove: "1d" },
    { addr: "0x017F…F2c8", tshares:  8202.0, totalHEX: 612_000_000, lastMove: "4d" },
    { addr: "0xC0fF…ee0a", tshares:  7416.8, totalHEX: 555_000_000, lastMove: "1w" },
    { addr: "0x9281…aB30", tshares:  6204.1, totalHEX: 480_000_000, lastMove: "3d" },
  ],

  learn: [
    { slug: "hex",       title: "What is HEX?",                   summary: "A time-locked deposit certificate written into a smart contract." },
    { slug: "staking",   title: "How HEX staking works",          summary: "Lock HEX, earn T-shares, get rewarded daily by the contract." },
    { slug: "ladder",    title: "Why ladder your stakes",         summary: "Stagger maturity dates for liquidity + compounding upside." },
    { slug: "crypto",    title: "Crypto, for the first time",     summary: "Wallets, private keys, gas fees — the absolute basics." },
    { slug: "tax",       title: "Tax considerations for HEX",     summary: "Stake-end events, dividends, capital gains: the high-level map." },
    { slug: "storage",   title: "Self-custody & cold storage",    summary: "Hardware wallets and how not to lose them." },
    { slug: "trade",     title: "Trading on PulseX",              summary: "Slippage, MEV, and route selection in practice." },
    { slug: "trust",     title: "Trust, audits, longevity",       summary: "What audits HEX has had and what they actually mean." },
    { slug: "marketing", title: "Community marketing & memes",    summary: "Why HEX-adjacent communities run their own outreach." },
  ],
};
