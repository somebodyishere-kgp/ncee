import realData from './realData.json';

export const stats2025 = {
  totalProduction: "149.11",
  unit: "Billion",
  globalRank: "2nd",
  growthRate: "4.44%",
  perCapita: "106",
  poultryContribution: "84.49%"
};

export const productionTrend = [
  { year: "2018-19", production: 103.80, perCapita: 79 },
  { year: "2019-20", production: 114.38, perCapita: 86 },
  { year: "2020-21", production: 122.04, perCapita: 90 },
  { year: "2021-22", production: 129.60, perCapita: 95 },
  { year: "2022-23", production: 138.37, perCapita: 101 },
  { year: "2023-24", production: 142.77, perCapita: 103 },
  { year: "2024-25", production: 149.11, perCapita: 106 },
];

export const stateProduction = [
  { name: "Andhra Pradesh", percentage: 18.37, color: "#FFD700" },
  { name: "Tamil Nadu", percentage: 15.63, color: "#FFA000" },
  { name: "Telangana", percentage: 12.98, color: "#FF7043" },
  { name: "West Bengal", percentage: 10.72, color: "#F4511E" },
  { name: "Karnataka", percentage: 6.67, color: "#BF360C" },
  { name: "Others", percentage: 35.63, color: "#455A64" }
];

export const speciesDistribution = [
  { name: "Improved Fowl", percentage: 86.35 },
  { name: "Desi Fowl", percentage: 12.59 },
  { name: "Desi Ducks", percentage: 0.85 },
  { name: "Improved Ducks", percentage: 0.22 }
];

export const cityPrices = realData.map(d => ({
  city: d.city,
  price: d.price,
  tray30: d.price * 30,
  box180: d.price * 180
}));

// Helper to generate trend data for a range
export const generatePriceTrend = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];
  let current = new Date(start);

  while (current <= end) {
    data.push({
      date: current.toISOString().split('T')[0],
      price: (5 + Math.random() * 0.8).toFixed(2)
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
};
