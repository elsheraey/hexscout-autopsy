// Shared chrome (header + bottom nav) for every HEXscout prototype screen.
// Pages call window.renderShell(currentRoute) before rendering page-specific UI.

(function () {
  // Per-page prefix is set by each HTML before this script runs.
  // For root pages it's "", for /start/about.html it's "../", etc.
  const PFX = window.PREFIX || "";

  const NAV = [
    { id: "market",    href: PFX + "market.html",    icon: "📈", label: "Market"    },
    { id: "portfolio", href: PFX + "portfolio.html", icon: "💎", label: "Portfolio" },
    { id: "news",      href: PFX + "news.html",      icon: "📰", label: "News"      },
    { id: "wallet",    href: PFX + "settings.html",  icon: "👛", label: "Wallet"    },
  ];

  function $(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  window.renderShell = function (current) {
    document.body.classList.add("has-shell");

    const header = $(
      `<header class="app-header">
         <a class="logo" href="${PFX}../sitemap.html" title="All screens">HEX<span class="ix">scout</span></a>
         <div class="chip-row">
           <span class="chip dot">PulseChain</span>
           <button class="icon-btn" title="Menu" aria-label="Menu">☰</button>
         </div>
       </header>`
    );

    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    NAV.forEach((n) => {
      const a = document.createElement("a");
      a.href = n.href;
      if (current && current === n.id) a.classList.add("active");
      a.innerHTML = `<span class="ic">${n.icon}</span><span>${n.label}</span>`;
      nav.appendChild(a);
    });

    const app = document.querySelector(".app");
    if (app) {
      app.prepend(header);
      app.appendChild(nav);
    } else {
      document.body.prepend(header);
      document.body.appendChild(nav);
    }
  };

  // Format helpers used across pages.
  window.fmtUSD = function (n, opts = {}) {
    const { decimals = 0, compact = false } = opts;
    if (compact && Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (compact && Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };
  window.fmtHEX = function (n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
  };
  window.fmtPct = function (n, sign = false) {
    return (sign && n >= 0 ? "+" : "") + n.toFixed(2) + "%";
  };

  // Inline SVG donut chart. items: [{color, pct}], with a center label.
  window.donutSVG = function (items, opts = {}) {
    const { size = 180, stroke = 18, gap = 1, center = "" } = opts;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const cx = size / 2, cy = size / 2;
    let acc = 0;
    const arcs = items.map((it) => {
      const len = (it.pct / 100) * c - gap;
      const off = -acc;
      acc += (it.pct / 100) * c;
      return `<circle r="${r}" cx="${cx}" cy="${cy}" fill="none" stroke="${it.color}" stroke-width="${stroke}" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${off}" transform="rotate(-90 ${cx} ${cy})"/>`;
    }).join("");
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle r="${r}" cx="${cx}" cy="${cy}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${stroke}"/>
      ${arcs}
      ${center ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Russo One" font-size="${size / 7}">${center}</text>` : ""}
    </svg>`;
  };

  // Inline SVG line chart over an array of {t, p}.
  window.lineChartSVG = function (data, opts = {}) {
    const { w = 420, h = 200, pad = 12, fill = true } = opts;
    if (!data || !data.length) return "";
    const xs = data.map((d) => d.t);
    const ys = data.map((d) => d.p);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const x = (v) => pad + ((v - xMin) / (xMax - xMin)) * (w - pad * 2);
    const y = (v) => h - pad - ((v - yMin) / (yMax - yMin)) * (h - pad * 2);
    const pts = data.map((d) => `${x(d.t).toFixed(1)},${y(d.p).toFixed(1)}`).join(" ");
    const fillPath = `M ${x(xs[0]).toFixed(1)},${h - pad} L ${pts} L ${x(xs[xs.length - 1]).toFixed(1)},${h - pad} Z`;
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stop-color="#ff4a2b" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#ff4a2b" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${fill ? `<path d="${fillPath}" fill="url(#lg)"/>` : ""}
      <polyline points="${pts}" fill="none" stroke="#ff4a2b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  };

  // Tiny bar-mini chart for ladder etc.
  window.barChartSVG = function (data, opts = {}) {
    const { w = 320, h = 130, pad = 10, key = "pct", labelKey = "y" } = opts;
    const max = Math.max(...data.map((d) => d[key]));
    const barW = (w - pad * 2) / data.length - 4;
    let svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">`;
    data.forEach((d, i) => {
      const x = pad + i * (barW + 4);
      const bh = (d[key] / max) * (h - pad * 2 - 18);
      const yPos = h - pad - bh - 18;
      svg += `<rect x="${x}" y="${yPos}" width="${barW}" height="${bh}" fill="url(#barG)" rx="3"/>`;
      svg += `<text x="${x + barW / 2}" y="${h - pad - 4}" text-anchor="middle" fill="#8780b8" font-size="9">${d[labelKey]}y</text>`;
      svg += `<text x="${x + barW / 2}" y="${yPos - 3}" text-anchor="middle" fill="#fff" font-size="10" font-family="Russo One">${d[key]}%</text>`;
    });
    svg += `<defs><linearGradient id="barG" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#ff4a2b"/><stop offset="100%" stop-color="#d92cb0"/></linearGradient></defs>`;
    svg += `</svg>`;
    return svg;
  };

  // Generic slider-input wiring. Updates a label and a percentage-of-width display.
  window.bindSlider = function (sliderEl, onChange) {
    const update = () => {
      const min = +sliderEl.min || 0;
      const max = +sliderEl.max || 100;
      const pct = ((+sliderEl.value - min) / (max - min)) * 100;
      sliderEl.style.setProperty("--prog", pct + "%");
      if (onChange) onChange(+sliderEl.value);
    };
    sliderEl.addEventListener("input", update);
    update();
  };
})();
