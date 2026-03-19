export default function PortfolioAllocation({ allocation }) {
  const pct = Number(allocation?.allocationPercent || 0);

  return (
    <section className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] transition-shadow duration-200 hover:shadow-md">
      <h3 className="text-[14px] font-bold text-[#0D1F17] mb-[8px]">Portfolio Allocation</h3>
      <p className="text-[#8FA99C] text-[12.5px] mb-[10px]">This asset is {pct.toFixed(1)}% of your portfolio</p>
      <div className="w-full h-[10px] rounded-full bg-[#E5E7EB] overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#2D7A4F] to-[#44B36F]" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <strong className="inline-block mt-[8px] text-[#0D1F17] text-[13px] font-bold">{pct.toFixed(1)}%</strong>
    </section>
  );
}
