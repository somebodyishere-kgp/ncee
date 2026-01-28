import React, { useState } from 'react';
import Tooltip from './Tooltip';

export const TrendLine = ({ data, color = "#FFD700", height = 200, width = 600 }) => {
    const [hoverData, setHoverData] = useState(null);

    if (!data || data.length === 0) return null;

    const minPrice = Math.min(...data.map(d => parseFloat(d.price)));
    const maxPrice = Math.max(...data.map(d => parseFloat(d.price)));
    const range = maxPrice - minPrice || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((parseFloat(d.price) - minPrice) / range) * (height - 40) - 20;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={`M 0,${height} ${points.split(' ').map((p, i) => (i === 0 ? 'L ' + p : 'L ' + p)).join(' ')} L ${width},${height} Z`}
                    fill="url(#chartGradient)"
                />
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
                {data.map((d, i) => (
                    <circle
                        key={i}
                        cx={(i / (data.length - 1)) * width}
                        cy={height - ((parseFloat(d.price) - minPrice) / range) * (height - 40) - 20}
                        r={hoverData?.index === i ? "8" : "4"}
                        fill={color}
                        style={{ transition: 'r 0.2s', cursor: 'pointer' }}
                        onMouseEnter={(e) => setHoverData({
                            index: i,
                            label: d.date,
                            value: `₹ ${d.price}`,
                            x: e.clientX,
                            y: e.clientY
                        })}
                        onMouseMove={(e) => setHoverData(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                        onMouseLeave={() => setHoverData(null)}
                    />
                ))}
            </svg>
            {hoverData && <Tooltip active={true} payload={hoverData} x={hoverData.x} y={hoverData.y} />}
        </div>
    );
};

export const PieChart = ({ data, size = 200 }) => {
    const [hoverData, setHoverData] = useState(null);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <svg viewBox="-1.1 -1.1 2.2 2.2" style={{ width: size, height: size, transform: 'rotate(-90deg)' }}>
                {data.map((slice, i) => {
                    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                    cumulativePercent += slice.percentage / 100;
                    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                    const largeArcFlag = slice.percentage / 100 > 0.5 ? 1 : 0;

                    const pathData = [
                        `M ${startX} ${startY}`,
                        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        `L 0 0`,
                    ].join(' ');

                    return (
                        <path
                            key={i}
                            d={pathData}
                            fill={slice.color || `hsl(${40 + i * 40}, 80%, 50%)`}
                            className="pie-slice"
                            style={{
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                opacity: hoverData?.index === i ? 1 : 0.8,
                                transform: hoverData?.index === i ? 'scale(1.05)' : 'scale(1)'
                            }}
                            onMouseEnter={(e) => setHoverData({
                                index: i,
                                label: slice.name,
                                value: `${slice.percentage}%`,
                                x: e.clientX,
                                y: e.clientY
                            })}
                            onMouseMove={(e) => setHoverData(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                            onMouseLeave={() => setHoverData(null)}
                        />
                    );
                })}
                <circle cx="0" cy="0" r="0.6" fill="#0D1137" />
            </svg>
            {hoverData && <Tooltip active={true} payload={hoverData} x={hoverData.x} y={hoverData.y} />}
        </div>
    );
};

export const BarChart = ({ data, height = 200, width = 400 }) => {
    const [hoverData, setHoverData] = useState(null);
    const maxVal = Math.max(...data.map(d => d.production));

    return (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="bar-chart">
                {data.map((d, i) => {
                    const h = (d.production / maxVal) * (height - 40);
                    const x = (i * (width / data.length)) + 10;
                    const barWidth = (width / data.length) - 20;
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={height - h - 20}
                                width={barWidth}
                                height={h}
                                fill={hoverData?.index === i ? "var(--primary)" : "rgba(255, 215, 0, 0.7)"}
                                rx="6"
                                className="chart-bar"
                                style={{ transition: 'fill 0.2s', cursor: 'pointer' }}
                                onMouseEnter={(e) => setHoverData({
                                    index: i,
                                    label: d.year,
                                    value: `${d.production} Billion`,
                                    x: e.clientX,
                                    y: e.clientY
                                })}
                                onMouseMove={(e) => setHoverData(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                                onMouseLeave={() => setHoverData(null)}
                            />
                            <text
                                x={x + barWidth / 2}
                                y={height - 5}
                                fill="white"
                                fontSize="10"
                                textAnchor="middle"
                            >
                                {d.year}
                            </text>
                        </g>
                    );
                })}
            </svg>
            {hoverData && <Tooltip active={true} payload={hoverData} x={hoverData.x} y={hoverData.y} />}
        </div>
    );
};
