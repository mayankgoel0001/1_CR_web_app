export default function InsightsCard({ asset }) {
  const allocation = Number(asset?.portfolioImpact?.allocationPercent || 0);

  return (
    <section className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] transition-shadow duration-200 hover:shadow-md">
      <h3 className="text-[14px] font-bold text-[#0D1F17] mb-[12px]">Insights</h3>
      <ul className="grid gap-[8px] ml-[16px] list-disc">
        <li className="text-[#0D1F17] text-[12.5px] font-medium leading-relaxed">Asset contributes {allocation.toFixed(1)}% of your portfolio.</li>
        {allocation > 20 ? (
          <li className="text-[#0D1F17] text-[12.5px] font-medium leading-relaxed">High concentration warning: this holding is above 20% allocation.</li>
        ) : (
          <li className="text-[#0D1F17] text-[12.5px] font-medium leading-relaxed">Allocation is in a moderate range for diversification.</li>
        )}
        {asset.type === 'stock' ? (
          <li className="text-[#0D1F17] text-[12.5px] font-medium leading-relaxed">Track sector exposure to avoid over-weighting one industry.</li>
        ) : (
          <li className="text-[#0D1F17] text-[12.5px] font-medium leading-relaxed">Review expense ratio and fund category for long-term fit.</li>
        )}
      </ul>
    </section>
  );
}
