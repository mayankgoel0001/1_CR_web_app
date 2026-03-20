import { useState } from 'react';
import { ICONS } from '../../utils/icons';
import { formatCurrency } from '../../data/mockData';
import DonutChart from '../../components/Charts/DonutChart';



const calculators = [
    { key: 'home-loan', label: 'Home Loan EMI', icon: ICONS.Home },
    { key: 'car-loan', label: 'Car Loan EMI', icon: ICONS.Vehicle },
    { key: 'sip', label: 'SIP Calculator', icon: ICONS.chartLine },
    { key: 'lumpsum', label: 'Lumpsum', icon: ICONS.wallet },
    { key: 'future-value', label: 'Future Value', icon: ICONS.trendUp },
];

/* ── Reusable Slider Row ────────────────────────────── */
function SliderField({ label, value, setValue, min, max, step, minLabel, maxLabel, prefix, suffix }) {
    const clamp = (v) => Math.min(max, Math.max(min, v));

    const handleInputChange = (e) => {
        const raw = e.target.value;
        if (raw === '' || raw === '-') return;
        setValue(Number(raw));
    };

    const handleInputBlur = () => {
        setValue(clamp(value));
    };

    const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

    return (
        <div className="mb-[20px] last:mb-0">
            <div className="flex items-center justify-between mb-[10px]">
                <div className="text-[13px] font-bold text-[#0D1F17]">{label}</div>
                <div className="flex items-center gap-0 bg-[#F0F4F1] border border-[#E4EDE8] rounded-[9px] overflow-hidden">
                    <button className="w-[34px] h-[36px] bg-transparent cursor-pointer flex items-center justify-center text-[#4B6358] text-[16px] font-bold transition-all duration-150 hover:bg-[#E8F5EE] hover:text-[#2D7A4F]" onClick={() => setValue(clamp(value - step))}>−</button>
                    <div className="w-[1px] h-[20px] bg-[#E4EDE8]"></div>
                    {prefix && <span className="text-[11px] font-bold text-[#8FA99C] px-[10px] py-0 pr-[4px] uppercase tracking-[0.4px]">{prefix}</span>}
                    <input
                        type="number"
                        className="border-none bg-transparent text-[13px] font-bold text-[#0D1F17] text-center w-[120px] outline-none px-[4px] focus:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]"
                        value={value}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                    />
                    <div className="w-[1px] h-[20px] bg-[#E4EDE8]"></div>
                    {suffix && <div className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.4px] whitespace-nowrap pl-[4px] pr-[10px]">{suffix}</div>}
                    <button className="w-[34px] h-[36px] bg-transparent cursor-pointer flex items-center justify-center text-[#4B6358] text-[16px] font-bold transition-all duration-150 hover:bg-[#E8F5EE] hover:text-[#2D7A4F]" onClick={() => setValue(clamp(value + step))}>+</button>
                </div>
            </div>
            <div 
                className="relative h-[28px] flex items-center before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[calc(10px+(100%-20px)*var(--pct)*0.01)] before:h-[8px] before:bg-[#2D7A4F] before:rounded-full before:pointer-events-none before:z-[1] after:content-[''] after:absolute after:left-0 after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-[4px] after:bg-[#E4EDE8] after:rounded-full after:pointer-events-none" 
                style={{ '--pct': pct }}
            >
                <input
                    type="range"
                    className="w-full appearance-none h-[28px] outline-none bg-transparent relative z-[2] m-0 p-0 [&::-webkit-slider-runnable-track]:h-[4px] [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2D7A4F] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_#C5E8D1,0_2px_4px_rgba(0,0,0,0.15)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-shadow hover:[&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(45,122,79,0.15),0_2px_4px_rgba(0,0,0,0.15)] [&::-webkit-slider-thumb]:-mt-[8px] [&::-moz-range-track]:h-[4px] [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#2D7A4F] [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_0_0_3px_#C5E8D1,0_2px_4px_rgba(0,0,0,0.15)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-shadow hover:[&::-moz-range-thumb]:shadow-[0_0_0_4px_rgba(45,122,79,0.15),0_2px_4px_rgba(0,0,0,0.15)] focus:outline-none"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                />
            </div>
            <div className="flex justify-between mt-[5px]">
                <span className="text-[11px] text-[#8FA99C] font-semibold">{minLabel}</span>
                <span className="text-[11px] text-[#8FA99C] font-semibold">{maxLabel}</span>
            </div>
        </div>
    );
}

/* ── EMI (Home / Car) ───────────────────────────────── */
function EMICalc({ type }) {
    const isHome = type === 'home-loan';
    const [amount, setAmount] = useState(isHome ? 5000000 : 1000000);
    const [rate, setRate] = useState(isHome ? 8.5 : 9);
    const [tenure, setTenure] = useState(isHome ? 20 : 5);

    const r = rate / 12 / 100;
    const n = tenure * 12;
    const emi = r > 0 ? (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : amount / n;
    const total = emi * n;
    const interest = total - amount;

    const pieData = [
        { name: 'Principal Amount', value: amount, color: isHome ? '#2D7A4F' : '#3B82F6' },
        { name: 'Interest Payable', value: Math.round(interest), color: '#E4EDE8' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px]">
                <div className="text-[15px] font-bold text-[#0D1F17] mb-[20px] flex items-center gap-[8px]"><span className="flex items-center justify-center w-[32px] h-[32px] bg-[#E8F5EE] rounded-[8px] text-[#2D7A4F] shrink-0">{isHome ? ICONS.Home : ICONS.Vehicle}</span> {isHome ? 'Home Loan EMI' : 'Car Loan EMI'}</div>
                <SliderField label="Loan Amount" value={amount} setValue={setAmount}
                    min={50000} max={isHome ? 50000000 : 5000000} step={isHome ? 50000 : 10000}
                    minLabel="₹50,000" maxLabel={isHome ? '₹5 Cr' : '₹50 L'} prefix="₹" />
                <SliderField label="Interest Rate (p.a.)" value={rate} setValue={setRate}
                    min={1} max={30} step={0.5}
                    minLabel="1%" maxLabel="30%" suffix="% p.a." />
                <SliderField label="Loan Term" value={tenure} setValue={setTenure}
                    min={1} max={isHome ? 30 : 7} step={1}
                    minLabel="1 Year" maxLabel={isHome ? '30 Years' : '7 Years'} suffix="Years" />
            </div>
            <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] flex flex-col">
                <div className="flex items-start justify-between mb-[18px] pb-[18px] border-b border-[#E4EDE8]">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#8FA99C] mb-[6px]">Monthly EMI</div>
                        <div className="text-[30px] font-bold tracking-[-0.8px] text-[#0D1F17] font-sans">₹{Math.round(emi).toLocaleString('en-IN')}</div>
                        <div className="px-[12px] py-[5px] rounded-[20px] text-[11px] font-bold bg-[#E8F5EE] text-[#2D7A4F] mt-[4px] inline-flex items-center gap-[4px]">@ {rate}% p.a.</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
                    <div className="bg-[#F0F4F1] border border-[#E4EDE8] rounded-[9px] p-[10px_12px]">
                        <div className="text-[11px] text-[#8FA99C] uppercase tracking-[0.5px] font-bold mb-[4px]">Principal Amount</div>
                        <div className="text-[14px] font-bold text-[#0D1F17] tracking-[-0.3px]">₹{amount.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-[#F0F4F1] border border-[#E4EDE8] rounded-[9px] p-[10px_12px]">
                        <div className="text-[11px] text-[#8FA99C] uppercase tracking-[0.5px] font-bold mb-[4px]">Total Interest</div>
                        <div className="text-[14px] font-bold tracking-[-0.3px] text-[#EF4444]">₹{Math.round(interest).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="flex justify-center items-center my-[16px] relative min-h-[160px] [&_svg]:!overflow-visible">
                    <DonutChart
                        data={pieData}
                        height={160}
                        innerR={46}
                        outerR={66}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                    <div className="absolute text-center pointer-events-none z-10">
                        <span className="text-[13px] font-bold text-[#0D1F17] block">{Math.round((amount / total) * 100)}%</span>
                        <span className="text-[10px] text-[#8FA99C] font-bold uppercase tracking-[0.4px] block mt-[1px]">Principal</span>
                    </div>
                </div>
                <div className="flex flex-col gap-[10px] mb-[16px]">
                    {pieData.map(d => (
                        <div key={d.name} className="flex items-center gap-[10px]">
                            <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-[12.5px] text-[#4B6358] flex-1">{d.name}</span>
                            <span className="text-[13px] font-bold text-[#0D1F17] font-sans">₹{d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="h-[1px] bg-[#E4EDE8] my-[4px] mb-[12px]"></div>
                <div className="flex items-center justify-between p-[12px_14px] bg-gradient-to-br from-[#0D1F17] to-[#1a3a28] rounded-[10px]">
                    <span className="text-[12.5px] font-bold text-white/60">Total Amount Payable</span>
                    <span className="text-[16px] font-bold text-[#34D399] font-sans">₹{Math.round(total).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[11px] text-[#8FA99C] text-center mt-[12px] italic">*All amounts are indicative estimates</div>
            </div>
        </div>
    );
}

/* ── SIP Calculator ─────────────────────────────────── */
function SIPCalc() {
    const [monthly, setMonthly] = useState(10000);
    const [rate, setRate] = useState(12);
    const [period, setPeriod] = useState(10);

    const r = rate / 12 / 100;
    const n = period * 12;
    const fv = monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const invested = monthly * n;
    const returns = fv - invested;

    const pieData = [
        { name: 'Invested Amount', value: Math.round(invested), color: '#3B82F6' },
        { name: 'Est. Returns', value: Math.round(returns), color: '#2D7A4F' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px]">
                <div className="text-[15px] font-bold text-[#0D1F17] mb-[20px] flex items-center gap-[8px]"><span className="flex items-center justify-center w-[32px] h-[32px] bg-[#E8F5EE] rounded-[8px] text-[#2D7A4F] shrink-0">{ICONS.chartLine}</span> SIP Calculator</div>
                <SliderField label="Monthly Investment" value={monthly} setValue={setMonthly}
                    min={500} max={200000} step={500}
                    minLabel="₹500" maxLabel="₹2 L" prefix="₹" />
                <SliderField label="Expected Return Rate" value={rate} setValue={setRate}
                    min={1} max={30} step={0.5}
                    minLabel="1%" maxLabel="30%" suffix="% p.a." />
                <SliderField label="Investment Period" value={period} setValue={setPeriod}
                    min={1} max={40} step={1}
                    minLabel="1 Year" maxLabel="40 Years" suffix="Years" />
            </div>
            <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] flex flex-col">
                <div className="flex items-start justify-between mb-[18px] pb-[18px] border-b border-[#E4EDE8]">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#8FA99C] mb-[6px]">Total Value</div>
                        <div className="text-[30px] font-bold tracking-[-0.8px] text-[#0D1F17] font-sans">₹{Math.round(fv).toLocaleString('en-IN')}</div>
                        <div className="px-[12px] py-[5px] rounded-[20px] text-[11px] font-bold bg-[#DBEAFE] text-[#3B82F6] mt-[4px] inline-flex items-center gap-[4px] border border-blue-200" style={{ background: '#E0E7FF', color: '#3B82F6' }}>
                            {((returns / invested) * 100).toFixed(1)}% returns
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
                    <div className="bg-[#F0F4F1] border border-[#E4EDE8] rounded-[9px] p-[10px_12px]">
                        <div className="text-[11px] text-[#8FA99C] uppercase tracking-[0.5px] font-bold mb-[4px]">Amount Invested</div>
                        <div className="text-[14px] font-bold tracking-[-0.3px] text-[#3B82F6]">₹{Math.round(invested).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-[#F0F4F1] border border-[#E4EDE8] rounded-[9px] p-[10px_12px]">
                        <div className="text-[11px] text-[#8FA99C] uppercase tracking-[0.5px] font-bold mb-[4px]">Est. Returns</div>
                        <div className="text-[14px] font-bold tracking-[-0.3px] text-[#2D7A4F]">₹{Math.round(returns).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="flex justify-center items-center my-[16px] relative min-h-[160px] [&_svg]:!overflow-visible">
                    <DonutChart
                        data={pieData}
                        height={160}
                        innerR={46}
                        outerR={66}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                    <div className="absolute text-center pointer-events-none z-10">
                        <span className="text-[13px] font-bold text-[#0D1F17] block">{Math.round((returns / fv) * 100)}%</span>
                        <span className="text-[10px] text-[#8FA99C] font-bold uppercase tracking-[0.4px] block mt-[1px]">Returns</span>
                    </div>
                </div>
                <div className="flex flex-col gap-[10px] mb-[16px]">
                    {pieData.map(d => (
                        <div key={d.name} className="flex items-center gap-[10px]">
                            <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-[12.5px] text-[#4B6358] flex-1">{d.name}</span>
                            <span className="text-[13px] font-bold text-[#0D1F17] font-sans">₹{d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="h-[1px] bg-[#E4EDE8] my-[4px] mb-[12px]"></div>
                <div className="text-[10.5px] text-[#8FA99C] text-center mt-[12px] italic">*All amounts are indicative estimates</div>
            </div>
        </div>
    );
}

/* ── Lumpsum Calculator ─────────────────────────────── */
function LumpsumCalc() {
    const [amount, setAmount] = useState(500000);
    const [rate, setRate] = useState(12);
    const [period, setPeriod] = useState(10);

    const fv = amount * Math.pow(1 + rate / 100, period);
    const returns = fv - amount;

    const pieData = [
        { name: 'Investment', value: amount, color: '#7C3AED' },
        { name: 'Returns', value: Math.round(returns), color: '#2D7A4F' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px]">
                <div className="text-[15px] font-bold text-[#0D1F17] mb-[20px] flex items-center gap-[8px]"><span className="flex items-center justify-center w-[32px] h-[32px] bg-[#E8F5EE] rounded-[8px] text-[#2D7A4F] shrink-0">{ICONS.wallet}</span> Lumpsum Calculator</div>
                <SliderField label="Investment Amount" value={amount} setValue={setAmount}
                    min={10000} max={10000000} step={10000}
                    minLabel="₹10,000" maxLabel="₹1 Cr" prefix="₹" />
                <SliderField label="Expected Return Rate" value={rate} setValue={setRate}
                    min={1} max={30} step={0.5}
                    minLabel="1%" maxLabel="30%" suffix="% p.a." />
                <SliderField label="Investment Period" value={period} setValue={setPeriod}
                    min={1} max={40} step={1}
                    minLabel="1 Year" maxLabel="40 Years" suffix="Years" />
            </div>
            <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] flex flex-col">
                <div className="flex items-start justify-between mb-[18px] pb-[18px] border-b border-[#E4EDE8]">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#8FA99C] mb-[6px]">Total Value</div>
                        <div className="text-[30px] font-bold tracking-[-0.8px] text-[#0D1F17] font-sans">₹{Math.round(fv).toLocaleString('en-IN')}</div>
                        <div className="px-[12px] py-[5px] rounded-[20px] text-[11px] font-bold bg-[#F3E8FF] text-[#7C3AED] mt-[4px] inline-flex items-center gap-[4px] border border-purple-200" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                            {((returns / amount) * 100).toFixed(1)}% growth
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
                    <div className="bg-[#F0F4F1] border border-[#E4EDE8] rounded-[9px] p-[10px_12px]">
                        <div className="text-[11px] text-[#8FA99C] uppercase tracking-[0.5px] font-bold mb-[4px]">Investment</div>
                        <div className="text-[14px] font-bold tracking-[-0.3px] text-[#7C3AED]">₹{amount.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-[#F0F4F1] border border-[#E4EDE8] rounded-[9px] p-[10px_12px]">
                        <div className="text-[11px] text-[#8FA99C] uppercase tracking-[0.5px] font-bold mb-[4px]">Returns</div>
                        <div className="text-[14px] font-bold tracking-[-0.3px] text-[#2D7A4F]">₹{Math.round(returns).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="flex justify-center items-center my-[16px] relative min-h-[160px] [&_svg]:!overflow-visible">
                    <DonutChart
                        data={pieData}
                        height={160}
                        innerR={46}
                        outerR={66}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                    <div className="absolute text-center pointer-events-none z-10">
                        <span className="text-[13px] font-bold text-[#0D1F17] block">{Math.round((returns / fv) * 100)}%</span>
                        <span className="text-[10px] text-[#8FA99C] font-bold uppercase tracking-[0.4px] block mt-[1px]">Returns</span>
                    </div>
                </div>
                <div className="flex flex-col gap-[10px] mb-[16px]">
                    {pieData.map(d => (
                        <div key={d.name} className="flex items-center gap-[10px]">
                            <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-[12px] text-[#4B6358] font-medium flex-1">{d.name}</span>
                            <span className="text-[13px] font-bold text-[#0D1F17] font-sans">₹{d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="h-[1px] bg-[#E4EDE8] my-[4px] mb-[12px]"></div>
                <div className="flex items-center justify-between p-[12px_14px] bg-gradient-to-br from-[#0D1F17] to-[#1a3a28] rounded-[10px]">
                    <span className="text-[12.5px] font-bold text-white/60">Total Corpus Value</span>
                    <span className="text-[16px] font-bold text-[#34D399] font-sans">₹{Math.round(fv).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[10.5px] text-[#8FA99C] text-center mt-[12px] italic">*All amounts are indicative estimates</div>
            </div>
        </div>
    );
}

/* ── Future Value Calculator ────────────────────────── */
function FVCalc() {
    const [currentVal, setCurrentVal] = useState(100000);
    const [rate, setRate] = useState(10);
    const [inflation, setInflation] = useState(6);
    const [period, setPeriod] = useState(10);

    const nominalFV = currentVal * Math.pow(1 + rate / 100, period);
    const realFV = currentVal * Math.pow(1 + (rate - inflation) / 100, period);
    const erosion = nominalFV - realFV;

    const pieData = [
        { name: 'Real Value', value: Math.round(realFV), color: '#2D7A4F' },
        { name: 'Inflation Erosion', value: Math.round(erosion), color: '#EF4444' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px]">
                <div className="text-[15px] font-bold text-[#0D1F17] mb-[20px] flex items-center gap-[8px]"><span className="flex items-center justify-center w-[32px] h-[32px] bg-[#E8F5EE] rounded-[8px] text-[#2D7A4F] shrink-0">{ICONS.trendUp}</span> Future Value Calculator</div>
                <SliderField label="Current Value" value={currentVal} setValue={setCurrentVal}
                    min={10000} max={10000000} step={10000}
                    minLabel="₹10,000" maxLabel="₹1 Cr" prefix="₹" />
                <SliderField label="Expected Return Rate" value={rate} setValue={setRate}
                    min={1} max={30} step={0.5}
                    minLabel="1%" maxLabel="30%" suffix="% p.a." />
                <SliderField label="Inflation Rate" value={inflation} setValue={setInflation}
                    min={1} max={15} step={0.5}
                    minLabel="1%" maxLabel="15%" suffix="% p.a." />
                <SliderField label="Time Period" value={period} setValue={setPeriod}
                    min={1} max={40} step={1}
                    minLabel="1 Year" maxLabel="40 Years" suffix="Years" />
            </div>
            <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] flex flex-col">
                <div className="flex items-start justify-between mb-[18px] pb-[18px] border-b border-[#E4EDE8]">
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#8FA99C] mb-[6px]">Nominal Future Value</div>
                        <div className="text-[30px] font-bold tracking-[-0.8px] text-[#0D1F17] font-sans">₹{Math.round(nominalFV).toLocaleString('en-IN')}</div>
                        <div className="px-[12px] py-[5px] rounded-[20px] text-[11px] font-bold bg-[#CCFBF1] text-[#0F766E] mt-[4px] inline-flex items-center gap-[4px] border border-teal-200" style={{ background: '#CCFBF1', color: '#0F766E' }}>
                            {((nominalFV - currentVal) / currentVal * 100).toFixed(1)}% growth
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
                    <div className="bg-[#F0F4F1] border border-[#E4EDE8] rounded-[9px] p-[10px_12px]">
                        <div className="text-[11px] text-[#8FA99C] uppercase tracking-[0.5px] font-bold mb-[4px]">Real Value</div>
                        <div className="text-[14px] font-bold tracking-[-0.3px] text-[#2D7A4F]">₹{Math.round(realFV).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-[#F0F4F1] border border-[#E4EDE8] rounded-[9px] p-[10px_12px]">
                        <div className="text-[11px] text-[#8FA99C] uppercase tracking-[0.5px] font-bold mb-[4px]">Inflation Erosion</div>
                        <div className="text-[14px] font-bold tracking-[-0.3px] text-[#EF4444]">₹{Math.round(erosion).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="flex justify-center items-center my-[16px] relative min-h-[160px] [&_svg]:!overflow-visible">
                    <DonutChart
                        data={pieData}
                        height={160}
                        innerR={46}
                        outerR={66}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                    <div className="absolute text-center pointer-events-none z-10">
                        <span className="text-[13px] font-bold text-[#0D1F17] block">{Math.round((realFV / nominalFV) * 100)}%</span>
                        <span className="text-[10px] text-[#8FA99C] font-bold uppercase tracking-[0.4px] block mt-[1px]">Real Value</span>
                    </div>
                </div>
                <div className="flex flex-col gap-[10px] mb-[16px]">
                    {pieData.map(d => (
                        <div key={d.name} className="flex items-center gap-[10px]">
                            <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-[12.5px] text-[#4B6358] flex-1">{d.name}</span>
                            <span className="text-[13px] font-bold text-[#0D1F17] font-sans">₹{d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="h-[1px] bg-[#E4EDE8] my-[4px] mb-[12px]"></div>
                <div className="flex items-center justify-between p-[12px_14px] bg-gradient-to-br from-[#0D1F17] to-[#1a3a28] rounded-[10px]">
                    <span className="text-[12.5px] font-bold text-white/60">Purchasing Power Erosion</span>
                    <span className="text-[16px] font-bold text-[#34D399] font-sans">{((erosion / nominalFV) * 100).toFixed(1)}%</span>
                </div>
                <div className="text-[11px] text-[#8FA99C] text-center mt-[12px] italic">*All amounts are indicative estimates</div>
            </div>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────── */
export default function CalculatorsPage() {
    const [activeCalc, setActiveCalc] = useState('home-loan');

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto flex flex-col gap-[18px] text-[#0D1F17] pb-[20px]">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[22px] font-bold text-[#0D1F17]">Calculators</div>
                        <div className="text-[12.5px] text-[#8FA99C] mt-[2px]">Plan smarter with financial calculators — all results are indicative</div>
                    </div>
                </div>

                <div className="bg-white border border-[#E4EDE8] rounded-[12px] p-[5px] flex gap-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-x-auto scrollbar-hide">
                    {calculators.map(c => (
                        <button
                            key={c.key}
                            className={`flex-1 flex items-center justify-center gap-[7px] py-[10px] px-[16px] rounded-[9px] border-none text-[13px] font-bold cursor-pointer transition-all duration-150 whitespace-nowrap ${
                                activeCalc === c.key
                                    ? 'bg-[#2D7A4F] text-white shadow-sm'
                                    : 'bg-transparent text-[#8FA99C] hover:bg-[#F0F4F1] hover:text-[#2D7A4F]'
                            }`}
                            onClick={() => setActiveCalc(c.key)}
                        >
                            <span className="text-[15px]">{c.icon}</span>
                            {c.label}
                        </button>
                    ))}
                </div>

                {(activeCalc === 'home-loan' || activeCalc === 'car-loan') && <EMICalc type={activeCalc} />}
                {activeCalc === 'sip' && <SIPCalc />}
                {activeCalc === 'lumpsum' && <LumpsumCalc />}
                {activeCalc === 'future-value' && <FVCalc />}
            </div>
        </div>
    );
}
