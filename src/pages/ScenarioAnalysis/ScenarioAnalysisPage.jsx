import { useState } from 'react';
import { formatCurrency } from '../../data/mockData';
import { ICONS } from '../../utils/icons';
import './ScenarioAnalysisPage.css';

const scenarios = [
    {
        key: 'debt',
        label: 'Debt Payoff',
        icon: ICONS.creditCard,
        desc: 'Compare debt repayment strategies',
        fields: [
            { name: 'totalDebt', label: 'Total Debt Amount (₹)', defaultValue: 500000 },
            { name: 'interestRate', label: 'Interest Rate (Annual %)', defaultValue: 12 },
            { name: 'monthlyPayment', label: 'Monthly Payment (₹)', defaultValue: 15000 },
        ],
        strategies: [
            { key: 'avalanche', name: 'Avalanche Method', desc: 'Pay highest interest rate first (saves more money)' },
            { key: 'snowball', name: 'Snowball Method', desc: 'Pay smallest balance first (quick wins)' },
        ],
        results: { timeToPayoff: '38 months', totalInterest: '₹1,23,500', totalPaid: '₹6,23,500', monthlySavings: '₹3,200' },
    },
    {
        key: 'emergency',
        label: 'Emergency Fund',
        icon: ICONS.shield,
        desc: 'Calculate time to build emergency fund',
        fields: [
            { name: 'monthlyExpenses', label: 'Monthly Expenses (₹)', defaultValue: 60000 },
            { name: 'currentSavings', label: 'Current Emergency Savings (₹)', defaultValue: 100000 },
            { name: 'monthlySaving', label: 'Monthly Savings Contribution (₹)', defaultValue: 15000 },
        ],
        strategies: [
            { key: '3months', name: '3 Months Coverage', desc: 'Recommended for stable income jobs' },
            { key: '6months', name: '6 Months Coverage', desc: 'Recommended for variable income' },
        ],
        results: { targetAmount: '₹3,60,000', gap: '₹2,60,000', monthsToReach: '18 months', projectedDate: 'Sep 2027' },
    },
    {
        key: 'investment',
        label: 'Investment',
        icon: ICONS.chartLine,
        desc: 'Project investment growth with risk tolerance',
        fields: [
            { name: 'initialInvestment', label: 'Initial Investment (₹)', defaultValue: 100000 },
            { name: 'monthlyContribution', label: 'Monthly Contribution (₹)', defaultValue: 10000 },
            { name: 'period', label: 'Investment Period (years)', defaultValue: 10 },
        ],
        strategies: [
            { key: 'conservative', name: 'Conservative', desc: '5% return, lower risk, stable growth' },
            { key: 'moderate', name: 'Moderate', desc: '8% return, balanced risk and growth' },
            { key: 'aggressive', name: 'Aggressive', desc: '12% return, higher risk, maximum growth' },
        ],
        results: { projectedValue: '₹23,40,000', totalInvested: '₹13,00,000', totalReturns: '₹10,40,000', cagr: '8%' },
    },
    {
        key: 'purchase',
        label: 'Major Purchase',
        icon: ICONS.wallet,
        desc: 'Analyze affordability of a large purchase',
        fields: [
            { name: 'purchasePrice', label: 'Purchase Price (₹)', defaultValue: 2000000 },
            { name: 'downPayment', label: 'Down Payment (₹)', defaultValue: 400000 },
            { name: 'monthlyIncome', label: 'Monthly Income (₹)', defaultValue: 100000 },
        ],
        strategies: [
            { key: 'cash', name: 'Pay Cash', desc: 'Use savings, no interest charges' },
            { key: 'loan', name: 'Finance with Loan', desc: '5% APR over 5 years' },
        ],
        results: { affordabilityScore: '72/100', monthlyImpact: '₹32,000/mo', recommendation: 'Moderate — Consider saving more for down payment', loanEMI: '₹30,200/mo' },
    },
];

export default function ScenarioAnalysisPage() {
    const [activeTab, setActiveTab] = useState('debt');
    const scenario = scenarios.find(s => s.key === activeTab);
    const [selectedStrategy, setSelectedStrategy] = useState(scenario.strategies[0].key);

    const handleTabChange = (key) => {
        setActiveTab(key);
        const s = scenarios.find(sc => sc.key === key);
        setSelectedStrategy(s.strategies[0].key);
    };

    return (
        <div className="scenario-page">
            <div className="page-header">
                <h1>Scenario Analysis</h1>
                <p>Model financial decisions and compare strategies</p>
            </div>

            <div className="scenario-tabs">
                {scenarios.map(s => (
                    <button
                        key={s.key}
                        className={`scenario-tab ${activeTab === s.key ? 'active' : ''}`}
                        onClick={() => handleTabChange(s.key)}
                    >
                        {s.icon}{s.label}
                    </button>
                ))}
            </div>

            <div className="scenario-content">
                <div className="scenario-inputs card">
                    <h3>{scenario.label}</h3>
                    <p className="desc">{scenario.desc}</p>

                    {scenario.fields.map(f => (
                        <div key={f.name} className="scenario-field">
                            <label>{f.label}</label>
                            <input type="number" defaultValue={f.defaultValue} />
                        </div>
                    ))}

                    <div className="scenario-field">
                        <label>Strategy</label>
                        <div className="scenario-radios">
                            {scenario.strategies.map(s => (
                                <div
                                    key={s.key}
                                    className={`scenario-radio ${selectedStrategy === s.key ? 'selected' : ''}`}
                                    onClick={() => setSelectedStrategy(s.key)}
                                >
                                    <div className="scenario-radio-info">
                                        <h5>{s.name}</h5>
                                        <p>{s.desc}</p>
                                    </div>
                                    <input type="radio" name="strategy" checked={selectedStrategy === s.key} readOnly />
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                        Calculate
                    </button>
                </div>

                <div className="scenario-results card">
                    <h3>Analysis Results</h3>
                    {Object.entries(scenario.results).map(([key, val]) => (
                        <div key={key} className="result-item">
                            <span className="label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                            <span className="value">{val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
