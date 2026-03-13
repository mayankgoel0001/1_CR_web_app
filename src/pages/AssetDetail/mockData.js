export const assetMock = {
  id: 'asset_1',
  name: 'Reliance Industries',
  type: 'stock',
  symbol: 'RELIANCE',
  holding: {
    quantity: 50,
    avgPrice: 1960,
    investedValue: 98000,
    currentPrice: 2500,
    currentValue: 125000,
    profitLoss: 27000,
    returnPercent: 27.6,
  },
  portfolioImpact: {
    portfolioValue: 1000000,
    allocationPercent: 12.5,
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
};

export const assetMocks = {
  asset_1: assetMock,
  '2': assetMock,
  RELIANCE: assetMock,
  'Reliance Industries': assetMock,
  asset_2: {
    id: 'asset_2',
    name: 'SBI Bluechip Fund',
    type: 'mutual_fund',
    symbol: 'SBIBLUE',
    holding: {
      quantity: 0,
      avgPrice: 0,
      investedValue: 180000,
      currentPrice: 0,
      currentValue: 210000,
      profitLoss: 30000,
      returnPercent: 16.7,
    },
    portfolioImpact: {
      portfolioValue: 1000000,
      allocationPercent: 21,
    },
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
  '3': null,
  SBIBLUE: null,
  'SBI Bluechip Fund': null,
};

assetMocks['3'] = assetMocks.asset_2;
assetMocks.SBIBLUE = assetMocks.asset_2;
assetMocks['SBI Bluechip Fund'] = assetMocks.asset_2;

export function makeAssetDetailFromBase(baseAsset) {
  if (!baseAsset) return assetMock;

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
