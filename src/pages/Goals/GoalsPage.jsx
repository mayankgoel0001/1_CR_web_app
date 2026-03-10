import { useState, useEffect, useRef } from 'react';
import { goals, assets, formatCurrency, getCategoryIcon } from '../../data/mockData';
import { ICONS, getCatIcon } from '../../utils/icons';
import Modal from '../../components/common/Modal';
import './GoalsPage.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusClass = (s) =>
    ({ 'On Track': 'ontrack', 'Possible': 'possible', 'At Risk': 'atrisk', 'Behind': 'behind' }[s] || 'behind');

const fmtShort = (n) => {
    if (!n && n !== 0) return '—';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
};

// Full Indian locale format: ₹3,50,000
const fmtINR = (n) => {
    if (!n && n !== 0) return '—';
    return '₹' + n.toLocaleString('en-IN');
};

const monthsLeft = (dateStr) => {
    const now = new Date();
    const target = new Date(dateStr);
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
    { value: 'Vehicle', icon: ICONS.Vehicle },
    { value: 'Home', icon: ICONS.Home },
    { value: 'Education', icon: ICONS.Education },
    { value: 'Retirement', icon: ICONS.Retirement },
    { value: 'Travel', icon: ICONS.Travel },
    { value: 'Wedding', icon: ICONS.Wedding },
    { value: 'Medical', icon: ICONS.Medical },
    { value: 'Other', icon: ICONS.Other },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function GoalsPage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [localGoals, setLocalGoals] = useState(goals);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Vehicle');
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [sortBy, setSortBy] = useState('targetDate');
    const barRefs = useRef({});

    // Animate progress bars after mount / filter change
    useEffect(() => {
        const timer = setTimeout(() => {
            Object.values(barRefs.current).forEach((bar) => {
                if (bar) bar.style.width = bar.getAttribute('data-w');
            });
        }, 250);
        return () => clearTimeout(timer);
    }, [localGoals, activeFilter]);

    // ── Derived metrics ──────────────────────────────────────────────────────
    const totalSaved = localGoals.reduce((s, g) => s + g.currentAmount, 0);
    const totalTarget = localGoals.reduce((s, g) => s + g.goalAmount, 0);
    const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    const totalMonthlyRec = localGoals.reduce((s, g) => s + (g.suggestedSip || g.monthlySip || 0), 0);

    const byStatus = (st) => localGoals.filter((g) => g.status === st);
    const onTrackList = byStatus('On Track');
    const possibleList = byStatus('Possible');
    const atRiskList = byStatus('At Risk');
    const behindList = byStatus('Behind');

    const filterCounts = {
        all: localGoals.length,
        ontrack: onTrackList.length,
        possible: possibleList.length,
        atrisk: atRiskList.length,
        behind: behindList.length,
    };

    const filteredRaw = activeFilter === 'all'
        ? localGoals
        : localGoals.filter((g) => statusClass(g.status) === activeFilter);

    // Sort logic
    const filtered = [...filteredRaw].sort((a, b) => {
        switch (sortBy) {
            case 'targetDate': return new Date(a.targetDate) - new Date(b.targetDate);
            case 'progress': return (b.currentAmount / b.goalAmount) - (a.currentAmount / a.goalAmount);
            case 'saved': return b.currentAmount - a.currentAmount;
            default: return 0;
        }
    });

    // ── Mini donut arcs ──────────────────────────────────────────────────────
    const C = 2 * Math.PI * 44; // ≈ 276.46
    const toArc = (val) => totalTarget > 0 ? (val / totalTarget) * C : 0;
    const onTrackSaved = onTrackList.reduce((s, g) => s + g.currentAmount, 0);
    const possibleSaved = possibleList.reduce((s, g) => s + g.currentAmount, 0);
    const atRiskSaved = atRiskList.reduce((s, g) => s + g.currentAmount, 0);
    const arcOT = toArc(onTrackSaved);
    const arcPO = toArc(possibleSaved);
    const arcAR = toArc(atRiskSaved);

    const handleToggleAsset = (id) => {
        setSelectedAssets((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleAddGoal = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        let initialAmount = 0;
        selectedAssets.forEach((id) => {
            const a = assets.find((a) => a.id === id);
            if (a) initialAmount += a.currentValue;
        });
        const targetAmount = Number(fd.get('goalAmount'));
        const pct = targetAmount > 0 ? (initialAmount / targetAmount) * 100 : 0;
        const status =
            pct >= 80 ? 'On Track' : pct >= 40 ? 'Possible' : pct >= 20 ? 'At Risk' : 'Behind';
        const catOpt = CATEGORY_OPTS.find((c) => c.value === selectedCategory);
        const newGoal = {
            id: Date.now().toString(),
            title: fd.get('goalTitle'),
            category: selectedCategory,
            emoji: null,
            subLabel: selectedCategory,
            currentAmount: initialAmount,
            goalAmount: targetAmount,
            targetDate: fd.get('targetDate'),
            status,
            monthlySip: Number(fd.get('monthlySip')) || 0,
            insight: null,
            linkedSources: selectedAssets,
        };
        setLocalGoals([...localGoals, newGoal]);
        setIsModalOpen(false);
        setSelectedAssets([]);
        setSelectedCategory('Vehicle');
    };

    return (
        <div className="goals-page">

            {/* ── Page Header ── */}
            <div className="gp-header">
                <div>
                    <div className="gp-title">My Goals</div>
                    <div className="gp-sub">
                        {localGoals.filter((g) => g.status !== 'Behind').length} active goals &middot; {fmtShort(totalSaved)} saved of {fmtShort(totalTarget)} total target
                    </div>
                </div>
                <button className="gp-btn-primary" onClick={() => setIsModalOpen(true)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Goal
                </button>
            </div>

            {/* ── Metric Cards ── */}
            <div className="gp-metrics-row">
                <div className="gp-metric dark">
                    <div className="gp-mc-top">
                        <span className="gp-mc-label light">Net Saved</span>
                        <div className="gp-mc-icon glow-icon">{ICONS.diamond}</div>
                    </div>
                    <div className="gp-mc-value accent">{fmtShort(totalSaved)}</div>
                    <div className="gp-mc-badge glow">{overallPct}% overall</div>
                </div>
                <div className="gp-metric">
                    <div className="gp-mc-top">
                        <span className="gp-mc-label">On Track</span>
                        <div className="gp-mc-icon green-icon">{ICONS.check}</div>
                    </div>
                    <div className="gp-mc-value green">{onTrackList.length}</div>
                    <div className="gp-mc-badge green-bg">Goals healthy</div>
                </div>
                <div className="gp-metric">
                    <div className="gp-mc-top">
                        <span className="gp-mc-label">Possible</span>
                        <div className="gp-mc-icon teal-icon">{ICONS.trendUp}</div>
                    </div>
                    <div className="gp-mc-value teal">{possibleList.length}</div>
                    <div className="gp-mc-badge teal-bg">Needs small push</div>
                </div>
                <div className="gp-metric">
                    <div className="gp-mc-top">
                        <span className="gp-mc-label">At Risk</span>
                        <div className="gp-mc-icon orange-icon">{ICONS.alert}</div>
                    </div>
                    <div className="gp-mc-value orange">{atRiskList.length}</div>
                    <div className="gp-mc-badge orange-bg">{atRiskList[0]?.title || '—'}</div>
                </div>
                <div className="gp-metric">
                    <div className="gp-mc-top">
                        <span className="gp-mc-label">Total Target</span>
                        <div className="gp-mc-icon blue-icon">{ICONS.target}</div>
                    </div>
                    <div className="gp-mc-value blue">{fmtShort(totalTarget)}</div>
                    <div className="gp-mc-badge blue-bg">{localGoals.length} goals combined</div>
                </div>
            </div>

            {/* ── 3-Column Body ── */}
            <div className="gp-body-grid">

                {/* LEFT: Filters + Progress */}
                <div className="gp-left">
                    <div className="gp-filter-card">
                        <div className="gp-filter-title">Filter by Status</div>
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                className={`gp-filter-btn${activeFilter === f.key ? ' active' : ''}`}
                                onClick={() => setActiveFilter(f.key)}
                            >
                                <div className="gp-fb-left">
                                    <div className="gp-fb-dot" style={{ background: f.dot }} />
                                    <span className="gp-fb-label">{f.label}</span>
                                </div>
                                <span className="gp-fb-count">{filterCounts[f.key]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="gp-progress-card">
                        <div className="gp-pc-label">Overall Progress</div>
                        <div className="gp-pc-title">
                            <span className="gp-pc-saved">{fmtShort(totalSaved)}</span> saved of {fmtShort(totalTarget)}
                        </div>
                        <div className="gp-pc-donut-wrap">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
                                {arcOT > 0 && (
                                    <circle cx="60" cy="60" r="44" fill="none" stroke="#34D399" strokeWidth="16" strokeLinecap="round"
                                        transform="rotate(-90 60 60)"
                                        style={{ strokeDasharray: `${arcOT} ${C}`, strokeDashoffset: 0 }} />
                                )}
                                {arcPO > 0 && (
                                    <circle cx="60" cy="60" r="44" fill="none" stroke="#5EEAD4" strokeWidth="16" strokeLinecap="round"
                                        transform="rotate(-90 60 60)"
                                        style={{ strokeDasharray: `${arcPO} ${C}`, strokeDashoffset: -(arcOT + 2) }} />
                                )}
                                {arcAR > 0 && (
                                    <circle cx="60" cy="60" r="44" fill="none" stroke="#FCD34D" strokeWidth="16" strokeLinecap="round"
                                        transform="rotate(-90 60 60)"
                                        style={{ strokeDasharray: `${arcAR} ${C}`, strokeDashoffset: -(arcOT + arcPO + 4) }} />
                                )}
                                <text x="60" y="56" fontSize="16" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="DM Sans,sans-serif">{overallPct}%</text>
                                <text x="60" y="70" fontSize="9" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="DM Sans,sans-serif">Complete</text>
                            </svg>
                        </div>
                        <div className="gp-pc-stats">
                            <div className="gp-pc-stat-row">
                                <div className="gp-pc-dot" style={{ background: '#34D399' }} />
                                <div className="gp-pc-stat-name">On Track &middot; {onTrackList.length}</div>
                                <div className="gp-pc-stat-val">{fmtShort(onTrackSaved)}</div>
                            </div>
                            <div className="gp-pc-stat-row">
                                <div className="gp-pc-dot" style={{ background: '#5EEAD4' }} />
                                <div className="gp-pc-stat-name">Possible &middot; {possibleList.length}</div>
                                <div className="gp-pc-stat-val">{fmtShort(possibleSaved)}</div>
                            </div>
                            <div className="gp-pc-stat-row">
                                <div className="gp-pc-dot" style={{ background: '#FCD34D' }} />
                                <div className="gp-pc-stat-name">At Risk &middot; {atRiskList.length}</div>
                                <div className="gp-pc-stat-val">{fmtShort(atRiskSaved)}</div>
                            </div>
                            <div className="gp-pc-stat-row">
                                <div className="gp-pc-dot" style={{ background: 'rgba(255,255,255,0.15)' }} />
                                <div className="gp-pc-stat-name">Remaining</div>
                                <div className="gp-pc-stat-val muted">{fmtShort(totalTarget - totalSaved)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE: Goals List */}
                <div className="gp-middle">
                    <div className="gp-list-header">
                        <div>
                            <div className="gp-list-title">
                                {FILTERS.find((f) => f.key === activeFilter)?.label || 'All Goals'}
                            </div>
                            <div className="gp-list-sub">{filtered.length} goal{filtered.length !== 1 ? 's' : ''} &middot; sorted by {sortBy === 'targetDate' ? 'target date' : sortBy === 'progress' ? 'progress' : 'amount saved'}</div>
                        </div>
                        <select className="gp-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="targetDate">Sort: Target Date</option>
                            <option value="progress">Sort: Progress</option>
                            <option value="saved">Sort: Amount Saved</option>
                        </select>
                    </div>

                    <div className="gp-list-wrap">
                        {filtered.map((goal) => {
                            const sc = statusClass(goal.status);
                            const pct = Math.min(Math.round((goal.currentAmount / goal.goalAmount) * 100), 100);
                            const ml = monthsLeft(goal.targetDate);
                            const gap = goal.goalAmount - goal.currentAmount;

                            return (
                                <div key={goal.id} className={`gp-goal-item ${sc}`}>
                                    <div className="gi-row1">
                                        <div className={`gi-emoji ${sc}`}>
                                            {getCatIcon(goal.category)}
                                        </div>
                                        <div className="gi-info">
                                            <div className="gi-name">{goal.title}</div>
                                            <div className="gi-cat">{goal.category}{goal.subLabel && goal.subLabel !== goal.category ? ` · ${goal.subLabel}` : ''}</div>
                                        </div>
                                        <span className={`gi-badge ${sc}`}>• {goal.status}</span>
                                    </div>
                                    <div className="gi-row2">
                                        <div className={`gi-saved ${sc}`}>{fmtINR(goal.currentAmount)}</div>
                                        <div className="gi-sep">/</div>
                                        <div className="gi-target">{fmtINR(goal.goalAmount)}</div>
                                        <div className={`gi-pct ${sc}`}>{pct < 1 ? '<1' : pct}%</div>
                                    </div>
                                    <div className="gi-bar-track">
                                        <div
                                            className={`gi-bar-fill ${sc}`}
                                            ref={(el) => { barRefs.current[`${goal.id}-${activeFilter}`] = el; }}
                                            data-w={`${pct < 1 ? 0.5 : pct}%`}
                                            style={{ width: 0, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }}
                                        />
                                    </div>
                                    <div className="gi-row3">
                                        <div className="gi-meta-item">
                                            <div className="gi-meta-lbl">Target Date</div>
                                            <div className="gi-meta-val">
                                                {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="gi-divider" />
                                        <div className="gi-meta-item">
                                            <div className="gi-meta-lbl">Monthly SIP</div>
                                            <div className="gi-meta-val">{goal.monthlySip ? fmtINR(goal.monthlySip) : '—'}</div>
                                        </div>
                                        <div className="gi-divider" />
                                        <div className="gi-meta-item">
                                            <div className="gi-meta-lbl">Time Left</div>
                                            <div className="gi-meta-val">{ml} months</div>
                                        </div>
                                        <div className="gi-divider" />
                                        <div className="gi-meta-item">
                                            <div className="gi-meta-lbl">Gap to Goal</div>
                                            <div className="gi-meta-val">{fmtINR(gap)}</div>
                                        </div>
                                    </div>
                                    {goal.insight && (
                                        <div className={`gi-insight ${sc}`}>{goal.insight}</div>
                                    )}
                                </div>
                            );
                        })}
                        {filtered.length === 0 && (
                            <div className="gp-empty">No goals match this filter.</div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Recommended SIPs */}
                <div className="gp-right">
                    <div className="gp-sip-card">
                        <div className="gp-sip-head">
                            <div className="gp-sip-title">Recommended SIPs</div>
                            <div className="gp-sip-sub">Monthly contributions per goal</div>
                            <div className="gp-sip-total-row">
                                <span className="gp-sip-total-lbl">Total Suggested / Month</span>
                                <span className="gp-sip-total-val">{fmtINR(totalMonthlyRec)}</span>
                            </div>
                        </div>
                        <div className="gp-sip-list">
                            {localGoals.map((goal) => {
                                const sc = statusClass(goal.status);
                                const pct = Math.min(Math.round((goal.currentAmount / goal.goalAmount) * 100), 100);
                                const hasSuggested = goal.suggestedSip && goal.suggestedSip !== goal.monthlySip;
                                const displaySip = goal.suggestedSip || goal.monthlySip;
                                const sipLabel = sc === 'atrisk' || sc === 'behind'
                                    ? `Required ↑ from ${fmtINR(goal.monthlySip)}`
                                    : hasSuggested
                                        ? `Suggested ↑ from ${fmtINR(goal.monthlySip)}`
                                        : 'Current SIP';
                                return (
                                    <div key={goal.id} className="gp-sip-item">
                                        <div className="gp-sip-item-top">
                                            <div className={`gp-sip-emoji ${sc}`}>
                                                {getCatIcon(goal.category)}
                                            </div>
                                            <div className="gp-sip-name">{goal.title}</div>
                                            <div className={`gp-sip-status ${sc}`}>{goal.status}</div>
                                        </div>
                                        <div className="gp-sip-amt-row">
                                            <div className="gp-sip-amt-lbl">{sipLabel}</div>
                                            <div className={`gp-sip-amt-val ${sc}`}>
                                                {displaySip ? fmtINR(displaySip) : '—'}
                                            </div>
                                        </div>
                                        <div className="gp-sip-bar-track">
                                            <div className={`gp-sip-bar-fill ${sc}`} style={{ width: `${pct < 1 ? 0.5 : pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="gp-sip-foot">
                            <button className="gp-sip-foot-btn" onClick={() => setIsModalOpen(true)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Create New Goal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Create Goal Modal ── */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedAssets([]); setSelectedCategory('Vehicle'); }} title="Create New Goal">
                <form className="modal-form" onSubmit={handleAddGoal}>
                    <div className="modal-form-group">
                        <label>Goal Category</label>
                        <div className="gp-cat-grid">
                            {CATEGORY_OPTS.map((c) => (
                                <div
                                    key={c.value}
                                    className={`gp-cat-opt${selectedCategory === c.value ? ' sel' : ''}`}
                                    onClick={() => setSelectedCategory(c.value)}
                                >
                                    <div className="gp-cat-icon">{c.icon}</div>
                                    <div className="gp-cat-lbl">{c.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-form-group">
                        <label>Goal Name *</label>
                        <div className="modal-input-wrapper">
                            <span className="modal-input-icon">T</span>
                            <input type="text" name="goalTitle" placeholder="e.g. Buy a Kia Seltos" required />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="modal-form-group">
                            <label>Target Amount (₹) *</label>
                            <div className="modal-input-wrapper">
                                <span className="modal-input-icon">₹</span>
                                <input type="number" name="goalAmount" placeholder="0" required />
                            </div>
                        </div>
                        <div className="modal-form-group">
                            <label>Monthly SIP (₹)</label>
                            <div className="modal-input-wrapper">
                                <span className="modal-input-icon">₹</span>
                                <input type="number" name="monthlySip" placeholder="0" />
                            </div>
                        </div>
                    </div>
                    <div className="modal-form-group">
                        <label>Target Date *</label>
                        <div className="modal-input-wrapper">
                            <span className="modal-input-icon">{ICONS.calendar}</span>
                            <input type="date" name="targetDate" required />
                        </div>
                    </div>
                    <div className="modal-form-group">
                        <label>Link Savings / Investments (Optional)</label>
                        <div className="asset-link-list">
                            {assets.filter((a) => a.category === 'savings' || a.category === 'investments').map((asset) => (
                                <label key={asset.id} className="asset-link-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedAssets.includes(asset.id)}
                                        onChange={() => handleToggleAsset(asset.id)}
                                        style={{ width: '16px', height: '16px', accentColor: '#2D7A4F' }}
                                    />
                                    <div className="asset-link-info">
                                        <div className="asset-link-name">{asset.name}</div>
                                        <div className="asset-link-value">{asset.category} · {formatCurrency(asset.currentValue)}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="modal-btn modal-btn-submit">Create Goal</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
