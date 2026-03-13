import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

function formatCompact(value) {
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}K`;
  return `Rs ${value}`;
}

export default function PerformanceChart({ data, asset }) {
  const isProfit = asset.holding.profitLoss >= 0;

  return (
    <section className="card asset-section asset-chart-section">
      <div className="asset-chart-summary">
        <strong className={isProfit ? 'pos' : 'neg'}>
          {isProfit ? '+' : '-'}{Math.abs(asset.holding.returnPercent).toFixed(2)}%
        </strong>
        <span>Since purchase</span>
      </div>

      <div className="asset-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#7A8698', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={false} width={0} domain={['auto', 'auto']} />
            <Tooltip formatter={(value) => [formatCompact(value), 'Price']} />
            <Line type="monotone" dataKey="price" stroke="#57C39F" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="asset-chart-ranges">
        {['1M', '6M', '1Y', '3Y', '5Y', 'All'].map((range) => (
          <button key={range} type="button" className={range === '1Y' ? 'active' : ''}>{range}</button>
        ))}
      </div>
    </section>
  );
}
