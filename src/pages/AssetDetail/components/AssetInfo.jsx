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

export default function AssetInfo({ info, type }) {
  return (
    <section className="card asset-section">
      <h3>Asset Information</h3>

      {type === 'mutual_fund' ? (
        <div className="asset-detail-grid">
          <Item label="Fund Category" value={info.fundCategory || 'N/A'} />
          <Item label="Expense Ratio" value={info.expenseRatio || 'N/A'} />
          <Item label="AUM" value={info.aum || 'N/A'} />
          <Item label="Fund Manager" value={info.fundManager || 'N/A'} />
          <Item label="Risk Level" value={info.riskLevel || 'N/A'} />
        </div>
      ) : (
        <div className="asset-detail-grid">
          <Item label="Sector" value={info.sector || 'N/A'} />
          <Item label="Market Cap" value={info.marketCap || 'N/A'} />
          <Item label="P/E Ratio" value={info.peRatio || 'N/A'} />
          <Item label="Dividend Yield" value={info.dividendYield || 'N/A'} />
          <Item label="52W High" value={formatCurrency(info.weekHigh52)} />
          <Item label="52W Low" value={formatCurrency(info.weekLow52)} />
        </div>
      )}
    </section>
  );
}
