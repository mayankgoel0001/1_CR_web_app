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
    <section className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[22px] transition-shadow duration-200 hover:shadow-md flex justify-between items-start gap-[16px] max-md:flex-col">
      <div className="grid gap-[4px]">
        <p className="mb-[2px] text-[#8FA99C] text-[12.5px] inline-flex items-center gap-[4px]">
          Portfolio <MdKeyboardArrowRight size={12} /> <span className="text-[#2D7A4F] font-bold">{name}</span>
        </p>
        <h1 className="text-[22px] font-bold text-[#0D1F17]">{name}</h1>
        <p className="text-[#8FA99C] text-[12.5px] mt-[3px]">{symbol}</p>
        <div className="inline-flex flex-wrap gap-[8px] mt-[6px]">
          <span className="border border-[#E4EDE8] rounded-full px-[9px] py-[3px] text-[11px] text-[#475467] bg-white font-bold uppercase tracking-[0.5px]">{type === 'mutual_fund' ? 'Mutual Fund' : 'Equity'}</span>
          <span className="border border-[#E4EDE8] rounded-full px-[9px] py-[3px] text-[11px] text-[#475467] bg-white font-bold uppercase tracking-[0.5px]">{type === 'mutual_fund' ? 'Managed' : 'Direct'}</span>
          <span className="border border-[#E4EDE8] rounded-full px-[9px] py-[3px] text-[11px] text-[#475467] bg-white font-bold uppercase tracking-[0.5px]">{isProfit ? 'Positive Trend' : 'Volatile'}</span>
        </div>
      </div>

      <div className="text-right min-w-[210px] max-md:text-left">
        <strong className="block text-[34px] font-bold leading-none text-[#0D1F17] max-md:text-[28px]">{formatCurrency(holding.currentPrice || holding.currentValue)}</strong>
        <span className={`text-[14px] font-bold mt-[10px] inline-block ${isProfit ? 'text-[#0FB981]' : 'text-[#EF4444]'}`}>
          {isProfit ? '+' : '-'}{formatCurrency(Math.abs(holding.profitLoss))} ({Math.abs(holding.returnPercent).toFixed(1)}%)
        </span>
      </div>
    </section>
  );
}
