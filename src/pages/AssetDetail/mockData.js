import { assets } from '../../data/mockData';

export const assetDetailTemplates = {
  '2': {
    symbol: 'RELIANCE',
    type: 'stock',
    holding: {
      currentPrice: 2500,
    },
    assetInfo: {
      sector: 'Energy',
      marketCap: 'Large Cap',
      peRatio: 23,
      dividendYield: '0.8%',
      weekHigh52: 2900,
      weekLow52: 2200,
    },
    performanceHistory: [
      { date: 'Jan', price: 2100 },
      { date: 'Feb', price: 2200 },
      { date: 'Mar', price: 2400 },
      { date: 'Apr', price: 2500 },
    ],
  },
  RELIANCE: null,
  'Reliance Industries': null,
  '3': {
    symbol: 'SBIBLUE',
    type: 'mutual_fund',
    assetInfo: {
      fundCategory: 'Large Cap Equity',
      expenseRatio: '1.54%',
      aum: 'Rs 42,000 Cr',
      fundManager: 'R. Srinivasan',
      riskLevel: 'Moderate',
      weekHigh52: 0,
      weekLow52: 0,
    },
    performanceHistory: [
      { date: 'Jan', price: 182 },
      { date: 'Feb', price: 188 },
      { date: 'Mar', price: 194 },
      { date: 'Apr', price: 201 },
    ],
  },
  SBIBLUE: null,
  'SBI Bluechip Fund': null,
};

assetDetailTemplates.RELIANCE = assetDetailTemplates['2'];
assetDetailTemplates['Reliance Industries'] = assetDetailTemplates['2'];
assetDetailTemplates.SBIBLUE = assetDetailTemplates['3'];
assetDetailTemplates['SBI Bluechip Fund'] = assetDetailTemplates['3'];

export function getBaseAssetById(assetId) {
  if (assetId == null) {
    return null;
  }

  return assets.find((asset) => String(asset.id) === String(assetId)) || null;
}

export function getDefaultBaseAsset() {
  return assets.find((asset) => asset.category === 'investments') || assets[0] || null;
}

export function makeAssetDetailFromBase(baseAsset) {
  if (!baseAsset) {
    return {
      id: 'asset_dynamic',
      name: 'Asset',
      type: 'stock',
      symbol: 'ASSET',
      holding: {
        quantity: 0,
        avgPrice: 0,
        investedValue: 0,
        currentPrice: 0,
        currentValue: 0,
        profitLoss: 0,
        returnPercent: 0,
      },
      portfolioImpact: {
        portfolioValue: 0,
        allocationPercent: 0,
      },
      assetInfo: {
        sector: 'N/A',
        marketCap: 'N/A',
        peRatio: 'N/A',
        dividendYield: 'N/A',
        weekHigh52: 0,
        weekLow52: 0,
      },
      performanceHistory: [
        { date: 'Jan', price: 1 },
        { date: 'Feb', price: 1 },
        { date: 'Mar', price: 1 },
        { date: 'Apr', price: 1 },
      ],
    };
  }

  const investedValue = Number(baseAsset.purchasePrice || 0);
  const currentValue = Number(baseAsset.currentValue || investedValue);
  const profitLoss = currentValue - investedValue;
  const returnPercent = investedValue ? (profitLoss / investedValue) * 100 : 0;

  return {
    id: String(baseAsset.id || 'asset_dynamic'),
    name: baseAsset.name || 'Asset',
    type: baseAsset.subType?.toLowerCase().includes('fund') ? 'mutual_fund' : 'stock',
    symbol: (baseAsset.name || 'ASSET').toUpperCase().replace(/\s+/g, '_'),
    holding: {
      quantity: 0,
      avgPrice: investedValue,
      investedValue,
      currentPrice: currentValue,
      currentValue,
      profitLoss,
      returnPercent: Number(returnPercent.toFixed(1)),
    },
    portfolioImpact: {
      portfolioValue: currentValue,
      allocationPercent: 0,
    },
    assetInfo: {
      sector: 'N/A',
      marketCap: 'N/A',
      peRatio: 'N/A',
      dividendYield: 'N/A',
      weekHigh52: currentValue,
      weekLow52: investedValue,
    },
    performanceHistory: [
      { date: 'Jan', price: Math.max(investedValue * 0.88, 1) },
      { date: 'Feb', price: Math.max(investedValue * 0.94, 1) },
      { date: 'Mar', price: Math.max(currentValue * 0.97, 1) },
      { date: 'Apr', price: currentValue },
    ],
  };
}
