import React, { useState } from 'react';
import { insurancePolicies } from '../../data/mockData';
import { ICONS, getInsuranceIcon } from '../../utils/icons';
import KPICard from '../../components/common/KPICard';

const formatLakhs = (amount) => amount >= 100000 ? '₹' + (amount / 100000) + 'L' : '₹' + amount.toLocaleString('en-IN');
const formatCurrency = (amount) => '₹' + amount.toLocaleString('en-IN');

const typeColors = {
    life: { pill: 'bg-[#F3E8FF] text-[#7C3AED]', icon: 'bg-[#F3E8FF] text-[#7C3AED]', border: '#A78BFA' },
    health: { pill: 'bg-[#FFF1F2] text-[#E11D48]', icon: 'bg-[#FFF1F2] text-[#E11D48]', border: '#FCA5A5' },
    vehicle: { pill: 'bg-[#EFF6FF] text-[#2563EB]', icon: 'bg-[#EFF6FF] text-[#2563EB]', border: '#93C5FD' },
    term: { pill: 'bg-[#FFFBEB] text-[#B45309]', icon: 'bg-[#FFFBEB] text-[#B45309]', border: '#FCD34D' },
    neutral: { pill: 'bg-[#F3F4F6] text-[#6B7280]', icon: 'bg-[#F3F4F6] text-[#6B7280]', border: '#9CA3AF' },
};

const dotColors = { Life: '#A78BFA', Term: '#FCD34D', Health: '#FCA5A5', Vehicle: '#93C5FD' };

const getPolicyClass = (type) => ({ life: 'life', health: 'health', vehicle: 'vehicle', term: 'term' }[type.toLowerCase()] || 'neutral');

const monthDiff = (d1, d2) => {
    const months = (d2.getFullYear() - d1.getFullYear()) * 12 - d1.getMonth() + d2.getMonth();
    return months <= 0 ? 0 : months;
};

const missingPolicy = { id: 4, insurer: 'Star Health Term Plan', policyNumber: 'SH-TERM-2024-412', type: 'Term', status: 'active', coverageAmount: 2500000, premiumAmount: 9500, premiumFrequency: 'Annual', startDate: '2024-08-01', renewalDate: '2027-08-01' };
const ALL_POLICIES = [...insurancePolicies, missingPolicy];

const categories = [
    { label: 'Life', icon: ICONS.shield }, { label: 'Health', icon: ICONS.healthCross },
    { label: 'Vehicle', icon: ICONS.Vehicle }, { label: 'Home', icon: ICONS.Home },
    { label: 'Travel', icon: ICONS.Travel }, { label: 'Term', icon: ICONS.clipboard },
    { label: 'Business', icon: ICONS.briefcase }, { label: 'Other', icon: ICONS.Other },
];

const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-[0.9rem] text-text bg-bg outline-none font-sans focus:border-primary";

export default function InsurancePage() {
    const [localPolicies, setLocalPolicies] = useState(ALL_POLICIES);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCat, setSelectedCat] = useState('Life');

    const filtered = activeFilter === 'all' ? localPolicies : localPolicies.filter(p => p.type.toLowerCase() === activeFilter || (activeFilter === 'term' && p.type === 'Term'));

    const totalCoverage = localPolicies.reduce((s, p) => s + p.coverageAmount, 0);
    const totalPremium = localPolicies.reduce((s, p) => s + p.premiumAmount, 0);
    const activeCount = localPolicies.filter(p => p.status === 'active').length;

    const sortedByRenewal = [...localPolicies].sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));
    const nextRenewal = sortedByRenewal[0] || null;
    const nextRenewalDate = nextRenewal ? new Date(nextRenewal.renewalDate) : new Date();
    const nextMonthYear = nextRenewal ? nextRenewalDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 'N/A';
    const monthsAway = nextRenewal ? monthDiff(new Date(), nextRenewalDate) : 0;
    const lifePolicy = localPolicies.find(p => p.type === 'Life');
    const lifeCoverStr = lifePolicy ? formatLakhs(lifePolicy.coverageAmount) : '₹0';
    const filterCounts = { all: localPolicies.length, life: localPolicies.filter(p => p.type === 'Life').length, health: localPolicies.filter(p => p.type === 'Health').length, vehicle: localPolicies.filter(p => p.type === 'Vehicle').length, term: localPolicies.filter(p => p.type === 'Term').length };

    const handleAddPolicy = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        setLocalPolicies(prev => [...prev, { id: Date.now(), insurer: fd.get('insurer'), policyNumber: fd.get('policyNumber'), type: selectedCat, status: 'active', coverageAmount: Number(fd.get('coverageAmount')), premiumAmount: Number(fd.get('premiumAmount')), premiumFrequency: 'Annual', startDate: fd.get('startDate'), renewalDate: fd.get('renewalDate') }]);
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-[22px] font-bold text-[#0D1F17]">Insurance & Protection</h1>
                    <div className="text-[12.5px] text-[#8FA99C] mt-[3px]">{activeCount} active policies · {formatLakhs(totalCoverage)} total coverage · Next renewal in {monthsAway} months</div>
                </div>
                <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#2D7A4F] text-white rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#256341] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(45,122,79,0.3)]" onClick={() => setIsModalOpen(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Policy
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                    { label: 'Total Coverage', value: formatLakhs(totalCoverage), badge: `${activeCount} policies active`, icon: ICONS.shield, iconCls: 'bg-[rgba(45,122,79,0.16)] text-[#2D7A4F]', valCls: 'text-[#0D1F17]', badgeCls: 'bg-[rgba(45,122,79,0.12)] text-[#2D7A4F] border border-[rgba(45,122,79,0.24)]', dark: true },
                    { label: 'Annual Premium', value: formatCurrency(totalPremium), badge: `${formatCurrency(Math.floor(totalPremium / 12))}/month`, icon: ICONS.creditCard, iconCls: 'bg-[#E8F5E9] text-[#2D7A4F]', valCls: 'text-[#2D7A4F]', badgeCls: 'bg-[rgba(45,122,79,0.12)] text-[#2D7A4F]' },
                    { label: 'Upcoming Renewal', value: nextMonthYear, badge: `${nextRenewal ? nextRenewal.insurer.split(' ')[0] : 'None'} · ${monthsAway} mo`, icon: ICONS.calendar, iconCls: 'bg-[#FFFBEB] text-[#F59E0B]', valCls: 'text-[#F59E0B]', badgeCls: 'bg-[rgba(245,158,11,0.12)] text-[#D97706]' },
                    { label: 'Coverage Gap', value: 'None', badge: 'All types covered', icon: ICONS.alert, iconCls: 'bg-[#FEF2F2] text-[#EF4444]', valCls: 'text-[#EF4444]', badgeCls: 'bg-[rgba(45,122,79,0.12)] text-[#2D7A4F]' },
                    { label: 'Life Cover', value: lifeCoverStr, badge: lifePolicy ? lifePolicy.insurer + ' Life policy' : 'No Policy', icon: ICONS.shield, iconCls: 'bg-[#F3E8FF] text-[#7C3AED]', valCls: 'text-[#7C3AED]', badgeCls: 'bg-[rgba(124,58,237,0.10)] text-[#7C3AED]' },
                ].map((m, i) => (
                    <KPICard
                        key={i}
                        label={m.label}
                        value={m.value}
                        icon={m.icon}
                        dark={m.dark}
                        valueColor={m.valCls}
                        iconBg={m.iconCls}
                        iconColor=""
                        badge={<span className={`inline-flex items-center px-2 py-0.5 rounded-[10px] text-[11px] font-bold w-fit ${m.badgeCls}`}>{m.badge}</span>}
                    />
                ))}
            </div>

            {/* 3-col body */}
            <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr_260px] gap-4 items-start">

                {/* LEFT */}
                <div className="flex flex-col gap-3">
                    <div className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-sm p-[16px]">
                        <div className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.5px] mb-2.5">Filter by Type</div>
                        {[
                            { key: 'all', label: 'All Policies', icon: ICONS.document },
                            { key: 'life', label: 'Life', icon: ICONS.shield },
                            { key: 'health', label: 'Health', icon: ICONS.healthCross },
                            { key: 'vehicle', label: 'Vehicle', icon: ICONS.Vehicle },
                            { key: 'term', label: 'Term / Other', icon: ICONS.clipboard },
                        ].map(f => (
                            <button key={f.key} onClick={() => setActiveFilter(f.key)}
                                className={`flex justify-between items-center w-full px-2.5 py-2 rounded-lg border mb-1 transition-all duration-150 cursor-pointer
                                    ${activeFilter === f.key ? 'bg-[#2D7A4F] border-transparent shadow-sm' : 'border-transparent bg-transparent hover:bg-[#F9FAFB] hover:border-[#E4EDE8]'}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[15px] ${activeFilter === f.key ? 'text-white' : 'text-[#8FA99C]'}`}>{f.icon}</span>
                                    <span className={`text-[12.5px] ${activeFilter === f.key ? 'text-white font-bold' : 'text-[#0D1F17] font-medium'}`}>{f.label}</span>
                                </div>
                                <span className={`text-[11px] font-bold px-[7px] py-[2px] rounded-[10px] border ${activeFilter === f.key ? 'bg-white/[0.15] text-white border-white/[0.2]' : 'bg-[#F3F4F6] text-[#8FA99C] border-[#E4EDE8]'}`}>{filterCounts[f.key]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Coverage Donut */}
                    <div className="bg-gradient-to-br from-[rgba(45,122,79,0.12)] to-[rgba(45,122,79,0.05)] border border-[rgba(45,122,79,0.24)] rounded-[14px] p-[18px_16px]">
                        <div className="text-[11px] font-bold text-[#0D1F17] uppercase tracking-[0.6px] mb-1">Coverage Breakdown</div>
                        <div className="text-[12.5px] text-[#0D1F17] mb-3 leading-[1.4]">₹<span className="font-bold text-[#2D7A4F]">{totalCoverage / 100000}L</span> total protection</div>
                        <div className="flex justify-center mb-3.5">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(45,122,79,0.14)" strokeWidth="18" />
                                <circle cx="60" cy="60" r="44" fill="none" stroke="#A78BFA" strokeWidth="16" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ strokeDasharray: '160 116.5' }} />
                                <circle cx="60" cy="60" r="44" fill="none" stroke="#FCD34D" strokeWidth="16" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ strokeDasharray: '80 196.5', strokeDashoffset: -162 }} />
                                <circle cx="60" cy="60" r="44" fill="none" stroke="#FCA5A5" strokeWidth="16" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ strokeDasharray: '33 243.5', strokeDashoffset: -244 }} />
                                <circle cx="60" cy="60" r="44" fill="none" stroke="#93C5FD" strokeWidth="16" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ strokeDasharray: '6 270.5', strokeDashoffset: -279 }} />
                                <text x="60" y="56" fontSize="14" fontWeight="800" fill="#183325" textAnchor="middle" fontFamily="Inter, sans-serif">{formatLakhs(totalCoverage)}</text>
                                <text x="60" y="70" fontSize="9" fill="#000" textAnchor="middle" fontFamily="Inter, sans-serif">Coverage</text>
                            </svg>
                        </div>
                        <div className="flex flex-col gap-[7px] max-h-[150px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                            {localPolicies.map(p => (
                                <div key={'cb-' + p.id} className="flex items-center gap-[7px]">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColors[p.type] || '#9CA3AF' }} />
                                    <div className="flex-1 text-[12px] text-[#0D1F17] truncate">{p.type} ({p.insurer.split(' ')[0]})</div>
                                    <div className="text-[12px] font-bold text-[#0D1F17]">{formatLakhs(p.coverageAmount)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MIDDLE */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2.5">
                        <div>
                            <h2 className="text-[15px] font-bold text-[#0D1F17]">All Policies</h2>
                            <div className="text-[12px] text-[#8FA99C] mt-0.5">{filtered.length} active · sorted by renewal date</div>
                        </div>
                        <select className="bg-white border border-[#E4EDE8] rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-[#0D1F17] cursor-pointer outline-none">
                            <option>Sort: Renewal Date</option>
                            <option>Sort: Coverage Amount</option>
                            <option>Sort: Premium</option>
                            <option>Sort: Type</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-3 overflow-y-auto max-lg:max-h-none lg:max-h-[540px]" style={{ scrollbarWidth: 'thin' }}>
                        {filtered.map(policy => {
                            const tc = typeColors[getPolicyClass(policy.type)];
                            const isRenewingSoon = monthDiff(new Date(), new Date(policy.renewalDate)) <= 12;
                            return (
                                <div key={policy.id} className="bg-white border border-[#E5E7EB] rounded-[14px] p-[16px_18px] relative overflow-hidden shadow-sm flex-shrink-0 hover:shadow-md transition-shadow"
                                    style={{ borderLeft: `4px solid ${tc.border}` }}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0 ${tc.icon}`}>{getInsuranceIcon(policy.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-bold text-[#0D1F17]">{policy.insurer}</div>
                                            <div className="text-[12px] text-[#8FA99C] mt-px">{policy.policyNumber}</div>
                                        </div>
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            <span className={`px-[9px] py-[3px] rounded-[10px] text-[11px] font-bold uppercase tracking-[0.5px] ${tc.pill}`}>{policy.type}</span>
                                            {isRenewingSoon && policy.type === 'Health'
                                                ? <span className="px-[9px] py-[3px] rounded-[10px] text-[11px] font-bold bg-[#FFFBEB] text-[#B45309] uppercase tracking-[0.5px]">Renewing Soon</span>
                                                : <span className="px-[9px] py-[3px] rounded-[10px] text-[11px] font-bold bg-[#ECFDF5] text-[#059669] uppercase tracking-[0.5px]">Active</span>
                                            }
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Coverage', value: formatCurrency(policy.coverageAmount), big: true },
                                            { label: 'Premium', value: `${formatCurrency(policy.premiumAmount)}/yr` },
                                            { label: 'Renewal', value: new Date(policy.renewalDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                                        ].map(f => (
                                            <div key={f.label}>
                                                <div className="text-[11px] text-[#8FA99C] uppercase tracking-[0.5px] font-bold mb-[3px]">{f.label}</div>
                                                <div className={`font-bold text-[#0D1F17] ${f.big ? 'text-[14px]' : 'text-[13px]'}`}>{f.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col gap-3">
                    {/* Renewal Timeline */}
                    <div className="bg-white border border-[#E4EDE8] rounded-[14px] overflow-hidden shadow-sm">
                        <div className="px-4 py-3 border-b border-[#E4EDE8]">
                            <div className="text-[15px] font-bold text-[#0D1F17]">Renewal Timeline</div>
                            <div className="text-[12px] text-[#8FA99C] mt-0.5">Upcoming policy renewals</div>
                        </div>
                        <div className="p-3 flex flex-col gap-2 max-h-[220px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                            {sortedByRenewal.map(policy => {
                                const m = monthDiff(new Date(), new Date(policy.renewalDate));
                                const urgCls = m <= 3 ? 'bg-[#FEF2F2] text-[#EF4444]' : m <= 9 ? 'bg-[#FFFBEB] text-[#F59E0B]' : m <= 18 ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-bg text-text-secondary';
                                return (
                                    <div key={'tl-' + policy.id} className="flex items-start gap-4">
                                        <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 text-lg ${urgCls}`}>{getInsuranceIcon(policy.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-bold text-[#0D1F17] truncate">{policy.insurer}</div>
                                            <div className="text-[12px] text-[#8FA99C] font-semibold uppercase tracking-[0.3px]">{new Date(policy.renewalDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                                            <div className={`text-[11px] font-bold mt-0.5 uppercase tracking-[0.4px] ${urgCls.split(' ')[1]}`}>{m} months away</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Premium Breakdown */}
                    <div className="bg-white border border-[#E4EDE8] rounded-[14px] overflow-hidden shadow-sm flex flex-col">
                        <div className="px-4 py-3 border-b border-[#E4EDE8] flex-shrink-0">
                            <div className="text-[15px] font-bold text-[#0D1F17]">Premium Breakdown</div>
                            <div className="text-[12px] text-[#8FA99C] mt-0.5">Annual spend per policy</div>
                        </div>
                        <div className="p-3 flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 180, scrollbarWidth: 'thin' }}>
                            {localPolicies.map(p => (
                                <div key={'pr-' + p.id} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColors[p.type] || '#9CA3AF' }} />
                                    <div className="flex-1 text-[12px] text-[#0D1F17] font-medium truncate">{p.insurer.split(' ')[0]} {p.type}</div>
                                    <div className="text-[11px] text-[#8FA99C] font-bold uppercase tracking-[0.4px]">ANNUAL</div>
                                    <div className="text-[13px] font-bold text-[#0D1F17]">{formatCurrency(p.premiumAmount)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB] flex-shrink-0 flex justify-between items-center">
                            <span className="text-[12.5px] font-bold text-[#0D1F17]">Total Annual Premium</span>
                            <span className="text-[14px] font-bold text-[#1B5E35]">{formatCurrency(totalPremium)}</span>
                        </div>
                    </div>

                    <button className="flex items-center justify-center gap-[8px] py-[10px] bg-[#2D7A4F] text-white border-none rounded-[8px] text-[13px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#256341]" onClick={() => setIsModalOpen(true)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add New Policy
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[16px] w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-start p-5 border-b border-[#E4EDE8]">
                            <div>
                                <div className="text-[16px] font-bold text-[#0D1F17]">Add New Policy</div>
                                <div className="text-[12px] text-[#8FA99C] mt-0.5 font-medium">Track a new insurance policy</div>
                            </div>
                            <button className="w-8 h-8 border border-[#E4EDE8] rounded-lg bg-white text-[#8FA99C] flex items-center justify-center text-[18px] hover:border-[#2D7A4F] hover:text-[#2D7A4F] cursor-pointer" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddPolicy} className="p-5 flex flex-col gap-4">
                            <div>
                                <div className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] mb-2 ml-1">Policy Type</div>
                                <div className="grid grid-cols-4 gap-2">
                                    {categories.map(c => (
                                        <div key={c.label}
                                            className={`flex flex-col items-center gap-[5px] py-2.5 px-1.5 rounded-[10px] border cursor-pointer transition-all duration-150 ${selectedCat === c.label ? 'border-[#2D7A4F] bg-[rgba(45,122,79,0.08)]' : 'border-[#E4EDE8] bg-[#F9FAFB] hover:border-[#2D7A4F]'}`}
                                            onClick={() => setSelectedCat(c.label)}>
                                            <div className={`w-9 h-9 flex items-center justify-center ${selectedCat === c.label ? 'text-[#2D7A4F]' : 'text-[#8FA99C]'}`}>{c.icon}</div>
                                            <div className="text-[10px] font-extrabold text-[#8FA99C] uppercase tracking-[0.4px] text-center">{c.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-[#E4EDE8] mt-2">
                                <button type="button" className="flex-1 py-2.5 rounded-lg font-bold text-[13px] cursor-pointer transition-all duration-200 text-center bg-[#F3F4F6] text-[#374151] border-none hover:bg-[#E5E7EB]" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-lg font-bold text-[13px] cursor-pointer transition-all duration-200 text-center bg-[#2D7A4F] text-white border-none hover:bg-[#256341] shadow-sm">Add Policy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
