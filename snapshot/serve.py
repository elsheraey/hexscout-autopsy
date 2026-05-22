#!/usr/bin/env python3
"""
HEXscout static-snapshot server.

The bundled JS expects live upstreams (CoinGecko, Pulsefusion subgraphs,
HEXDailyStats, GeckoTerminal, DexScreener, WalletConnect, cardiorta.vercel.app,
PulseChain RPC). Those are all retired or unreachable here, and HEXscout's
pages are entirely client-rendered (empty `<div id="__next"></div>` in HTML),
so without help the JS crashes on init and the boot overlay never lifts.

This server injects a small "no-network" shim into every HTML response:
  - stubs `window.fetch` and `XMLHttpRequest` to return safe empty JSON
  - silences uncaught errors and unhandledrejection
  - force-hides the `#CLSoverlay` boot screen after a short delay

It also rewrites clean URLs the same way `next start` did (so /portfolio
maps to portfolio.html automatically).

Usage:
    python3 serve.py           # http://localhost:8080
    PORT=3000 python3 serve.py
"""
import http.server
import os
import re
import socketserver
from urllib.parse import unquote

PORT = int(os.environ.get("PORT", "8080"))
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

# Inline shim — runs BEFORE any Next.js bundle. Sized to fit one <script> tag.
SHIM = r"""<script>(function(){
window.__SNAPSHOT__ = true;

// --- Defensive patches: keep the React tree alive even when data is missing ---
var origValues = Object.values;
Object.values = function(o){ if(o==null) return []; try{ return origValues(o); }catch(_){ return []; } };
var origKeys = Object.keys;
Object.keys = function(o){ if(o==null) return []; try{ return origKeys(o); }catch(_){ return []; } };
var origEntries = Object.entries;
Object.entries = function(o){ if(o==null) return []; try{ return origEntries(o); }catch(_){ return []; } };
// Give every object a default empty `tokens` array via the prototype, so
// `chain.tokens.find(...)` returns undefined instead of throwing when tokens
// hasn't been set. Real assignments win because of the setter.
try {
 Object.defineProperty(Object.prototype, 'tokens', {
  configurable: true, enumerable: false,
  get: function(){ return this.__tokens__ || []; },
  set: function(v){ Object.defineProperty(this, '__tokens__', {value: v, writable: true, configurable: true, enumerable: false}); }
 });
} catch(_){}

// --- Realistic fake responses ---
function fakeWallet(id, name, primary){
 return {id:id, name:name, homepage:"", image_id:"", image_url:{sm:"",md:"",lg:""},
  app:{browser:"",ios:"",android:"",mac:"",windows:"",linux:"",chrome:"",firefox:"",safari:"",edge:"",opera:""},
  mobile:{native:"",universal:""}, desktop:{native:"",universal:""},
  supported_standards:[], metadata:{shortName:name, colors:{primary:primary||"#fff", secondary:""}},
  updatedAt:"2024-01-01T00:00:00.000Z", chains:["eip155:1","eip155:369"]};
}
var WC_WALLETS = {
 "metamask": fakeWallet("metamask","MetaMask","#f6851b"),
 "coinbase": fakeWallet("coinbase","Coinbase Wallet","#1652f0"),
 "rainbow":  fakeWallet("rainbow","Rainbow","#001e59"),
 "trust":    fakeWallet("trust","Trust Wallet","#3375bb")
};

function stubBody(url){
 try{
  if(/explorer-api\.walletconnect|walletconnect/.test(url))
   return JSON.stringify({listings:WC_WALLETS, count:4, total:4, recommended:WC_WALLETS});
  if(/coingecko/.test(url)) return '{"prices":[],"market_caps":[],"total_volumes":[],"id":"hex","symbol":"hex","name":"HEX","market_data":{"current_price":{"usd":0.01},"market_cap":{"usd":0},"total_volume":{"usd":0}}}';
  if(/dexscreener/.test(url)) return '{"pairs":[],"pair":null,"schemaVersion":"1.0.0"}';
  if(/geckoterminal/.test(url)) return '{"data":{"id":"hex","attributes":{"token_prices":{}}}}';
  if(/pulsefusion|thegraph/.test(url)) return '{"data":{"stakes":[],"stakeStarts":[],"stakeEnds":[],"globalInfo":{"shareRate":"100000","lockedHeartsTotal":"0","latestStakeId":"0","stakePenaltyTotal":"0","stakeSharesTotal":"0","totalHeartsClaimed":"0"},"hsiStarts":[],"hsiEnds":[],"tokens":[]}}';
  if(/hexstats|hexdailystats/.test(url)) return '[]';
  if(/cardiorta/.test(url)) return '{"isOA":false,"data":null}';
  if(/rpc\.pulsechain|alchemy|infura|publicnode/.test(url)) return '{"jsonrpc":"2.0","id":1,"result":"0x0"}';
  if(/api\.dexscreener/.test(url)) return '{"pairs":[]}';
 }catch(e){}
 return '{}';
}

// --- Stub fetch + XHR ---
window.fetch = function(input, init){
 var url = (typeof input === 'string') ? input : (input && input.url) || '';
 return Promise.resolve(new Response(stubBody(url), {status:200, headers:{'Content-Type':'application/json'}}));
};
var OrigXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function(){
 var x = new OrigXHR(); var stubUrl = ''; var origOpen = x.open;
 x.open = function(m, u){ stubUrl = u || ''; origOpen.call(x, 'GET', 'data:application/json,'+encodeURIComponent(stubBody(stubUrl))); };
 return x;
};

// --- Silence errors, hide overlay regardless ---
window.addEventListener('error', function(e){ try{ e.stopImmediatePropagation(); e.preventDefault(); }catch(_){} return true; }, true);
window.addEventListener('unhandledrejection', function(e){ try{ e.preventDefault(); }catch(_){} }, true);
var origConsoleError = console.error;
console.error = function(){ try{ origConsoleError.apply(console, arguments); }catch(_){} };

function killOverlay(){
 var o = document.getElementById('CLSoverlay');
 if(o){ o.style.transition='opacity .4s'; o.style.opacity='0'; setTimeout(function(){ o.style.display='none'; }, 400); }
}
document.addEventListener('DOMContentLoaded', function(){
 [400, 800, 1500, 2500, 4000].forEach(function(d){ setTimeout(killOverlay, d); });
});
})();</script>"""


def inject_shim(html: bytes) -> bytes:
    """Insert the shim immediately after <head>, before anything else."""
    text = html.decode("utf-8", errors="replace")
    # Don't double-inject if file is reloaded
    if "__SNAPSHOT__" in text:
        return html
    new = re.sub(r"(<head[^>]*>)", lambda m: m.group(1) + SHIM, text, count=1)
    return new.encode("utf-8")


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        raw_path = self.path.split("?", 1)[0].split("#", 1)[0]
        path = unquote(raw_path)
        fs = self.translate_path(path)
        if os.path.isfile(fs):
            return self._maybe_inject(fs, super().send_head)
        if os.path.isdir(fs):
            idx = os.path.join(fs, "index.html")
            if os.path.isfile(idx):
                return self._maybe_inject(idx, super().send_head)
        if not path.endswith("/") and not os.path.splitext(path)[1]:
            for candidate in (path + ".html", path + "/index.html"):
                cfs = self.translate_path(candidate)
                if os.path.isfile(cfs):
                    self.path = candidate
                    return self._maybe_inject(cfs, super().send_head)
        return super().send_head()

    def _maybe_inject(self, fs_path: str, fallback):
        if not fs_path.endswith(".html"):
            return fallback()
        with open(fs_path, "rb") as f:
            data = f.read()
        injected = inject_shim(data)
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(injected)))
        self.end_headers()
        from io import BytesIO
        return BytesIO(injected)


class ReusableServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


def main():
    with ReusableServer(("", PORT), CleanURLHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"HEXscout snapshot serving at {url}")
        print(f"   Real app  -> {url}/")
        print(f"   Sitemap   -> {url}/sitemap")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print()


if __name__ == "__main__":
    main()
