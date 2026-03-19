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
    <div className="border border-[#E4EDE8] rounded-[8px] p-[12px] grid gap-[3px] bg-[#F8FAF9]">
      <span className="text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.8px]">{label}</span>
      <strong className="text-[#0D1F17] text-[13px] font-bold">{value}</strong>
    </div>
  );
}

export default function HoldingSummary({ holding }) {
  const isProfit = holding.profitLoss >= 0;

  return (
    <section className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[20px] transition-shadow duration-200 hover:shadow-md">
      <h3 className="text-[14px] font-bold text-[#0D1F17] mb-[12px]">My Holding</h3>
      <div className="grid grid-cols-2 gap-[10px] max-md:grid-cols-1">
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

      <div className="mt-[12px] bg-[#E8F7F2] rounded-[10px] p-[10px] text-[#2A6A56] text-[12.5px] font-bold">
        Next review suggested in 7 days based on recent price movement.
      </div>
    </section>
  );
}
