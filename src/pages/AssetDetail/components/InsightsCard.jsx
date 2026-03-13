export default function InsightsCard({ asset }) {
  const allocation = Number(asset?.portfolioImpact?.allocationPercent || 0);

  return (
    <section className="card asset-section insights-section">
      <h3>Insights</h3>
      <ul>
        <li>Asset contributes {allocation.toFixed(1)}% of your portfolio.</li>
        {allocation > 20 ? (
          <li>High concentration warning: this holding is above 20% allocation.</li>
        ) : (
          <li>Allocation is in a moderate range for diversification.</li>
        )}
        {asset.type === 'stock' ? (
          <li>Track sector exposure to avoid over-weighting one industry.</li>
        ) : (
          <li>Review expense ratio and fund category for long-term fit.</li>
        )}
      </ul>
    </section>
  );
}
