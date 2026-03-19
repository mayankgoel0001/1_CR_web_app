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
    <div className="border border-[#E4EDE8] rounded-[8px] p-[12px] grid gap-[4px] bg-[#F8FAF9]">
      <span className="text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.8px]">{label}</span>
      <strong className="text-[#0D1F17] text-[13px] font-bold">{value}</strong>
    </div>
  );
}

export default function AssetInfo({ info, type }) {
  return (
    <section className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] transition-shadow duration-200 hover:shadow-md">
      <h3 className="text-[14px] font-bold text-[#0D1F17] mb-[12px]">Asset Information</h3>

      {type === 'mutual_fund' ? (
        <div className="grid grid-cols-2 gap-[10px] max-md:grid-cols-1">
          <Item label="Fund Category" value={info.fundCategory || 'N/A'} />
          <Item label="Expense Ratio" value={info.expenseRatio || 'N/A'} />
          <Item label="AUM" value={info.aum || 'N/A'} />
          <Item label="Fund Manager" value={info.fundManager || 'N/A'} />
          <Item label="Risk Level" value={info.riskLevel || 'N/A'} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[10px] max-md:grid-cols-1">
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
