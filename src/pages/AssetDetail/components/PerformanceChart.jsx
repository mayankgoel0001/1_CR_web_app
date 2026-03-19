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
    <section className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[18px_20px] transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-baseline gap-[8px] mb-[10px]">
        <strong className={`text-[30px] leading-none font-bold ${isProfit ? 'text-[#0FB981]' : 'text-[#EF4444]'}`}>
          {isProfit ? '+' : '-'}{Math.abs(asset.holding.returnPercent).toFixed(2)}%
        </strong>
        <span className="text-[#8FA99C] font-bold text-[12.5px]">Since purchase</span>
      </div>

      <div className="h-[340px] max-md:h-[260px]">
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

      <div className="flex justify-center gap-[10px] mt-[8px]">
        {['1M', '6M', '1Y', '3Y', '5Y', 'All'].map((range) => (
          <button key={range} type="button" className={`w-[42px] h-[32px] rounded-[20px] border border-[#E4EDE8] bg-white text-[12px] font-bold cursor-pointer transition-all ${range === '1Y' ? 'text-[#0D1F17] border-[#2D7A4F] bg-[#F0FAF5]' : 'text-[#8FA99C] hover:bg-[#F9FAFB]'}`}>{range}</button>
        ))}
      </div>
    </section>
  );
}
