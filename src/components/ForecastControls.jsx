import React from 'react';

export const ForecastControls = ({
    forecastDays,
    setForecastDays,
    selectedCity,
    setSelectedCity,
    cities = [],
    metrics = {},
    model = 'linear',
    setModel = () => { }
}) => {
    const horizonOptions = [
        { days: 7, label: '1 Week' },
        { days: 14, label: '2 Weeks' },
        { days: 30, label: '1 Month' },
        { days: 90, label: '3 Months' }
    ];

    const trendColors = {
        rising: '#4CAF50',
        falling: '#F44336',
        stable: '#FFD700'
    };

    const trendIcons = {
        rising: '📈',
        falling: '📉',
        stable: '➡️'
    };

    return (
        <div className="forecast-controls">
            <div className="controls-row">
                <div className="control-group">
                    <label>Forecast Horizon</label>
                    <div className="horizon-buttons">
                        {horizonOptions.map(opt => (
                            <button
                                key={opt.days}
                                className={`horizon-btn ${forecastDays === opt.days ? 'active' : ''}`}
                                onClick={() => setForecastDays(opt.days)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <label>Production Center</label>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="city-select"
                    >
                        <option value="all">All Cities (Average)</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label>Prediction Model</label>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="city-select model-select"
                        style={{ minWidth: '180px' }}
                    >
                        <option value="linear">Linear Regression (Standard)</option>
                        <option value="poly">Polynomial Regression (Curved)</option>
                        <option value="seasonal">Seasonal Decomposition</option>
                        <option value="wma">Weighted Moving Avg</option>
                        <option value="ets">Exponential Smoothing (ETS)</option>
                    </select>
                </div>
            </div>

            {Object.keys(metrics).length > 0 && (
                <div className="forecast-metrics">
                    <div className="metric-card trend-card">
                        <span className="metric-icon">{trendIcons[metrics.trend] || '📊'}</span>
                        <div className="metric-content">
                            <span className="metric-label">Price Trend</span>
                            <span
                                className="metric-value"
                                style={{ color: trendColors[metrics.trend] }}
                            >
                                {metrics.trend?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="metric-card">
                        <span className="metric-icon">📊</span>
                        <div className="metric-content">
                            <span className="metric-label">Model Confidence</span>
                            <span className="metric-value">{metrics.confidence}%</span>
                        </div>
                    </div>

                    <div className="metric-card">
                        <span className="metric-icon">⚡</span>
                        <div className="metric-content">
                            <span className="metric-label">Volatility</span>
                            <span className="metric-value">{metrics.volatility}%</span>
                        </div>
                    </div>

                    <div className="metric-card">
                        <span className="metric-icon">🎯</span>
                        <div className="metric-content">
                            <span className="metric-label">Predicted (Next Week)</span>
                            <span className="metric-value">₹{metrics.predictedNextWeek}</span>
                        </div>
                    </div>

                    <div className="metric-card">
                        <span className="metric-icon">📅</span>
                        <div className="metric-content">
                            <span className="metric-label">Predicted (Next Month)</span>
                            <span className="metric-value">₹{metrics.predictedNextMonth}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForecastControls;
