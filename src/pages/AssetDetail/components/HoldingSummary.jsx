function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function Item({ label, value }) {
  return (
    <div className="asset-grid-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function HoldingSummary({ holding }) {
  const isProfit = holding.profitLoss >= 0;

  return (
    <section className="card asset-section holding-panel">
      <h3>My Holding</h3>
      <div className="asset-detail-grid holding-grid">
        <Item label="Quantity" value={holding.quantity || 'N/A'} />
        <Item label="Average Price" value={formatCurrency(holding.avgPrice)} />
        <Item label="Invested Amount" value={formatCurrency(holding.investedValue)} />
        <Item label="Current Value" value={formatCurrency(holding.currentValue)} />
        <Item
          label="Profit / Loss"
          value={`${isProfit ? '+' : '-'}${formatCurrency(Math.abs(holding.profitLoss))}`}
        />
        <Item
          label="Return"
          value={`${isProfit ? '+' : '-'}${Math.abs(holding.returnPercent).toFixed(1)}%`}
        />
      </div>

      <div className="holding-footer-note">
        Next review suggested in 7 days based on recent price movement.
      </div>
    </section>
  );
}
