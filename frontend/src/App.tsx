
import { useState } from "react";
import "./App.css";

type Market = {
  id: string;
  distance_km: number;
  price_min: number;
  price_modal: number;
  price_max: number;
  fee_pct: number;
  commission_pct: number;
  handling_per_qtl: number;
  max_qty_qtl?: number;
};

type MarketResult = {
  market_id: string;
  low: {
    revenue: number;
    transport: number;
    fees: number;
    handling: number;
    net: number;
    per_qtl: number;
    unsold_qtl: number;
  };
  mid: {
    revenue: number;
    transport: number;
    fees: number;
    handling: number;
    net: number;
    per_qtl: number;
    unsold_qtl: number;
  };
  high: {
    revenue: number;
    transport: number;
    fees: number;
    handling: number;
    net: number;
    per_qtl: number;
    unsold_qtl: number;
  };
};

const sampleMarkets: Market[] = [
  {
    id: "Nearby Market",
    distance_km: 20,
    price_min: 1700,
    price_modal: 1900,
    price_max: 2100,
    fee_pct: 1,
    commission_pct: 2,
    handling_per_qtl: 5,
  },
  {
    id: "Regional Market",
    distance_km: 55,
    price_min: 1750,
    price_modal: 1950,
    price_max: 2150,
    fee_pct: 1,
    commission_pct: 1,
    handling_per_qtl: 5,
  },
  {
    id: "Distant Market",
    distance_km: 120,
    price_min: 1800,
    price_modal: 2000,
    price_max: 2200,
    fee_pct: 1,
    commission_pct: 2,
    handling_per_qtl: 5,
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function App() {
  const [crop, setCrop] = useState("tomato");
  const [quantity, setQuantity] = useState("40");
  const [grade, setGrade] = useState("A");
  const [capacity, setCapacity] = useState("20");
  const [transportRate, setTransportRate] = useState("12");
  const [results, setResults] = useState<MarketResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function compareMarkets() {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch("http://127.0.0.1:8000/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          qty_qtl: Number(quantity),
          grade,
          vehicle_capacity_qtl: Number(capacity),
          rate_per_km: Number(transportRate),
          markets: sampleMarkets,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`API error (${response.status}): ${detail}`);
      }

      const data: { results: MarketResult[] } = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">F</span>
          <span>Fair<span className="brand-light">Farm</span></span>
        </a>
        <span className="topbar-note">Better decisions. Fairer returns.</span>
      </header>

      <main className="dashboard">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">YOUR HARVEST, YOUR CHOICE</span>
            <h1>Find the market that<br />works best for you.</h1>
            <p>
              Compare estimated earnings after transport and market costs
              before deciding where to sell your harvest.
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="sun" />
            <span className="field field-one" />
            <span className="field field-two" />
            <span className="field field-three" />
            <span className="plant">🌱</span>
          </div>
        </section>

        <section className="content-grid">
          <aside className="input-card">
            <div className="section-heading">
              <span className="step-number">01</span>
              <div>
                <h2>Your harvest</h2>
                <p>Tell us what you're selling.</p>
              </div>
            </div>

            <label htmlFor="crop">Crop type</label>
            <select id="crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="tomato">Tomato</option>
              <option value="onion">Onion</option>
              <option value="wheat">Wheat</option>
            </select>

            <label htmlFor="quantity">Quantity (quintals)</label>
            <input
              id="quantity"
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <label htmlFor="grade">Crop quality grade</label>
            <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="A">Grade A — Premium</option>
              <option value="B">Grade B — Good</option>
              <option value="C">Grade C — Standard</option>
            </select>

            <div className="form-divider" />

            <div className="section-heading compact">
              <span className="step-number">02</span>
              <div>
                <h2>Transport details</h2>
                <p>Estimate your travel costs.</p>
              </div>
            </div>

            <label htmlFor="capacity">Vehicle capacity (quintals)</label>
            <input
              id="capacity"
              type="number"
              min="0.1"
              step="0.1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />

            <label htmlFor="rate">Transport rate (₹ per km)</label>
            <input
              id="rate"
              type="number"
              min="0"
              step="0.5"
              value={transportRate}
              onChange={(e) => setTransportRate(e.target.value)}
            />

            <button
              className="compare-button"
              onClick={compareMarkets}
              disabled={loading}
            >
              {loading ? "Comparing markets..." : "Compare markets"}
              {!loading && <span aria-hidden="true"> →</span>}
            </button>

            {error && <p className="error-message">{error}</p>}
          </aside>

          <section className="results-section">
            <div className="results-title">
              <div>
                <span className="eyebrow">YOUR MARKET REPORT</span>
                <h2>Where should you sell?</h2>
              </div>
              <span className="demo-badge">DEMO DATA</span>
            </div>

            {!results.length && !loading && !error && (
              <div className="empty-state">
                <span className="empty-icon">₹</span>
                <h3>Your comparison starts here</h3>
                <p>
                  Enter your harvest details, then select “Compare markets”
                  to see estimated returns for three example markets.
                </p>
              </div>
            )}

            {loading && (
              <div className="empty-state">
                <h3>Calculating your estimated returns...</h3>
                <p>Comparing prices, transport and market costs.</p>
              </div>
            )}

            {results.map((result, index) => (
              <article className={`market-card ${index === 0 ? "best-market" : ""}`} key={result.market_id}>
                <div className="market-topline">
                  <div>
                    {index === 0 && <span className="best-label">BEST ESTIMATED RETURN</span>}
                    <h3>{result.market_id}</h3>
                  </div>
                  <div className="market-distance">
                    <span>Estimated net at low price</span>
                    <strong>{money(result.low.net)}</strong>
                  </div>
                </div>

                <div className="net-highlight">
                  <div>
                    <span>Estimated net at modal price</span>
                    <strong>{money(result.mid.net)}</strong>
                  </div>
                  <div className="per-quintal">
                    <span>Net per quintal</span>
                    <strong>{money(result.mid.per_qtl)}</strong>
                  </div>
                </div>

                <div className="cost-breakdown">
                  <div><span>Gross revenue</span><strong>{money(result.mid.revenue)}</strong></div>
                  <div><span>Transport</span><strong>− {money(result.mid.transport)}</strong></div>
                  <div><span>Fees & commission</span><strong>− {money(result.mid.fees)}</strong></div>
                  <div><span>Handling</span><strong>− {money(result.mid.handling)}</strong></div>
                </div>

                {result.mid.unsold_qtl > 0 && (
                  <p className="unsold-note">
                    Note: {result.mid.unsold_qtl.toFixed(1)} quintals may remain unsold at this market's quantity limit.
                  </p>
                )}

                <p className="range-note">
                  Estimated net range: {money(result.low.net)} – {money(result.high.net)}
                </p>
              </article>
            ))}

            <p className="disclaimer">
              <strong>Important:</strong> Market prices and costs on this prototype
              are illustrative, not live offers. Actual returns can vary by location,
              quality, buyer, and day. Confirm rates before travelling.
            </p>
          </section>
        </section>

        <footer className="footer">
          <span>FairFarm · Supporting informed farm-gate decisions</span>
          <span>Built for the SEVA First Innovation Challenge</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
