import { MdKeyboardArrowRight } from 'react-icons/md';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function AssetHeader({ asset }) {
  const { name, symbol, holding, type } = asset;
  const isProfit = holding.profitLoss >= 0;

  return (
    <section className="asset-detail-header card">
      <div className="asset-detail-header-main">
        <p className="asset-detail-breadcrumb">
          Portfolio <MdKeyboardArrowRight size={12} /> <span>{name}</span>
        </p>
        <h1>{name}</h1>
        <p className="asset-detail-subline">{symbol}</p>
        <div className="asset-type-pills">
          <span>{type === 'mutual_fund' ? 'Mutual Fund' : 'Equity'}</span>
          <span>{type === 'mutual_fund' ? 'Managed' : 'Direct'}</span>
          <span>{isProfit ? 'Positive Trend' : 'Volatile'}</span>
        </div>
      </div>

      <div className="asset-detail-price-block">
        <strong>{formatCurrency(holding.currentPrice || holding.currentValue)}</strong>
        <span className={isProfit ? 'pos' : 'neg'}>
          {isProfit ? '+' : '-'}{formatCurrency(Math.abs(holding.profitLoss))} ({Math.abs(holding.returnPercent).toFixed(1)}%)
        </span>
      </div>
    </section>
  );
}
