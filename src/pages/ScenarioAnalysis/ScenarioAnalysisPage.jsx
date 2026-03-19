import { useState } from 'react';
import { ICONS } from '../../utils/icons';

const scenarios = [
    { key: 'debt', label: 'Debt Payoff', icon: ICONS.creditCard, desc: 'Compare debt repayment strategies', fields: [{ name: 'totalDebt', label: 'Total Debt Amount (₹)', defaultValue: 500000 }, { name: 'interestRate', label: 'Interest Rate (Annual %)', defaultValue: 12 }, { name: 'monthlyPayment', label: 'Monthly Payment (₹)', defaultValue: 15000 }], strategies: [{ key: 'avalanche', name: 'Avalanche Method', desc: 'Pay highest interest rate first (saves more money)' }, { key: 'snowball', name: 'Snowball Method', desc: 'Pay smallest balance first (quick wins)' }], results: { timeToPayoff: '38 months', totalInterest: '₹1,23,500', totalPaid: '₹6,23,500', monthlySavings: '₹3,200' } },
    { key: 'emergency', label: 'Emergency Fund', icon: ICONS.shield, desc: 'Calculate time to build emergency fund', fields: [{ name: 'monthlyExpenses', label: 'Monthly Expenses (₹)', defaultValue: 60000 }, { name: 'currentSavings', label: 'Current Emergency Savings (₹)', defaultValue: 100000 }, { name: 'monthlySaving', label: 'Monthly Savings Contribution (₹)', defaultValue: 15000 }], strategies: [{ key: '3months', name: '3 Months Coverage', desc: 'Recommended for stable income jobs' }, { key: '6months', name: '6 Months Coverage', desc: 'Recommended for variable income' }], results: { targetAmount: '₹3,60,000', gap: '₹2,60,000', monthsToReach: '18 months', projectedDate: 'Sep 2027' } },
    { key: 'investment', label: 'Investment', icon: ICONS.chartLine, desc: 'Project investment growth with risk tolerance', fields: [{ name: 'initialInvestment', label: 'Initial Investment (₹)', defaultValue: 100000 }, { name: 'monthlyContribution', label: 'Monthly Contribution (₹)', defaultValue: 10000 }, { name: 'period', label: 'Investment Period (years)', defaultValue: 10 }], strategies: [{ key: 'conservative', name: 'Conservative', desc: '5% return, lower risk, stable growth' }, { key: 'moderate', name: 'Moderate', desc: '8% return, balanced risk and growth' }, { key: 'aggressive', name: 'Aggressive', desc: '12% return, higher risk, maximum growth' }], results: { projectedValue: '₹23,40,000', totalInvested: '₹13,00,000', totalReturns: '₹10,40,000', cagr: '8%' } },
    { key: 'purchase', label: 'Major Purchase', icon: ICONS.wallet, desc: 'Analyze affordability of a large purchase', fields: [{ name: 'purchasePrice', label: 'Purchase Price (₹)', defaultValue: 2000000 }, { name: 'downPayment', label: 'Down Payment (₹)', defaultValue: 400000 }, { name: 'monthlyIncome', label: 'Monthly Income (₹)', defaultValue: 100000 }], strategies: [{ key: 'cash', name: 'Pay Cash', desc: 'Use savings, no interest charges' }, { key: 'loan', name: 'Finance with Loan', desc: '5% APR over 5 years' }], results: { affordabilityScore: '72/100', monthlyImpact: '₹32,000/mo', recommendation: 'Moderate — Consider saving more for down payment', loanEMI: '₹30,200/mo' } },
];

const inputCls = "w-full border border-border rounded-[9px] px-[12px] py-[8px] text-[13px] font-bold text-[#0D1F17] bg-white outline-none font-sans focus:border-[#2D7A4F] transition-all duration-200";

export default function ScenarioAnalysisPage() {
    const [activeTab, setActiveTab] = useState('debt');
    const scenario = scenarios.find(s => s.key === activeTab);
    const [selectedStrategy, setSelectedStrategy] = useState(scenario.strategies[0].key);

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSelectedStrategy(scenarios.find(sc => sc.key === key).strategies[0].key);
    };

    return (
        <div className="flex flex-col gap-[18px] h-full overflow-hidden">
            <div className="mb-0">
                <h1 className="text-[22px] font-bold text-[#0D1F17]">Scenario Analysis</h1>
                <p className="text-[12.5px] text-[#8FA99C] mt-[2px]">Model financial decisions and compare strategies</p>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-[#E4EDE8] rounded-[12px] p-[5px] flex gap-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-x-auto scrollbar-hide">
                {scenarios.map(s => (
                    <button 
                        key={s.key} 
                        onClick={() => handleTabChange(s.key)}
                        className={`flex-1 flex items-center justify-center gap-[7px] py-[10px] px-[8px] rounded-[9px] text-[13px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap
                            ${activeTab === s.key ? 'bg-[#2D7A4F] text-white shadow-sm' : 'bg-transparent text-[#8FA99C] hover:bg-[#F0F4F1] hover:text-[#2D7A4F]'}`}
                    >
                        <span className="text-[15px]">{s.icon}</span>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_470px] gap-[16px] items-start pb-[20px]">
                {/* Inputs Card */}
                <div className="bg-white rounded-[14px] border border-[#E4EDE8] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] flex flex-col gap-[20px]">
                    <div>
                        <h3 className="text-[15px] font-bold text-[#0D1F17] mb-[4px] m-0">{scenario.label}</h3>
                        <p className="text-[12.5px] text-[#8FA99C] m-0">{scenario.desc}</p>
                    </div>

                    <div className="flex flex-col gap-[16px]">
                        {scenario.fields.map(f => (
                            <div key={f.name} className="flex flex-col gap-[8px]">
                                <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1">{f.label}</label>
                                <input type="number" defaultValue={f.defaultValue} className="w-full border border-[#E4EDE8] rounded-[9px] px-[12px] py-[10px] text-[13px] font-bold text-[#0D1F17] bg-white outline-none focus:border-[#2D7A4F] transition-all" />
                            </div>
                        ))}
                        
                        <div className="flex flex-col gap-[8px]">
                            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1">Strategy</label>
                            <div className="flex flex-col gap-[10px]">
                                {scenario.strategies.map(s => (
                                    <div key={s.key} onClick={() => setSelectedStrategy(s.key)}
                                        className={`flex justify-between items-center p-[12px] rounded-[10px] border cursor-pointer transition-all duration-150
                                            ${selectedStrategy === s.key ? 'border-[#2D7A4F] bg-[#E8F5EE]' : 'border-[#E4EDE8] hover:border-[#2D7A4F] bg-white'}`}>
                                        <div>
                                            <h5 className="text-[13px] font-bold text-[#0D1F17] m-0">{s.name}</h5>
                                            <p className="text-[12px] text-[#8FA99C] mt-[2px] m-0">{s.desc}</p>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-150 ${selectedStrategy === s.key ? 'border-[#2D7A4F] bg-[#2D7A4F]' : 'border-[#D1D5DB] bg-white'}`}>
                                            {selectedStrategy === s.key && <div className="w-[6px] h-[6px] rounded-full bg-white shadow-sm" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-[#2D7A4F] text-white rounded-[10px] py-[12px] text-[13px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#256341] hover:-translate-y-px shadow-sm mt-2">
                        Calculate
                    </button>
                </div>

                {/* Results Card */}
                <div className="bg-white rounded-[14px] border border-[#E4EDE8] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] flex flex-col">
                    <h3 className="text-[15px] font-bold text-[#0D1F17] mb-[20px]">Analysis Results</h3>
                    <div className="flex flex-col gap-0 divide-y divide-[#F0F4F1]">
                        {Object.entries(scenario.results).map(([key, val]) => (
                            <div key={key} className="flex justify-between items-start gap-4 py-[14px] first:pt-0 last:pb-0">
                                <span className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.4px] shrink-0 pt-0.5">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                                <span className="text-[13px] font-bold text-[#0D1F17] text-right">{val}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-[24px] bg-[#E8F5EE] border border-[#C5E8D1] rounded-[10px] p-[16px]">
                        <div className="text-[11px] font-bold text-[#2D7A4F] uppercase tracking-[0.6px] mb-[6px]">Insight</div>
                        <p className="text-[13px] text-[#0D1F17] leading-relaxed m-0 italic">
                            Pro Tip: switching to the Avalanche method could save you up to <strong className="text-[#2D7A4F]">₹12,400</strong> in total interest.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
