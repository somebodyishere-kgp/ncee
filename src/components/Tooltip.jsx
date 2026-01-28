import React from 'react';

const Tooltip = ({ active, payload, x, y }) => {
    if (!active || !payload) return null;

    return (
        <div
            className="custom-tooltip glass-panel"
            style={{
                position: 'fixed',
                left: x + 15,
                top: y - 10,
                padding: '10px 15px',
                zIndex: 1000,
                pointerEvents: 'none',
                border: '1px solid var(--primary)',
                transform: 'translateY(-100%)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
            }}
        >
            <div className="tooltip-label" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                {payload.label}
            </div>
            <div className="tooltip-value" style={{ color: 'white', fontSize: '1.2rem' }}>
                {payload.value}
            </div>
        </div>
    );
};

export default Tooltip;
