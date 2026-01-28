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
  const [selectedDate, setSelectedDate] = useState('2026-01-28');
  const [range, setRange] = useState({ start: '2026-01-01', end: '2026-01-28' });
  const [currentTrend, setCurrentTrend] = useState([]);

  useEffect(() => {
    setCurrentTrend(generatePriceTrend(range.start, range.end));
  }, [range]);

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
              <h3>Price Trend Timeline (₹ per Egg)</h3>
              <div className="trend-container">
                <TrendLine data={currentTrend} color="var(--primary)" width={800} height={300} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Price Board */}
      <section className="price-section section-container" id="prices">
        <h2 className="section-title">Regional Suggested Prices</h2>
        <div className="price-table-container glass-panel animate-in">
          <table className="price-table">
            <thead>
              <tr>
                <th>Production Center</th>
                <th>Price (1 Pc)</th>
                <th>Tray (30 Pc)</th>
                <th>Box (180 Pc)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cityPrices.map(p => (
                <tr key={p.city}>
                  <td>{p.city}</td>
                  <td className="price-primary">₹ {p.price.toFixed(2)}</td>
                  <td>₹ {p.tray30.toFixed(2)}</td>
                  <td>₹ {p.box180.toFixed(0)}</td>
                  <td><span className="tag-up">↑ Stable</span></td>
                </tr>
              ))}
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
          <span>&copy; 2026 NECC Dashboard. Data inspired by e2necc.com.</span>
          <div className="socials">
            <span>Twitter</span>
            <span>LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
