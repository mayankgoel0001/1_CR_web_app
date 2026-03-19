import { useState, useEffect, useRef } from 'react';
import { goals, assets, formatCurrency, getCategoryIcon } from '../../data/mockData';
import { ICONS, getCatIcon } from '../../utils/icons';
import Modal from '../../components/common/Modal';
import KPICard from '../../components/common/KPICard';

const statusClass = (s) => ({ 'On Track': 'ontrack', 'Possible': 'possible', 'At Risk': 'atrisk', 'Behind': 'behind' }[s] || 'behind');

const fmtShort = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
};

const fmtINR = (n) => { if (!n && n !== 0) return '—'; return '₹' + n.toLocaleString('en-IN'); };

const monthsLeft = (dateStr) => {
    const now = new Date(), target = new Date(dateStr);
    return Math.max(0, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
};

const FILTERS = [
    { key: 'all', label: 'All Goals', dot: '#2D7A4F' },
    { key: 'ontrack', label: 'On Track', dot: '#2D7A4F' },
    { key: 'possible', label: 'Possible', dot: '#0D9488' },
    { key: 'atrisk', label: 'At Risk', dot: '#F59E0B' },
    { key: 'behind', label: 'Behind', dot: '#EF4444' },
];

const CATEGORY_OPTS = [
    { value: 'Vehicle', icon: ICONS.Vehicle }, { value: 'Home', icon: ICONS.Home },
    { value: 'Education', icon: ICONS.Education }, { value: 'Retirement', icon: ICONS.Retirement },
    { value: 'Travel', icon: ICONS.Travel }, { value: 'Wedding', icon: ICONS.Wedding },
    { value: 'Medical', icon: ICONS.Medical }, { value: 'Other', icon: ICONS.Other },
];

const scColors = {
    ontrack: { icon: 'bg-[rgba(45,122,79,0.12)] text-[#2D7A4F]', badge: 'bg-[rgba(45,122,79,0.12)] text-[#2D7A4F]', saved: 'text-[#2D7A4F]', pct: 'text-[#2D7A4F]', bar: 'bg-gradient-to-r from-[#2D7A4F] to-[#34D399]', border: '#2D7A4F', insight: 'bg-[#F0FDF4] text-[#166534] border-l-[#22C55E]' },
    possible: { icon: 'bg-[rgba(13,148,136,0.12)] text-[#0D9488]', badge: 'bg-[rgba(13,148,136,0.12)] text-[#0D9488]', saved: 'text-[#0D9488]', pct: 'text-[#0D9488]', bar: 'bg-gradient-to-r from-[#0D9488] to-[#5EEAD4]', border: '#0D9488', insight: 'bg-[#F0FDFA] text-[#115E59] border-l-[#14B8A6]' },
    atrisk: { icon: 'bg-[rgba(245,158,11,0.10)] text-[#D97706]', badge: 'bg-[rgba(245,158,11,0.12)] text-[#D97706]', saved: 'text-[#D97706]', pct: 'text-[#D97706]', bar: 'bg-gradient-to-r from-[#D97706] to-[#FCD34D]', border: '#F59E0B', insight: 'bg-[#FFFBEB] text-[#92400E] border-l-[#F59E0B]' },
    behind: { icon: 'bg-[rgba(239,68,68,0.10)] text-[#DC2626]', badge: 'bg-[rgba(239,68,68,0.10)] text-[#DC2626]', saved: 'text-[#DC2626]', pct: 'text-[#DC2626]', bar: 'bg-gradient-to-r from-[#DC2626] to-[#FCA5A5]', border: '#EF4444', insight: 'bg-[#FEF2F2] text-[#991B1B] border-l-[#EF4444]' },
};

export default function GoalsPage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [localGoals, setLocalGoals] = useState(goals);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Vehicle');
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [sortBy, setSortBy] = useState('targetDate');
    const barRefs = useRef({});

    useEffect(() => {
        const timer = setTimeout(() => { Object.values(barRefs.current).forEach(bar => { if (bar) bar.style.width = bar.getAttribute('data-w'); }); }, 250);
        return () => clearTimeout(timer);
    }, [localGoals, activeFilter]);

    const totalSaved = localGoals.reduce((s, g) => s + g.currentAmount, 0);
    const totalTarget = localGoals.reduce((s, g) => s + g.goalAmount, 0);
    const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    const totalMonthlyRec = localGoals.reduce((s, g) => s + (g.suggestedSip || g.monthlySip || 0), 0);

    const byStatus = (st) => localGoals.filter(g => g.status === st);
    const onTrackList = byStatus('On Track'), possibleList = byStatus('Possible'), atRiskList = byStatus('At Risk');

    const filterCounts = { all: localGoals.length, ontrack: onTrackList.length, possible: possibleList.length, atrisk: atRiskList.length, behind: byStatus('Behind').length };

    const filtered = [...(activeFilter === 'all' ? localGoals : localGoals.filter(g => statusClass(g.status) === activeFilter))].sort((a, b) => {
        if (sortBy === 'targetDate') return new Date(a.targetDate) - new Date(b.targetDate);
        if (sortBy === 'progress') return (b.currentAmount / b.goalAmount) - (a.currentAmount / a.goalAmount);
        return b.currentAmount - a.currentAmount;
    });

    const C = 2 * Math.PI * 44;
    const toArc = (val) => totalTarget > 0 ? (val / totalTarget) * C : 0;
    const onTrackSaved = onTrackList.reduce((s, g) => s + g.currentAmount, 0);
    const possibleSaved = possibleList.reduce((s, g) => s + g.currentAmount, 0);
    const atRiskSaved = atRiskList.reduce((s, g) => s + g.currentAmount, 0);
    const arcOT = toArc(onTrackSaved), arcPO = toArc(possibleSaved), arcAR = toArc(atRiskSaved);

    const handleAddGoal = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        let initialAmount = 0;
        selectedAssets.forEach(id => { const a = assets.find(a => a.id === id); if (a) initialAmount += a.currentValue; });
        const targetAmount = Number(fd.get('goalAmount'));
        const pct = targetAmount > 0 ? (initialAmount / targetAmount) * 100 : 0;
        const status = pct >= 80 ? 'On Track' : pct >= 40 ? 'Possible' : pct >= 20 ? 'At Risk' : 'Behind';
        setLocalGoals([...localGoals, { id: Date.now().toString(), title: fd.get('goalTitle'), category: selectedCategory, emoji: null, subLabel: selectedCategory, currentAmount: initialAmount, goalAmount: targetAmount, targetDate: fd.get('targetDate'), status, monthlySip: Number(fd.get('monthlySip')) || 0, insight: null, linkedSources: selectedAssets }]);
        setIsModalOpen(false); setSelectedAssets([]); setSelectedCategory('Vehicle');
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-[22px] font-bold text-[#0D1F17]">My Goals</div>
                    <div className="text-[12.5px] text-[#8FA99C] mt-[3px]">
                        {localGoals.filter(g => g.status !== 'Behind').length} active goals &middot; {fmtShort(totalSaved)} saved of {fmtShort(totalTarget)} total target
                    </div>
                </div>
                <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#2D7A4F] text-white rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#256341] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(45,122,79,0.3)]" onClick={() => setIsModalOpen(true)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Create Goal
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-5 gap-3">
                {[
                    { label: 'Net Saved', value: fmtShort(totalSaved), badge: `${overallPct}% overall`, icon: ICONS.diamond, iconCls: 'bg-[rgba(52,211,153,0.15)] text-[#2D7A4F]', valCls: 'text-[#0D1F17]', badgeCls: 'bg-[rgba(45,122,79,0.12)] text-[#2D7A4F] border border-[rgba(45,122,79,0.24)]', dark: true },
                    { label: 'On Track', value: onTrackList.length, badge: 'Goals healthy', icon: ICONS.check, iconCls: 'bg-[#E8F5E9] text-[#2D7A4F]', valCls: 'text-[#2D9D5E]', badgeCls: 'bg-[rgba(45,122,79,0.12)] text-[#2D7A4F]' },
                    { label: 'Possible', value: possibleList.length, badge: 'Needs small push', icon: ICONS.trendUp, iconCls: 'bg-[#F0FDFA] text-[#0D9488]', valCls: 'text-[#0D1612]', badgeCls: 'bg-[rgba(13,148,136,0.12)] text-[#0D9488]' },
                    { label: 'At Risk', value: atRiskList.length, badge: atRiskList[0]?.title || '—', icon: ICONS.alert, iconCls: 'bg-[#FFFBEB] text-[#F59E0B]', valCls: 'text-[#F59E0B]', badgeCls: 'bg-[rgba(245,158,11,0.12)] text-[#D97706]' },
                    { label: 'Total Target', value: fmtShort(totalTarget), badge: `${localGoals.length} goals combined`, icon: ICONS.target, iconCls: 'bg-[#EFF6FF] text-[#3B82F6]', valCls: 'text-[#3B82F6]', badgeCls: 'bg-[rgba(59,130,246,0.12)] text-[#3B82F6]' },
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

            {/* 3-column Body */}
            <div className="grid gap-4 items-start" style={{ gridTemplateColumns: '260px 1fr 280px' }}>

                {/* LEFT */}
                <div className="flex flex-col gap-3">
                    {/* Filter Card */}
                    <div className="bg-card border border-[#E4EDE8] rounded-[14px] p-4">
                        <div className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.5px] mb-2.5">Filter by Status</div>
                        {FILTERS.map(f => (
                            <button key={f.key} onClick={() => setActiveFilter(f.key)}
                                className={`flex justify-between items-center w-full px-2.5 py-[9px] rounded-lg border mb-1 transition-all duration-150 cursor-pointer
                                    ${activeFilter === f.key ? 'bg-[#2D7A4F] border-transparent shadow-sm' : 'border-transparent bg-transparent hover:bg-[#F9FAFB] hover:border-[#E4EDE8]'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.dot }} />
                                    <span className={`text-[12.5px] ${activeFilter === f.key ? 'text-white font-bold' : 'text-[#0D1F17] font-medium'}`}>{f.label}</span>
                                </div>
                                <span className={`text-[11px] font-bold px-[7px] py-[2px] rounded-[10px] border ${activeFilter === f.key ? 'bg-white/[0.15] text-white border-white/[0.2]' : 'bg-[#F3F4F6] text-[#8FA99C] border-[#E4EDE8]'}`}>{filterCounts[f.key]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Progress Card */}
                    <div className="bg-gradient-to-br from-[rgba(45,122,79,0.12)] to-[rgba(45,122,79,0.05)] border border-[rgba(45,122,79,0.24)] rounded-[14px] p-[18px_16px]">
                        <div className="text-[11px] font-bold text-[#0D1F17] uppercase tracking-[0.6px] mb-1">Overall Progress</div>
                        <div className="text-[12.5px] text-[#0D1F17] mb-3.5 leading-[1.4]">
                            <span className="font-bold text-[#2D7A4F] text-[14px]">{fmtShort(totalSaved)}</span> saved of {fmtShort(totalTarget)}
                        </div>
                        <div className="flex justify-center mb-3.5">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(45,122,79,0.14)" strokeWidth="18" />
                                {arcOT > 0 && <circle cx="60" cy="60" r="44" fill="none" stroke="#34D399" strokeWidth="16" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ strokeDasharray: `${arcOT} ${C}`, strokeDashoffset: 0 }} />}
                                {arcPO > 0 && <circle cx="60" cy="60" r="44" fill="none" stroke="#5EEAD4" strokeWidth="16" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ strokeDasharray: `${arcPO} ${C}`, strokeDashoffset: -(arcOT + 2) }} />}
                                {arcAR > 0 && <circle cx="60" cy="60" r="44" fill="none" stroke="#FCD34D" strokeWidth="16" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ strokeDasharray: `${arcAR} ${C}`, strokeDashoffset: -(arcOT + arcPO + 4) }} />}
                                <text x="60" y="56" fontSize="16" fontWeight="800" fill="#183325" textAnchor="middle" fontFamily="Inter, sans-serif">{overallPct}%</text>
                                <text x="60" y="70" fontSize="9" fill="#000" textAnchor="middle" fontFamily="Inter, sans-serif">Complete</text>
                            </svg>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            {[{ dot: '#34D399', name: `On Track · ${onTrackList.length}`, val: fmtShort(onTrackSaved) },
                            { dot: '#5EEAD4', name: `Possible · ${possibleList.length}`, val: fmtShort(possibleSaved) },
                            { dot: '#FCD34D', name: `At Risk · ${atRiskList.length}`, val: fmtShort(atRiskSaved) },
                            { dot: '#E5E7EB', name: 'Remaining', val: fmtShort(totalTarget - totalSaved) }
                            ].map((r, i) => (
                                <div key={i} className="flex items-center gap-[7px]">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.dot }} />
                                    <div className="flex-1 text-[12px] text-[#0D1F17]">{r.name}</div>
                                    <div className="text-[12px] font-bold text-[#0D1F17]">{r.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MIDDLE */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2.5">
                        <div>
                            <div className="text-[15px] font-bold text-[#0D1F17]">{FILTERS.find(f => f.key === activeFilter)?.label || 'All Goals'}</div>
                            <div className="text-[12px] text-[#8FA99C] mt-0.5">{filtered.length} goal{filtered.length !== 1 ? 's' : ''} &middot; sorted by {sortBy === 'targetDate' ? 'target date' : sortBy === 'progress' ? 'progress' : 'amount saved'}</div>
                        </div>
                        <select className="bg-white border border-[#E4EDE8] rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-[#0D1F17] cursor-pointer outline-none" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="targetDate">Sort: Target Date</option>
                            <option value="progress">Sort: Progress</option>
                            <option value="saved">Sort: Amount Saved</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2.5 overflow-y-auto pr-[15px]" style={{ height: 540, scrollbarWidth: 'thin', scrollbarColor: '#C4C4C4 #F3F4F6' }}>
                        {filtered.map(goal => {
                            const sc = statusClass(goal.status);
                            const cc = scColors[sc];
                            const pct = Math.min(Math.round((goal.currentAmount / goal.goalAmount) * 100), 100);
                            const ml = monthsLeft(goal.targetDate);
                            const gap = goal.goalAmount - goal.currentAmount;
                            return (
                                <div key={goal.id} className="bg-white border border-[#E5E7EB] rounded-[14px] px-[18px] pt-4 pb-4 pl-[22px] relative overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md flex-shrink-0 shadow-sm"
                                    style={{ borderLeft: `4px solid ${cc.border}` }}>
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${cc.icon}`}>{getCatIcon(goal.category)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-bold text-[#0D1F17] whitespace-nowrap overflow-hidden text-ellipsis">{goal.title}</div>
                                            <div className="text-[11px] font-bold text-[#8FA99C] mt-px uppercase tracking-[0.4px]">{goal.category}{goal.subLabel && goal.subLabel !== goal.category ? ` · ${goal.subLabel}` : ''}</div>
                                        </div>
                                        <span className={`px-[9px] py-[3px] rounded-[10px] text-[11px] font-bold whitespace-nowrap flex-shrink-0 uppercase tracking-[0.5px] ${cc.badge}`}>• {goal.status}</span>
                                    </div>
                                    <div className="flex items-baseline gap-[5px] mb-2">
                                        <div className={`text-[18px] font-bold ${cc.saved}`}>{fmtINR(goal.currentAmount)}</div>
                                        <div className="text-[13px] text-[#8FA99C]">/</div>
                                        <div className="text-[13px] text-[#0D1F17] font-bold flex-1">{fmtINR(goal.goalAmount)}</div>
                                        <div className={`text-[13px] font-bold ${cc.pct}`}>{pct < 1 ? '<1' : pct}%</div>
                                    </div>
                                    <div className="h-1.5 bg-border-light rounded-[3px] overflow-hidden mb-2.5">
                                        <div className={`h-full rounded-[3px] ${cc.bar}`} ref={el => { barRefs.current[`${goal.id}-${activeFilter}`] = el; }} data-w={`${pct < 1 ? 0.5 : pct}%`} style={{ width: 0, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center mb-3">
                                        {[
                                            { lbl: 'Target Date', val: new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
                                            { lbl: 'Monthly SIP', val: goal.monthlySip ? fmtINR(goal.monthlySip) : '—' },
                                            { lbl: 'Time Left', val: `${ml} months` },
                                            { lbl: 'Gap to Goal', val: fmtINR(gap) },
                                        ].map((m, i) => (
                                            <div key={m.lbl} className={`flex flex-col min-w-0 ${i > 0 ? 'pl-[16px] border-l border-[#E5E7EB]' : 'pr-[8px]'}`}>
                                                <span className="text-[11px] text-[#0D1F17] font-bold uppercase tracking-[0.8px] mb-[2px] truncate">{m.lbl}</span>
                                                <strong className="text-[14px] font-bold text-[#0D1F17] truncate">{m.val}</strong>
                                            </div>
                                        ))}
                                    </div>
                                    {goal.insight && <div className={`text-[12.5px] px-3 py-[9px] rounded-lg leading-[1.45] border-l-[3px] font-medium ${cc.insight}`}>{goal.insight}</div>}
                                </div>
                            );
                        })}
                        {filtered.length === 0 && <div className="text-center py-10 text-text-muted text-[0.875rem]">No goals match this filter.</div>}
                    </div>
                </div>

                {/* RIGHT */}
                <div>
                    <div className="bg-white border border-[#E4EDE8] rounded-[14px] overflow-hidden shadow-sm flex flex-col" style={{ maxHeight: 570 }}>
                        <div className="p-4 border-b border-[#E4EDE8] bg-white flex-shrink-0">
                            <div className="text-[15px] font-bold text-[#0D1F17]">Recommended SIPs</div>
                            <div className="text-[12px] text-[#8FA99C] mt-0.5 mb-3">Monthly contributions per goal</div>
                            <div className="flex justify-between items-center bg-[#F3F9F5] rounded-[10px] px-3.5 py-2.5 border border-[#D1FAE5]">
                                <span className="text-[12px] font-bold text-[#0D1F17]">Suggested / Month</span>
                                <span className="text-[16px] font-bold text-[#1B5E35]">{fmtINR(totalMonthlyRec)}</span>
                            </div>
                        </div>
                        <div className="p-3 flex flex-col gap-2.5 flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#C4C4C4 #F3F4F6' }}>
                            {localGoals.map(goal => {
                                const sc = statusClass(goal.status);
                                const cc = scColors[sc];
                                const pct = Math.min(Math.round((goal.currentAmount / goal.goalAmount) * 100), 100);
                                const hasSuggested = goal.suggestedSip && goal.suggestedSip !== goal.monthlySip;
                                const displaySip = goal.suggestedSip || goal.monthlySip;
                                const sipLabel = sc === 'atrisk' || sc === 'behind' ? `Required ↑ from ${fmtINR(goal.monthlySip)}` : hasSuggested ? `Suggested ↑ from ${fmtINR(goal.monthlySip)}` : 'Current SIP';
                                return (
                                    <div key={goal.id} className="bg-[#FAFAFA] rounded-[10px] p-[12px_14px] border border-[#E5E7EB] flex-shrink-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center flex-shrink-0 ${cc.icon}`}>{getCatIcon(goal.category)}</div>
                                            <div className="flex-1 text-[13px] font-bold text-[#0D1F17] whitespace-nowrap overflow-hidden text-ellipsis">{goal.title}</div>
                                            <span className={`px-[7px] py-[2px] rounded-lg text-[10px] font-bold uppercase tracking-[0.5px] flex-shrink-0 ${cc.badge}`}>{goal.status}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-[5px]">
                                            <div className="text-[11px] text-[#8FA99C] font-bold uppercase tracking-[0.4px]">{sipLabel}</div>
                                            <div className={`text-[13px] font-bold ${cc.saved}`}>{displaySip ? fmtINR(displaySip) : '—'}</div>
                                        </div>
                                        <div className="h-1 bg-border-light rounded-[2px] overflow-hidden">
                                            <div className={`h-full rounded-[2px] ${cc.bar}`} style={{ width: `${pct < 1 ? 0.5 : pct}%`, transition: 'width 1s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-[14px_16px] border-t border-[#E5E7EB] bg-white flex-shrink-0">
                            <button className="flex items-center justify-center gap-[6px] w-full py-[10px] bg-[#2D7A4F] text-white rounded-[8px] text-[13px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#256341] tracking-[0.2px] border-none" onClick={() => setIsModalOpen(true)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Create New Goal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedAssets([]); setSelectedCategory('Vehicle'); }} title="Create New Goal">
                <form className="flex flex-col gap-[24px]" onSubmit={handleAddGoal}>
                    <div className="flex flex-col gap-[4px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1">Goal Category</label>
                        <div className="grid grid-cols-4 gap-2">
                            {CATEGORY_OPTS.map(c => (
                                <div key={c.value}
                                    className={`flex flex-col items-center gap-[5px] py-2.5 px-1.5 rounded-[10px] border cursor-pointer transition-all duration-150
                                        ${selectedCategory === c.value ? 'border-primary bg-[rgba(45,122,79,0.08)]' : 'border-[#F0F0F0] bg-bg hover:border-primary hover:bg-[rgba(45,122,79,0.08)]'}`}
                                    onClick={() => setSelectedCategory(c.value)}>
                                    <div className={`w-9 h-9 flex items-center justify-center ${selectedCategory === c.value ? 'text-primary' : 'text-text-secondary'}`}>{c.icon}</div>
                                    <div className="text-[10px] font-extrabold text-[#8FA99C] uppercase tracking-[0.4px] text-center">{c.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-[4px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1">Goal Name *</label>
                        <div className="flex items-center gap-[16px] border border-border rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(27,140,78,0.1)]">
                            <span className="text-[1.2rem] text-text-muted flex-shrink-0">T</span>
                            <input className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none placeholder:font-normal" type="text" name="goalTitle" placeholder="e.g. Buy a Kia Seltos" required />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="flex flex-col gap-[4px]">
                            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1">Target Amount (₹) *</label>
                            <div className="flex items-center gap-[16px] border border-border rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(27,140,78,0.1)]">
                                <span className="text-[1.2rem] text-text-muted flex-shrink-0">₹</span>
                                <input className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:font-normal" type="number" name="goalAmount" placeholder="0" required />
                            </div>
                        </div>
                        <div className="flex flex-col gap-[4px]">
                            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1">Monthly SIP (₹)</label>
                            <div className="flex items-center gap-[16px] border border-border rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(27,140,78,0.1)]">
                                <span className="text-[1.2rem] text-text-muted flex-shrink-0">₹</span>
                                <input className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:font-normal" type="number" name="monthlySip" placeholder="0" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[4px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1">Target Date *</label>
                        <div className="flex items-center gap-[16px] border border-border rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(27,140,78,0.1)]">
                            <span className="text-[1.2rem] text-text-muted flex-shrink-0">{ICONS.calendar}</span>
                            <input className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none" type="date" name="targetDate" required />
                        </div>
                    </div>
                    <div className="flex flex-col gap-[4px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1">Link Savings / Investments (Optional)</label>
                        <div className="flex flex-col gap-1">
                            {assets.filter(a => a.category === 'savings' || a.category === 'investments').map(asset => (
                                <label key={asset.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-bg">
                                    <input type="checkbox" checked={selectedAssets.includes(asset.id)} onChange={() => setSelectedAssets(p => p.includes(asset.id) ? p.filter(x => x !== asset.id) : [...p, asset.id])} style={{ width: '16px', height: '16px', accentColor: '#2D7A4F' }} />
                                    <div>
                                        <div className="text-[13px] font-bold text-[#0D1F17]">{asset.name}</div>
                                        <div className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.4px]">{asset.category} · {formatCurrency(asset.currentValue)}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-[16px] mt-[24px] pt-[24px] border-t border-[#E4EDE8]">
                        <button type="button" className="flex-1 py-2.5 rounded-lg font-bold text-[13px] cursor-pointer transition-all duration-200 text-center bg-[#F3F4F6] text-[#374151] border-none hover:bg-[#E5E7EB]" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-lg font-bold text-[13px] cursor-pointer transition-all duration-200 text-center bg-[#2D7A4F] text-white border-none hover:bg-[#256341] shadow-sm">Create Goal</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
