import MandiMap from "./MandiMap";
import FarmerGuide from "./FarmerGuide";
import { useState } from "react";
import "./App.css";
import { translations, type Language } from "./translations";



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
  const [language, setLanguage] = useState<Language>("en");

  const t = translations[language];

  const [crop, setCrop] = useState("tomato");
  const [quantity, setQuantity] = useState("40");
  const [grade, setGrade] = useState("A");
  const [capacity, setCapacity] = useState("20");
  const [transportRate, setTransportRate] = useState("12");

  const [results, setResults] = useState<MarketResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const marketNames: Record<string, string> = {
    "Nearby Market": translations[language].nearbyMarket,
    "Regional Market": translations[language].regionalMarket,
    "Distant Market": translations[language].distantMarket,
  };

  async function compareMarkets() {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/compare",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop,
            qty_qtl: Number(quantity),
            grade,
            vehicle_capacity_qtl: Number(capacity),
            rate_per_km: Number(transportRate),
            markets: sampleMarkets,
          }),
        }
      );

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(
          `API error (${response.status}): ${detail}`
        );
      }

      const data: { results: MarketResult[] } =
        await response.json();

      setResults(data.results);
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">F</span>
          <span>
            Fair<span className="brand-light">Farm</span>
          </span>
        </a>

        <div className="header-actions">
          <span className="topbar-note">{t.tagline}</span>

          <select
            className="language-select"
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as Language)
            }
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </header>

      <main className="dashboard">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">{t.eyebrow}</span>

            <h1>{t.heroTitle}</h1>

            <p>{t.heroDescription}</p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <span className="sun" />
            <span className="field field-one" />
            <span className="field field-two" />
            <span className="field field-three" />
            <span className="plant">🌱</span>
          </div>
        </section>

        <FarmerGuide language={language} /><MandiMap />
        <section className="content-grid">
          <aside className="input-card">
            <div className="section-heading">
              <span className="step-number">01</span>

              <div>
                <h2>{t.harvest}</h2>
                <p>{t.harvestDescription}</p>
              </div>
            </div>

            <label htmlFor="crop">{t.crop}</label>

            <select
              id="crop"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
            >
              <option value="tomato">{t.tomato}</option>
              <option value="onion">{t.onion}</option>
              <option value="wheat">{t.wheat}</option>
            </select>

            <label htmlFor="quantity">{t.quantity}</label>

            <input
              id="quantity"
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <label htmlFor="grade">{t.grade}</label>

            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="A">{t.gradeA}</option>
              <option value="B">{t.gradeB}</option>
              <option value="C">{t.gradeC}</option>
            </select>

            <div className="form-divider" />

            <div className="section-heading compact">
              <span className="step-number">02</span>

              <div>
                <h2>{t.transport}</h2>
                <p>{t.transportDescription}</p>
              </div>
            </div>

            <label htmlFor="capacity">{t.capacity}</label>

            <input
              id="capacity"
              type="number"
              min="0.1"
              step="0.1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />

            <label htmlFor="rate">{t.rate}</label>

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
              {loading ? t.comparing : t.compare}
              {!loading && <span aria-hidden="true"> →</span>}
            </button>

            {error && (
              <p className="error-message">{error}</p>
            )}
          </aside>

          <section className="results-section">
            <div className="results-title">
              <div>
                <span className="eyebrow">{t.report}</span>
                <h2>{t.whereToSell}</h2>
              </div>

              <span className="demo-badge">{t.demo}</span>
            </div>

            {!results.length && !loading && !error && (
              <div className="empty-state">
                <span className="empty-icon">₹</span>

                <h3>{t.start}</h3>

                <p>{t.startDescription}</p>
              </div>
            )}

            {loading && (
              <div className="empty-state">
                <h3>{t.calculating}</h3>
                <p>{t.calculatingDescription}</p>
              </div>
            )}

            {results.map((result, index) => (
              <article
                className={`market-card ${
                  index === 0 ? "best-market" : ""
                }`}
                key={result.market_id}
              >
                <div className="market-topline">
                  <div>
                    {index === 0 && (
                      <span className="best-label">
                        {t.best}
                      </span>
                    )}

                    <h3>
                      {marketNames[result.market_id] ??
                        result.market_id}
                    </h3>
                  </div>

                  <div className="market-distance">
                    <span>{t.lowPrice}</span>
                    <strong>{money(result.low.net)}</strong>
                  </div>
                </div>

                <div className="net-highlight">
                  <div>
                    <span>{t.modalPrice}</span>
                    <strong>{money(result.mid.net)}</strong>
                  </div>

                  <div className="per-quintal">
                    <span>{t.perQuintal}</span>
                    <strong>{money(result.mid.per_qtl)}</strong>
                  </div>
                </div>

                <div className="cost-breakdown">
                  <div>
                    <span>{t.revenue}</span>
                    <strong>{money(result.mid.revenue)}</strong>
                  </div>

                  <div>
                    <span>{t.transportCost}</span>
                    <strong>− {money(result.mid.transport)}</strong>
                  </div>

                  <div>
                    <span>{t.fees}</span>
                    <strong>− {money(result.mid.fees)}</strong>
                  </div>

                  <div>
                    <span>{t.handling}</span>
                    <strong>− {money(result.mid.handling)}</strong>
                  </div>
                </div>

                {result.mid.unsold_qtl > 0 && (
                  <p className="unsold-note">
                    {result.mid.unsold_qtl.toFixed(1)} {t.unsold}
                  </p>
                )}

                <p className="range-note">
                  {t.range}: {money(result.low.net)} –{" "}
                  {money(result.high.net)}
                </p>
              </article>
            ))}

            <p className="disclaimer">
              <strong>{t.important}</strong> {t.disclaimer}
            </p>
          </section>
        </section>

        <footer className="footer">
          <span>{t.footer}</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
