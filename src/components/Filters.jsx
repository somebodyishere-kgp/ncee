import React from 'react';

export const DateSelector = ({ selectedDate, onDateChange }) => {
    return (
        <div className="filter-group">
            <label>Select Date</label>
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
            />
        </div>
    );
};

export const RangeSelector = ({ range, onRangeChange }) => {
    return (
        <div className="filter-group">
            <label>Date Range</label>
            <div className="range-inputs">
                <input
                    type="date"
                    value={range.start}
                    onChange={(e) => onRangeChange({ ...range, start: e.target.value })}
                />
                <span>to</span>
                <input
                    type="date"
                    value={range.end}
                    onChange={(e) => onRangeChange({ ...range, end: e.target.value })}
                />
            </div>
        </div>
    );
};

export const SelectionBar = ({ selectedDate, onDateChange, range, onRangeChange, mode, setMode }) => {
    return (
        <div className="selection-bar glass-panel animate-in">
            <div className="mode-toggle">
                <button
                    className={mode === 'daily' ? 'active' : ''}
                    onClick={() => setMode('daily')}
                >
                    📊 Daily Overview
                </button>
                <button
                    className={mode === 'trend' ? 'active' : ''}
                    onClick={() => setMode('trend')}
                >
                    📈 Price Trends
                </button>
                <button
                    className={mode === 'forecast' ? 'active' : ''}
                    onClick={() => setMode('forecast')}
                >
                    🔮 Forecast
                </button>
            </div>

            {mode === 'daily' ? (
                <DateSelector selectedDate={selectedDate} onDateChange={onDateChange} />
            ) : mode === 'trend' ? (
                <RangeSelector range={range} onRangeChange={onRangeChange} />
            ) : (
                <div className="filter-group">
                    <span className="forecast-mode-hint">📅 12-month historical data analysis</span>
                </div>
            )}
        </div>
    );
};
