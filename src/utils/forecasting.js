/**
 * Simple forecasting utilities for NECC egg price predictions
 * Uses linear regression, moving averages, and confidence intervals
 */

/**
 * Calculate linear regression coefficients
 * @param {Array} data - Array of {date, price} objects
 * @returns {Object} - slope, intercept, r2 (coefficient of determination)
 */
export function linearRegression(data) {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: data[0]?.price || 0, r2: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    data.forEach((d, i) => {
        const x = i;
        const y = parseFloat(d.price);
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
    });

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R² (coefficient of determination)
    const yMean = sumY / n;
    let ssTot = 0, ssRes = 0;
    data.forEach((d, i) => {
        const y = parseFloat(d.price);
        const yPred = slope * i + intercept;
        ssTot += (y - yMean) ** 2;
        ssRes += (y - yPred) ** 2;
    });
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    return { slope, intercept, r2 };
}

/**
 * Calculate moving average
 * @param {Array} data - Array of prices
 * @param {number} window - Window size for moving average
 * @returns {Array} - Smoothed data points
 */
export function movingAverage(data, window = 7) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - window + 1);
        const slice = data.slice(start, i + 1);
        const avg = slice.reduce((sum, d) => sum + parseFloat(d.price), 0) / slice.length;
        result.push({
            ...data[i],
            smoothedPrice: avg.toFixed(2)
        });
    }
    return result;
}

/**
 * Generate forecast predictions with confidence intervals
 * @param {Array} historicalData - Array of {date, price} objects
 * @param {number} forecastDays - Number of days to forecast
 * @returns {Object} - forecast array and metrics
 */
/**
 * Calculate Weighted Moving Average
 * Gives more weight to recent data points
 * @param {Array} data - Array of prices
 * @param {number} window - Window size
 * @returns {Array} - Smoothed data points
 */
export function weightedMovingAverage(data, window = 7) {
    const result = [];
    const weights = Array.from({ length: window }, (_, i) => i + 1);
    const weightSum = weights.reduce((a, b) => a + b, 0);

    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - window + 1);
        const slice = data.slice(start, i + 1);

        // Adjust weights for partial windows at the start
        const currentWeights = weights.slice(window - slice.length);
        const currentWeightSum = currentWeights.reduce((a, b) => a + b, 0);

        const wma = slice.reduce((sum, d, idx) => sum + (parseFloat(d.price) * currentWeights[idx]), 0) / currentWeightSum;

        result.push({
            ...data[i],
            smoothedPrice: wma.toFixed(2)
        });
    }
    return result;
}

/**
 * Calculate Exponential Smoothing (Holt-Winters Single)
 * @param {Array} data - Array of prices
 * @param {number} alpha - Smoothing factor (0 < alpha < 1)
 * @returns {Array} - Smoothed data points
 */
export function exponentialSmoothing(data, alpha = 0.3) {
    const result = [];
    let prev = parseFloat(data[0].price);

    result.push({ ...data[0], smoothedPrice: prev.toFixed(2) });

    for (let i = 1; i < data.length; i++) {
        const curr = parseFloat(data[i].price);
        const next = alpha * curr + (1 - alpha) * prev;
        result.push({ ...data[i], smoothedPrice: next.toFixed(2) });
        prev = next;
    }
    return result;
}

/**
 * Generate forecast predictions with multiple models
 * @param {Array} historicalData - Array of {date, price} objects
 * @param {number} forecastDays - Number of days to forecast
 * @param {string} modelType - 'linear', 'wma', 'ets'
 * @returns {Object} - forecast array and metrics
 */
export function generateForecast(historicalData, forecastDays = 30, modelType = 'linear') {
    if (!historicalData || historicalData.length < 2) {
        return { forecast: [], metrics: { trend: 'neutral', volatility: 0, confidence: 0 } };
    }

    const n = historicalData.length;
    let forecast = [];
    let slope = 0, intercept = 0, r2 = 0;

    // Common metrics
    const prices = historicalData.map(d => parseFloat(d.price));
    const mean = prices.reduce((a, b) => a + b, 0) / n;

    // -- MODEL SELECTION --
    if (modelType === 'wma') {
        // Weighted Moving Average Projection
        const wmaData = weightedMovingAverage(historicalData, 14); // 2-week window
        const lastWMA = parseFloat(wmaData[n - 1].smoothedPrice);
        const prevWMA = parseFloat(wmaData[n - 2].smoothedPrice);
        const trendStep = lastWMA - prevWMA; // Short-term trend

        const lastDate = new Date(historicalData[n - 1].date);

        for (let i = 0; i < forecastDays; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setDate(forecastDate.getDate() + i + 1);

            // Dampen trend over time for WMA
            const damping = Math.max(0, 1 - (i * 0.05));
            const predicted = lastWMA + (trendStep * (i + 1) * damping);

            // Standard error for confidence
            const stdDev = 0.5; // Approximation for WMA

            forecast.push({
                date: forecastDate.toISOString().split('T')[0],
                predicted: Math.max(0, predicted).toFixed(2),
                upper: (predicted + 1.96 * stdDev).toFixed(2),
                lower: (predicted - 1.96 * stdDev).toFixed(2),
                isForecast: true
            });
        }

        // Approximate metrics for WMA
        slope = trendStep;
        r2 = 0.85; // Heuristic

    } else if (modelType === 'ets') {
        // Exponential Smoothing Projection
        const alpha = 0.3;
        const etsData = exponentialSmoothing(historicalData, alpha);
        const lastSmoothed = parseFloat(etsData[n - 1].smoothedPrice);
        const trendComponent = (parseFloat(etsData[n - 1].smoothedPrice) - parseFloat(etsData[0].smoothedPrice)) / n;

        const lastDate = new Date(historicalData[n - 1].date);

        for (let i = 0; i < forecastDays; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setDate(forecastDate.getDate() + i + 1);

            const predicted = lastSmoothed + (trendComponent * (i + 1));
            // Standard error for confidence
            const stdDev = 0.6; // Approximation for ETS

            forecast.push({
                date: forecastDate.toISOString().split('T')[0],
                predicted: Math.max(0, predicted).toFixed(2),
                upper: (predicted + 1.96 * stdDev).toFixed(2),
                lower: (predicted - 1.96 * stdDev).toFixed(2),
                isForecast: true
            });
        }

        slope = trendComponent;
        r2 = 0.88; // Heuristic

    } else {
        // -- DEFAULT: LINEAR REGRESSION --
        const lr = linearRegression(historicalData);
        slope = lr.slope;
        intercept = lr.intercept;
        r2 = lr.r2;

        // Calculate standard deviation of residuals for confidence intervals
        const residuals = historicalData.map((d, i) => {
            const predicted = slope * i + intercept;
            return parseFloat(d.price) - predicted;
        });
        const stdDev = Math.sqrt(
            residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2)
        ) || 0.1;

        const lastDate = new Date(historicalData[n - 1].date);

        for (let i = 0; i < forecastDays; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setDate(forecastDate.getDate() + i + 1);

            const x = n + i;
            const predicted = slope * x + intercept;

            // Confidence interval widens with distance from data
            const intervalMultiplier = 1.96 * Math.sqrt(1 + (1 / n) + ((x - n / 2) ** 2) / (n * stdDev));
            const upperBound = predicted + intervalMultiplier * stdDev;
            const lowerBound = predicted - intervalMultiplier * stdDev;

            forecast.push({
                date: forecastDate.toISOString().split('T')[0],
                predicted: Math.max(0, predicted).toFixed(2),
                upper: Math.max(0, upperBound).toFixed(2),
                lower: Math.max(0, lowerBound).toFixed(2),
                isForecast: true
            });
        }
    }

    // Determine trend & Volatility
    const trend = slope > 0.01 ? 'rising' : slope < -0.01 ? 'falling' : 'stable';

    // Recalculate volatility for all models based on historical variance
    const stdDevRaw = Math.sqrt(
        prices.map(p => Math.pow(p - mean, 2)).reduce((a, b) => a + b, 0) / n
    );
    const volatility = (stdDevRaw / mean) * 100;

    return {
        forecast,
        metrics: {
            trend,
            slopePerDay: slope.toFixed(4),
            volatility: volatility.toFixed(1),
            confidence: (r2 * 100).toFixed(0),
            avgPrice: mean.toFixed(2),
            predictedNextWeek: forecast[6]?.predicted || 0,
            predictedNextMonth: forecast[29]?.predicted || forecast[forecast.length - 1]?.predicted || 0
        }
    };
}

/**
 * Detect seasonal patterns (basic implementation)
 * @param {Array} data - Historical price data
 * @returns {Object} - Seasonal pattern info
 */
export function detectSeasonality(data) {
    if (data.length < 30) return { hasSeasonality: false, pattern: 'insufficient data' };

    // Simple weekly pattern detection
    const dayAverages = {};
    data.forEach(d => {
        const dayOfWeek = new Date(d.date).getDay();
        if (!dayAverages[dayOfWeek]) dayAverages[dayOfWeek] = [];
        dayAverages[dayOfWeek].push(parseFloat(d.price));
    });

    const avgByDay = Object.entries(dayAverages).map(([day, prices]) => ({
        day: parseInt(day),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length
    }));

    const overallAvg = data.reduce((sum, d) => sum + parseFloat(d.price), 0) / data.length;
    const maxDev = Math.max(...avgByDay.map(d => Math.abs(d.avg - overallAvg)));
    const hasWeeklyPattern = (maxDev / overallAvg) > 0.02; // 2% threshold

    return {
        hasSeasonality: hasWeeklyPattern,
        pattern: hasWeeklyPattern ? 'weekly' : 'none',
        dayAverages: avgByDay
    };
}
