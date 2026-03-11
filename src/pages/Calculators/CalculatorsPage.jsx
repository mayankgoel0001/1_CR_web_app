import { useState } from 'react';
import { ICONS } from '../../utils/icons';
import { formatCurrency } from '../../data/mockData';
import DonutChart from '../../components/Charts/DonutChart';
import './CalculatorsPage.css';

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
        <div className="input-group">
            <div className="ig-top">
                <div className="ig-label">{label}</div>
                <div className="ig-controls">
                    <button className="ig-btn" onClick={() => setValue(clamp(value - step))}>−</button>
                    <div className="ig-sep"></div>
                    {prefix && <span className="calc-prefix">{prefix}</span>}
                    <input
                        type="number"
                        className="ig-input"
                        value={value}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                    />
                    <div className="ig-sep"></div>
                    {suffix && <div className="ig-unit">{suffix}</div>}
                    <button className="ig-btn" onClick={() => setValue(clamp(value + step))}>+</button>
                </div>
            </div>
            <div className="ig-range-wrap" style={{ '--pct': pct }}>
                <input
                    type="range"
                    className="ig-range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                />
            </div>
            <div className="ig-range-labels"><span className="ig-range-label">{minLabel}</span><span className="ig-range-label">{maxLabel}</span></div>
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
        <div className="calc-panel">
            <div className="input-card">
                <div className="input-card-title"><span className="input-card-icon">{isHome ? ICONS.Home : ICONS.Vehicle}</span> {isHome ? 'Home Loan EMI' : 'Car Loan EMI'}</div>
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
            <div className="result-card">
                <div className="result-hero">
                    <div>
                        <div className="result-hero-label">Monthly EMI</div>
                        <div className="result-hero-value">₹{Math.round(emi).toLocaleString('en-IN')}</div>
                        <div className="result-hero-badge">@ {rate}% p.a.</div>
                    </div>
                </div>
                <div className="result-stats">
                    <div className="result-stat">
                        <div className="result-stat-label">Principal Amount</div>
                        <div className="result-stat-val">₹{amount.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="result-stat">
                        <div className="result-stat-label">Total Interest</div>
                        <div className="result-stat-val red">₹{Math.round(interest).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="donut-wrap">
                    <DonutChart
                        data={pieData}
                        height={160}
                        innerR={46}
                        outerR={66}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                    <div className="donut-center-label">
                        <span className="donut-center-val">{Math.round((amount / total) * 100)}%</span>
                        <span className="donut-center-sub">Principal</span>
                    </div>
                </div>
                <div className="result-legend">
                    {pieData.map(d => (
                        <div key={d.name} className="legend-row">
                            <span className="legend-dot" style={{ background: d.color }} />
                            <span className="legend-label">{d.name}</span>
                            <span className="legend-val">₹{d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="result-divider"></div>
                <div className="result-total-row">
                    <span className="result-total-label">Total Amount Payable</span>
                    <span className="result-total-val">₹{Math.round(total).toLocaleString('en-IN')}</span>
                </div>
                <div className="result-note">*All amounts are indicative estimates</div>
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
        <div className="calc-panel">
            <div className="input-card">
                <div className="input-card-title"><span className="input-card-icon">{ICONS.chartLine}</span> SIP Calculator</div>
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
            <div className="result-card">
                <div className="result-hero">
                    <div>
                        <div className="result-hero-label">Total Value</div>
                        <div className="result-hero-value">₹{Math.round(fv).toLocaleString('en-IN')}</div>
                        <div className="result-hero-badge" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
                            {((returns / invested) * 100).toFixed(1)}% returns
                        </div>
                    </div>
                </div>
                <div className="result-stats">
                    <div className="result-stat">
                        <div className="result-stat-label">Amount Invested</div>
                        <div className="result-stat-val blue">₹{Math.round(invested).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="result-stat">
                        <div className="result-stat-label">Est. Returns</div>
                        <div className="result-stat-val green">₹{Math.round(returns).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="donut-wrap">
                    <DonutChart
                        data={pieData}
                        height={160}
                        innerR={46}
                        outerR={66}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                    <div className="donut-center-label">
                        <span className="donut-center-val">{Math.round((returns / fv) * 100)}%</span>
                        <span className="donut-center-sub">Returns</span>
                    </div>
                </div>
                <div className="result-legend">
                    {pieData.map(d => (
                        <div key={d.name} className="legend-row">
                            <span className="legend-dot" style={{ background: d.color }} />
                            <span className="legend-label">{d.name}</span>
                            <span className="legend-val">₹{d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="result-divider"></div>
                <div className="result-total-row">
                    <span className="result-total-label">Total Corpus Value</span>
                    <span className="result-total-val">₹{Math.round(fv).toLocaleString('en-IN')}</span>
                </div>
                <div className="result-note">*All amounts are indicative estimates</div>
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
        <div className="calc-panel">
            <div className="input-card">
                <div className="input-card-title"><span className="input-card-icon">{ICONS.wallet}</span> Lumpsum Calculator</div>
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
            <div className="result-card">
                <div className="result-hero">
                    <div>
                        <div className="result-hero-label">Total Value</div>
                        <div className="result-hero-value">₹{Math.round(fv).toLocaleString('en-IN')}</div>
                        <div className="result-hero-badge" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
                            {((returns / amount) * 100).toFixed(1)}% growth
                        </div>
                    </div>
                </div>
                <div className="result-stats">
                    <div className="result-stat">
                        <div className="result-stat-label">Investment</div>
                        <div className="result-stat-val purple">₹{amount.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="result-stat">
                        <div className="result-stat-label">Returns</div>
                        <div className="result-stat-val green">₹{Math.round(returns).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="donut-wrap">
                    <DonutChart
                        data={pieData}
                        height={160}
                        innerR={46}
                        outerR={66}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                    <div className="donut-center-label">
                        <span className="donut-center-val">{Math.round((returns / fv) * 100)}%</span>
                        <span className="donut-center-sub">Returns</span>
                    </div>
                </div>
                <div className="result-legend">
                    {pieData.map(d => (
                        <div key={d.name} className="legend-row">
                            <span className="legend-dot" style={{ background: d.color }} />
                            <span className="legend-label">{d.name}</span>
                            <span className="legend-val">₹{d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="result-divider"></div>
                <div className="result-total-row">
                    <span className="result-total-label">Total Corpus Value</span>
                    <span className="result-total-val">₹{Math.round(fv).toLocaleString('en-IN')}</span>
                </div>
                <div className="result-note">*All amounts are indicative estimates</div>
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
        <div className="calc-panel">
            <div className="input-card">
                <div className="input-card-title"><span className="input-card-icon">{ICONS.trendUp}</span> Future Value Calculator</div>
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
            <div className="result-card">
                <div className="result-hero">
                    <div>
                        <div className="result-hero-label">Nominal Future Value</div>
                        <div className="result-hero-value">₹{Math.round(nominalFV).toLocaleString('en-IN')}</div>
                        <div className="result-hero-badge" style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}>
                            {((nominalFV - currentVal) / currentVal * 100).toFixed(1)}% growth
                        </div>
                    </div>
                </div>
                <div className="result-stats">
                    <div className="result-stat">
                        <div className="result-stat-label">Real Value</div>
                        <div className="result-stat-val green">₹{Math.round(realFV).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="result-stat">
                        <div className="result-stat-label">Inflation Erosion</div>
                        <div className="result-stat-val red">₹{Math.round(erosion).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="donut-wrap">
                    <DonutChart
                        data={pieData}
                        height={160}
                        innerR={46}
                        outerR={66}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                    <div className="donut-center-label">
                        <span className="donut-center-val">{Math.round((realFV / nominalFV) * 100)}%</span>
                        <span className="donut-center-sub">Real Value</span>
                    </div>
                </div>
                <div className="result-legend">
                    {pieData.map(d => (
                        <div key={d.name} className="legend-row">
                            <span className="legend-dot" style={{ background: d.color }} />
                            <span className="legend-label">{d.name}</span>
                            <span className="legend-val">₹{d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="result-divider"></div>
                <div className="result-total-row">
                    <span className="result-total-label">Purchasing Power Erosion</span>
                    <span className="result-total-val">{((erosion / nominalFV) * 100).toFixed(1)}%</span>
                </div>
                <div className="result-note">*All amounts are indicative estimates</div>
            </div>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────── */
export default function CalculatorsPage() {
    const [activeCalc, setActiveCalc] = useState('home-loan');

    return (
        <div className="calc-page">
            <div className="calc-content">
                <div className="calc-page-header">
                    <div>
                        <div className="calc-page-title">Calculators</div>
                        <div className="calc-page-sub">Plan smarter with financial calculators — all results are indicative</div>
                    </div>
                </div>

                <div className="calc-tabs">
                    {calculators.map(c => (
                        <button
                            key={c.key}
                            className={`calc-tab ${activeCalc === c.key ? 'active' : ''}`}
                            onClick={() => setActiveCalc(c.key)}
                        >
                            {c.icon}
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
