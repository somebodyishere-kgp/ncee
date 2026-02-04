import React, { useState } from 'react';
import Tooltip from './Tooltip';

export const ForecastChart = ({
    historicalData = [],
    forecastData = [],
    height = 350,
    width = 900
}) => {
    const [hoverData, setHoverData] = useState(null);

    const allData = [...historicalData, ...forecastData];
    if (allData.length === 0) return null;

    // Calculate bounds
    const allPrices = [
        ...historicalData.map(d => parseFloat(d.price)),
        ...forecastData.map(d => parseFloat(d.predicted)),
        ...forecastData.map(d => parseFloat(d.upper)),
        ...forecastData.map(d => parseFloat(d.lower))
    ];
    const minPrice = Math.min(...allPrices) * 0.95;
    const maxPrice = Math.max(...allPrices) * 1.05;
    const range = maxPrice - minPrice || 1;

    const padding = { top: 30, right: 40, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const getX = (index) => padding.left + (index / (allData.length - 1)) * chartWidth;
    const getY = (price) => padding.top + chartHeight - ((price - minPrice) / range) * chartHeight;

    // Generate historical line points
    const historicalPoints = historicalData.map((d, i) =>
        `${getX(i)},${getY(parseFloat(d.price))}`
    ).join(' ');

    // Generate forecast line points
    const forecastStartIndex = historicalData.length - 1;
    const forecastPoints = forecastData.map((d, i) =>
        `${getX(forecastStartIndex + i + 1)},${getY(parseFloat(d.predicted))}`
    ).join(' ');

    // Connect historical to forecast
    const connectionPoint = historicalData.length > 0
        ? `${getX(forecastStartIndex)},${getY(parseFloat(historicalData[historicalData.length - 1].price))}`
        : '';

    // Generate confidence band path
    const upperBandPoints = forecastData.map((d, i) =>
        `${getX(forecastStartIndex + i + 1)},${getY(parseFloat(d.upper))}`
    );
    const lowerBandPoints = forecastData.map((d, i) =>
        `${getX(forecastStartIndex + i + 1)},${getY(parseFloat(d.lower))}`
    ).reverse();

    const bandPath = upperBandPoints.length > 0
        ? `M ${upperBandPoints.join(' L ')} L ${lowerBandPoints.join(' L ')} Z`
        : '';

    // Y-axis labels
    const yLabels = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
        const value = minPrice + (range * i / steps);
        yLabels.push({ value: value.toFixed(2), y: getY(value) });
    }

    return (
        <div className="forecast-chart-wrapper" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="forecast-chart-svg">
                <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4CAF50" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#FFD700" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2196F3" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#2196F3" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {yLabels.map((label, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            y1={label.y}
                            x2={width - padding.right}
                            y2={label.y}
                            stroke="rgba(255,255,255,0.1)"
                            strokeDasharray="4,4"
                        />
                        <text
                            x={padding.left - 10}
                            y={label.y + 4}
                            fill="rgba(255,255,255,0.6)"
                            fontSize="11"
                            textAnchor="end"
                        >
                            ₹{label.value}
                        </text>
                    </g>
                ))}

                {/* Forecast divider line */}
                {historicalData.length > 0 && forecastData.length > 0 && (
                    <line
                        x1={getX(forecastStartIndex)}
                        y1={padding.top}
                        x2={getX(forecastStartIndex)}
                        y2={height - padding.bottom}
                        stroke="rgba(255, 215, 0, 0.5)"
                        strokeDasharray="6,4"
                        strokeWidth="1"
                    />
                )}

                {/* Confidence band */}
                {bandPath && (
                    <path
                        d={bandPath}
                        fill="url(#confidenceGradient)"
                        className="confidence-band"
                    />
                )}

                {/* Historical area fill */}
                {historicalPoints && (
                    <path
                        d={`M ${padding.left},${height - padding.bottom} L ${historicalPoints} L ${getX(historicalData.length - 1)},${height - padding.bottom} Z`}
                        fill="url(#historicalGradient)"
                    />
                )}

                {/* Historical line */}
                <polyline
                    fill="none"
                    stroke="#2196F3"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={historicalPoints}
                />

                {/* Forecast line */}
                {forecastPoints && (
                    <polyline
                        fill="none"
                        stroke="#4CAF50"
                        strokeWidth="3"
                        strokeDasharray="8,4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={connectionPoint + ' ' + forecastPoints}
                    />
                )}

                {/* Historical data points */}
                {historicalData.map((d, i) => (
                    <circle
                        key={`hist-${i}`}
                        cx={getX(i)}
                        cy={getY(parseFloat(d.price))}
                        r={hoverData?.index === i && !hoverData?.isForecast ? "7" : "4"}
                        fill="#2196F3"
                        style={{ transition: 'r 0.2s', cursor: 'pointer' }}
                        onMouseEnter={(e) => setHoverData({
                            index: i,
                            isForecast: false,
                            label: d.date,
                            value: `₹ ${d.price}`,
                            sublabel: 'Actual Price',
                            x: e.clientX,
                            y: e.clientY
                        })}
                        onMouseMove={(e) => setHoverData(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                        onMouseLeave={() => setHoverData(null)}
                    />
                ))}

                {/* Forecast data points */}
                {forecastData.map((d, i) => (
                    <circle
                        key={`fore-${i}`}
                        cx={getX(forecastStartIndex + i + 1)}
                        cy={getY(parseFloat(d.predicted))}
                        r={hoverData?.index === i && hoverData?.isForecast ? "7" : "4"}
                        fill="#4CAF50"
                        style={{ transition: 'r 0.2s', cursor: 'pointer' }}
                        onMouseEnter={(e) => setHoverData({
                            index: i,
                            isForecast: true,
                            label: d.date,
                            value: `₹ ${d.predicted}`,
                            sublabel: `Range: ₹${d.lower} - ₹${d.upper}`,
                            x: e.clientX,
                            y: e.clientY
                        })}
                        onMouseMove={(e) => setHoverData(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                        onMouseLeave={() => setHoverData(null)}
                    />
                ))}

                {/* X-axis labels */}
                <text
                    x={padding.left}
                    y={height - 15}
                    fill="rgba(255,255,255,0.6)"
                    fontSize="10"
                >
                    {allData[0]?.date}
                </text>
                <text
                    x={width - padding.right}
                    y={height - 15}
                    fill="rgba(255,255,255,0.6)"
                    fontSize="10"
                    textAnchor="end"
                >
                    {allData[allData.length - 1]?.date}
                </text>

                {/* Legend */}
                <g transform={`translate(${padding.left + 20}, ${padding.top + 10})`}>
                    <rect x="0" y="0" width="12" height="12" fill="#2196F3" rx="2" />
                    <text x="18" y="10" fill="white" fontSize="11">Historical</text>
                    <rect x="80" y="0" width="12" height="12" fill="#4CAF50" rx="2" />
                    <text x="98" y="10" fill="white" fontSize="11">Forecast</text>
                    <rect x="160" y="0" width="12" height="12" fill="rgba(255,215,0,0.3)" rx="2" />
                    <text x="178" y="10" fill="white" fontSize="11">Confidence Band</text>
                </g>
            </svg>

            {hoverData && (
                <div
                    className="forecast-tooltip"
                    style={{
                        position: 'fixed',
                        left: hoverData.x + 15,
                        top: hoverData.y - 50,
                        background: 'rgba(13, 17, 55, 0.95)',
                        border: `2px solid ${hoverData.isForecast ? '#4CAF50' : '#2196F3'}`,
                        borderRadius: '12px',
                        padding: '12px 16px',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                    }}
                >
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginBottom: '4px' }}>
                        {hoverData.label}
                    </div>
                    <div style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>
                        {hoverData.value}
                    </div>
                    {hoverData.sublabel && (
                        <div style={{ color: hoverData.isForecast ? '#4CAF50' : '#2196F3', fontSize: '11px', marginTop: '4px' }}>
                            {hoverData.sublabel}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ForecastChart;
