import { useState } from 'react';
import { MdHome, MdDirectionsCar, MdShowChart, MdAccountBalance, MdTrendingUp, MdAdd, MdRemove } from 'react-icons/md';
import { formatCurrency } from '../../data/mockData';
import DonutChart from '../../components/Charts/DonutChart';
import './CalculatorsPage.css';

const calculators = [
    { key: 'home-loan', label: 'Home Loan EMI', icon: MdHome },
    { key: 'car-loan', label: 'Car Loan EMI', icon: MdDirectionsCar },
    { key: 'sip', label: 'SIP Calculator', icon: MdShowChart },
    { key: 'lumpsum', label: 'Lumpsum', icon: MdAccountBalance },
    { key: 'future-value', label: 'Future Value', icon: MdTrendingUp },
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

    return (
        <div className="calc-slider-field">
            <div className="calc-slider-header">
                <span className="calc-slider-label">{label}</span>
                <div className="calc-slider-controls">
                    <button className="calc-pm-btn" onClick={() => setValue(clamp(value - step))}><MdRemove /></button>
                    <div className="calc-slider-val-box">
                        {prefix && <span className="calc-prefix">{prefix}</span>}
                        <input
                            type="number"
                            className="calc-slider-input"
                            value={value}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                        />
                        {suffix && <span className="calc-suffix">{suffix}</span>}
                    </div>
                    <button className="calc-pm-btn" onClick={() => setValue(clamp(value + step))}><MdAdd /></button>
                </div>
            </div>
            <input
                type="range"
                className="calc-range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
            />
            <div className="calc-range-labels"><span>{minLabel}</span><span>{maxLabel}</span></div>
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
        { name: 'Principal Amount', value: amount, color: '#8B1A4A' },
        { name: 'Interest Payable', value: Math.round(interest), color: '#D4D4D8' },
    ];

    return (
        <div className="calc-inline-grid">
            <div className="calc-form-panel card">
                <SliderField label="Loan Amount" value={amount} setValue={setAmount}
                    min={50000} max={isHome ? 50000000 : 5000000} step={50000}
                    minLabel="₹50,000" maxLabel={isHome ? '₹5,00,00,000' : '₹50,00,000'} prefix="₹" />
                <SliderField label="Interest Rate(p.a)" value={rate} setValue={setRate}
                    min={1} max={30} step={0.1}
                    minLabel="1%" maxLabel="30%" suffix="%" />
                <SliderField label="Loan Term" value={tenure} setValue={setTenure}
                    min={1} max={isHome ? 30 : 7} step={1}
                    minLabel="1 Year" maxLabel={isHome ? '30 Years' : '7 Years'} suffix="Years" />
            </div>
            <div className="calc-result-panel card">
                <div className="calc-result-row highlight">
                    <span>EMI Amount</span>
                    <span className="val">₹ {Math.round(emi).toLocaleString('en-IN')}</span>
                </div>
                <div className="calc-donut-wrap">
                    <DonutChart
                        data={pieData}
                        height={220}
                        innerR={55}
                        outerR={80}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                </div>
                <div className="calc-legend">
                    {pieData.map(d => (
                        <div key={d.name} className="calc-legend-item">
                            <span className="calc-legend-dot" style={{ background: d.color }} />
                            <span className="calc-legend-label">{d.name}</span>
                            <span className="calc-legend-val">₹ {d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="calc-result-row total">
                    <span>Total Amount Payable</span>
                    <span className="val">₹ {Math.round(total).toLocaleString('en-IN')}</span>
                </div>
                <p className="calc-disclaimer">*All the amounts are indicative</p>
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
        { name: 'Invested Amount', value: Math.round(invested), color: '#2563EB' },
        { name: 'Est. Returns', value: Math.round(returns), color: '#16A34A' },
    ];

    return (
        <div className="calc-inline-grid">
            <div className="calc-form-panel card">
                <SliderField label="Monthly Investment" value={monthly} setValue={setMonthly}
                    min={500} max={200000} step={500}
                    minLabel="₹500" maxLabel="₹2,00,000" prefix="₹" />
                <SliderField label="Expected Return Rate" value={rate} setValue={setRate}
                    min={1} max={30} step={0.5}
                    minLabel="1%" maxLabel="30%" suffix="%" />
                <SliderField label="Investment Period" value={period} setValue={setPeriod}
                    min={1} max={40} step={1}
                    minLabel="1 Year" maxLabel="40 Years" suffix="Years" />
            </div>
            <div className="calc-result-panel card">
                <div className="calc-result-row highlight">
                    <span>Total Value</span>
                    <span className="val">₹ {Math.round(fv).toLocaleString('en-IN')}</span>
                </div>
                <div className="calc-donut-wrap">
                    <DonutChart
                        data={pieData}
                        height={220}
                        innerR={55}
                        outerR={80}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                </div>
                <div className="calc-legend">
                    {pieData.map(d => (
                        <div key={d.name} className="calc-legend-item">
                            <span className="calc-legend-dot" style={{ background: d.color }} />
                            <span className="calc-legend-label">{d.name}</span>
                            <span className="calc-legend-val">₹ {d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="calc-result-row total">
                    <span>Return Percentage</span>
                    <span className="val">{((returns / invested) * 100).toFixed(1)}%</span>
                </div>
                <p className="calc-disclaimer">*All the amounts are indicative</p>
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
        { name: 'Investment', value: amount, color: '#8B5CF6' },
        { name: 'Returns', value: Math.round(returns), color: '#16A34A' },
    ];

    return (
        <div className="calc-inline-grid">
            <div className="calc-form-panel card">
                <SliderField label="Investment Amount" value={amount} setValue={setAmount}
                    min={10000} max={10000000} step={10000}
                    minLabel="₹10,000" maxLabel="₹1,00,00,000" prefix="₹" />
                <SliderField label="Expected Return Rate" value={rate} setValue={setRate}
                    min={1} max={30} step={0.5}
                    minLabel="1%" maxLabel="30%" suffix="%" />
                <SliderField label="Investment Period" value={period} setValue={setPeriod}
                    min={1} max={40} step={1}
                    minLabel="1 Year" maxLabel="40 Years" suffix="Years" />
            </div>
            <div className="calc-result-panel card">
                <div className="calc-result-row highlight">
                    <span>Total Value</span>
                    <span className="val">₹ {Math.round(fv).toLocaleString('en-IN')}</span>
                </div>
                <div className="calc-donut-wrap">
                    <DonutChart
                        data={pieData}
                        height={220}
                        innerR={55}
                        outerR={80}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                </div>
                <div className="calc-legend">
                    {pieData.map(d => (
                        <div key={d.name} className="calc-legend-item">
                            <span className="calc-legend-dot" style={{ background: d.color }} />
                            <span className="calc-legend-label">{d.name}</span>
                            <span className="calc-legend-val">₹ {d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="calc-result-row total">
                    <span>Growth</span>
                    <span className="val">{((returns / amount) * 100).toFixed(1)}%</span>
                </div>
                <p className="calc-disclaimer">*All the amounts are indicative</p>
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
        { name: 'Real Value', value: Math.round(realFV), color: '#16A34A' },
        { name: 'Inflation Erosion', value: Math.round(erosion), color: '#EF4444' },
    ];

    return (
        <div className="calc-inline-grid">
            <div className="calc-form-panel card">
                <SliderField label="Current Value" value={currentVal} setValue={setCurrentVal}
                    min={10000} max={10000000} step={10000}
                    minLabel="₹10,000" maxLabel="₹1,00,00,000" prefix="₹" />
                <SliderField label="Expected Return Rate" value={rate} setValue={setRate}
                    min={1} max={30} step={0.5}
                    minLabel="1%" maxLabel="30%" suffix="%" />
                <SliderField label="Inflation Rate" value={inflation} setValue={setInflation}
                    min={1} max={15} step={0.5}
                    minLabel="1%" maxLabel="15%" suffix="%" />
                <SliderField label="Time Period" value={period} setValue={setPeriod}
                    min={1} max={40} step={1}
                    minLabel="1 Year" maxLabel="40 Years" suffix="Years" />
            </div>
            <div className="calc-result-panel card">
                <div className="calc-result-row highlight">
                    <span>Nominal Value</span>
                    <span className="val">₹ {Math.round(nominalFV).toLocaleString('en-IN')}</span>
                </div>
                <div className="calc-donut-wrap">
                    <DonutChart
                        data={pieData}
                        height={220}
                        innerR={55}
                        outerR={80}
                        colors={pieData.map(d => d.color)}
                        tooltipFmt={v => formatCurrency(v)}
                        hideLegend
                    />
                </div>
                <div className="calc-legend">
                    {pieData.map(d => (
                        <div key={d.name} className="calc-legend-item">
                            <span className="calc-legend-dot" style={{ background: d.color }} />
                            <span className="calc-legend-label">{d.name}</span>
                            <span className="calc-legend-val">₹ {d.value.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="calc-result-row total">
                    <span>Purchasing Power Erosion</span>
                    <span className="val">{((erosion / nominalFV) * 100).toFixed(1)}%</span>
                </div>
                <p className="calc-disclaimer">*All the amounts are indicative</p>
            </div>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────── */
export default function CalculatorsPage() {
    const [activeCalc, setActiveCalc] = useState('home-loan');

    const activeObj = calculators.find(c => c.key === activeCalc);

    return (
        <div className="calc-page">
            <div className="page-header" style={{ textAlign: 'center' }}>
                <h1>{activeObj.label}</h1>
            </div>

            <div className="calc-tabs-bar">
                {calculators.map(c => (
                    <button
                        key={c.key}
                        className={`calc-tab-btn ${activeCalc === c.key ? 'active' : ''}`}
                        onClick={() => setActiveCalc(c.key)}
                    >
                        <c.icon className="calc-tab-icon" />
                        {c.label}
                    </button>
                ))}
            </div>

            {(activeCalc === 'home-loan' || activeCalc === 'car-loan') && <EMICalc type={activeCalc} />}
            {activeCalc === 'sip' && <SIPCalc />}
            {activeCalc === 'lumpsum' && <LumpsumCalc />}
            {activeCalc === 'future-value' && <FVCalc />}
        </div>
    );
}
