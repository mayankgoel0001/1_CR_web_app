export default function PortfolioAllocation({ allocation }) {
  const pct = Number(allocation?.allocationPercent || 0);

  return (
    <section className="card asset-section">
      <h3>Portfolio Allocation</h3>
      <p className="asset-section-sub">This asset is {pct.toFixed(1)}% of your portfolio</p>
      <div className="asset-progress-track">
        <div className="asset-progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <strong className="asset-progress-value">{pct.toFixed(1)}%</strong>
    </section>
  );
}
