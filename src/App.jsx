import React, { useState, useEffect } from 'react';
import './App.css';
import {
  stats2025,
  productionTrend,
  stateProduction,
  speciesDistribution,
  cityPrices,
  generatePriceTrend
} from './data/mockData';
import { TrendLine, PieChart, BarChart } from './components/Charts';
import { SelectionBar } from './components/Filters';

function App() {
  const [mode, setMode] = useState('daily'); // 'daily' or 'trend'
  const [sheetType, setSheetType] = useState('daily'); // 'daily' or 'monthly'
  const [selectedDate, setSelectedDate] = useState('2026-01-28');
  const [range, setRange] = useState({ start: '2026-01-01', end: '2026-01-28' });
  const [currentTrend, setCurrentTrend] = useState([]);
  const [livePrices, setLivePrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter prices based on search
  const filteredPrices = livePrices.filter(p =>
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch real-time data from our local API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dateObj = new Date(selectedDate);
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = String(dateObj.getFullYear());
        const type = sheetType === 'monthly' ? 'Monthly Avg. Sheet' : 'Daily Rate Sheet';

        const response = await fetch(`http://localhost:3001/api/egg-prices?month=${month}&year=${year}&type=${encodeURIComponent(type)}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setLivePrices(data.map(d => ({
            city: d.city,
            price: d.price,
            avg: d.avg,
            tray30: d.price * 30,
            box180: d.price * 180
          })));
        }
      } catch (err) {
        console.error("Failed to fetch live data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, sheetType]);

  // Fetch historical trend data for trend mode
  useEffect(() => {
    const fetchTrendData = async () => {
      if (mode !== 'trend') return;

      setTrendLoading(true);
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      const trendData = [];

      // Fetch monthly averages for the range
      try {
        for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = String(d.getFullYear());

          const response = await fetch(`http://localhost:3001/api/egg-prices?month=${month}&year=${year}&type=${encodeURIComponent('Monthly Avg. Sheet')}`);
          const data = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            // Calculate average price across all cities
            const avgPrice = data.reduce((sum, city) => sum + city.avg, 0) / data.length;
            trendData.push({
              date: `${year}-${month}`,
              price: avgPrice.toFixed(2)
            });
          }
        }
        setCurrentTrend(trendData);
      } catch (err) {
        console.error("Failed to fetch trend data:", err);
        setCurrentTrend(generatePriceTrend(range.start, range.end));
      } finally {
        setTrendLoading(false);
      }
    };

    fetchTrendData();
  }, [range, mode]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="main-header animate-in">
        <div className="logo">
          <span className="logo-icon">🥚</span>
          <span className="logo-text">NECC <span className="highlight">EGGPRICE</span></span>
        </div>
        <nav>
          <a href="#stats">Statistics</a>
          <a href="#insights">Insights</a>
          <a href="#prices">Live Prices</a>
          <button className="cta-btn">2009-2026 Data</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section section-container">
        <div className="hero-content animate-in">
          <h1 className="floating">Revolutionizing <span className="gradient-text">Poultry Insights</span></h1>
          <p className="hero-subtitle">Providing transparent, data-driven decision making for the Indian poultry sector since 1982.</p>

          <div className="hero-stats">
            <div className="stat-card glass-card">
              <span className="stat-value">{stats2025.totalProduction} B</span>
              <span className="stat-label">Total Production (24-25)</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-value">{stats2025.globalRank}</span>
              <span className="stat-label">Global Rank (FAO)</span>
            </div>
            <div className="stat-card glass-card">
              <span className="stat-value">{stats2025.perCapita}</span>
              <span className="stat-label">Per Capita Availability</span>
            </div>
          </div>
        </div>
      </section>

      {/* Selection Section */}
      <section className="selection-section section-container" id="stats">
        <h2 className="section-title">Market Intelligence</h2>
        <SelectionBar
          mode={mode}
          setMode={setMode}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          range={range}
          onRangeChange={setRange}
        />

        <div className="visual-grid animate-in">
          {mode === 'daily' ? (
            <>
              <div className="visual-card glass-card">
                <h3>State-wise Contribution</h3>
                <div className="pie-container">
                  <PieChart data={stateProduction} />
                  <div className="legend">
                    {stateProduction.slice(0, 5).map(s => (
                      <div key={s.name} className="legend-item">
                        <span className="dot" style={{ backgroundColor: s.color }}></span>
                        <span>{s.name} ({s.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="visual-card glass-card">
                <h3>Production Growth (Billion No.)</h3>
                <BarChart data={productionTrend} />
              </div>
            </>
          ) : (
            <div className="visual-card glass-card span-2">
              <h3>Price Trend Timeline (₹ per Egg) {trendLoading && <span className="loader-small">⚡ Loading historical data...</span>}</h3>
              <div className="trend-container">
                {trendLoading ? (
                  <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-dim)' }}>
                    Fetching monthly averages from NECC...
                  </div>
                ) : (
                  <TrendLine data={currentTrend} color="var(--primary)" width={800} height={300} />
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Price Board */}
      <section className="price-section section-container" id="prices">
        <div className="price-header">
          <h2 className="section-title">
            {sheetType === 'monthly' ? 'Monthly Average Prices' : 'Daily Suggested Prices'}
            {loading && <span className="loader-small">⚡ Fetching...</span>}
          </h2>
          <div className="sheet-toggle">
            <button
              className={`toggle-btn ${sheetType === 'daily' ? 'active' : ''}`}
              onClick={() => setSheetType('daily')}
            >
              📅 Daily
            </button>
            <button
              className={`toggle-btn ${sheetType === 'monthly' ? 'active' : ''}`}
              onClick={() => setSheetType('monthly')}
            >
              📊 Monthly Avg
            </button>
          </div>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="result-count">{filteredPrices.length} cities</span>
        </div>
        <div className="price-table-container glass-panel animate-in">
          <table className="price-table">
            <thead>
              <tr>
                <th>Production Center</th>
                <th>{sheetType === 'monthly' ? 'Monthly Avg (1 Pc)' : 'Price (1 Pc)'}</th>
                <th>Tray (30 Pc)</th>
                <th>Box (180 Pc)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>⚡ Loading live data from NECC...</td></tr>
              ) : filteredPrices.length > 0 ? (
                filteredPrices.map(p => (
                  <tr key={p.city}>
                    <td>{p.city}</td>
                    <td className="price-primary">₹ {p.price.toFixed(2)}</td>
                    <td>₹ {p.tray30.toFixed(2)}</td>
                    <td>₹ {p.box180.toFixed(0)}</td>
                    <td><span className={`tag-${sheetType === 'monthly' ? 'monthly' : 'up'}`}>● {sheetType === 'monthly' ? 'Avg' : 'Live'}</span></td>
                  </tr>
                ))
              ) : livePrices.length > 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No cities match "{searchQuery}"</td></tr>
              ) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Select a date to fetch live prices</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Species Distribution */}
      <section className="insights-section section-container" id="insights">
        <div className="split-view">
          <div className="insight-text">
            <h2>Species-wise Contribution</h2>
            <p>A detailed breakdown of egg production across various fowl and duck species in the 2024-25 fiscal year.</p>
            <div className="species-list">
              {speciesDistribution.map(s => (
                <div key={s.name} className="species-item">
                  <span className="s-name">{s.name}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${s.percentage}%` }}></div>
                  </div>
                  <span className="s-val">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="insight-visual floating">
            <div className="egg-3d">🥚</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer section-container">
        <p className="disclaimer">
          <strong>Disclaimer:</strong> The daily egg prices suggested by NECC are merely suggestive and not mandatory.
          They are published solely for the reference and information of the trade and industry.
        </p>
        <div className="footer-bottom">
          <span>&copy; 2026 NECC Dashboard. Live data from e2necc.com.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
