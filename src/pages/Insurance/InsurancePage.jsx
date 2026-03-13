import React, { useState, useMemo } from 'react';
import { insurancePolicies } from '../../data/mockData';
import { ICONS, getInsuranceIcon } from '../../utils/icons';
import './InsurancePage.css';

const formatLakhs = (amount) => {
    if (amount >= 100000) {
        return '₹' + (amount / 100000) + 'L';
    }
    return '₹' + amount.toLocaleString('en-IN');
};

const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
};

const getPolicyClass = (type) => {
    switch (type.toLowerCase()) {
        case 'life': return 'life';
        case 'health': return 'health';
        case 'vehicle': return 'vehicle';
        case 'term': return 'term';
        default: return 'neutral';
    }
};

const monthDiff = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
};

// We add the missing policy from the screenshot
const missingPolicy = {
    id: 4,
    insurer: 'Star Health Term Plan',
    policyNumber: 'SH-TERM-2024-412',
    type: 'Term',
    status: 'active',
    coverageAmount: 2500000,
    premiumAmount: 9500,
    premiumFrequency: 'Annual',
    startDate: '2024-08-01',
    renewalDate: '2027-08-01'
};

const ALL_POLICIES = [...insurancePolicies, missingPolicy];

export default function InsurancePage() {
    const [localPolicies, setLocalPolicies] = useState(ALL_POLICIES);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCat, setSelectedCat] = useState('Life');

    const filtered = activeFilter === 'all'
        ? localPolicies
        : localPolicies.filter(p => p.type.toLowerCase() === activeFilter.toLowerCase() || (activeFilter === 'term' && p.type === 'Term'));

    const totalCoverage = localPolicies.reduce((s, p) => s + p.coverageAmount, 0);
    const totalPremium = localPolicies.reduce((s, p) => s + p.premiumAmount, 0);
    const activeCount = localPolicies.filter(p => p.status === 'active').length;

    // Upcoming Renewal
    const sortedByRenewal = [...localPolicies].sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));
    const nextRenewal = sortedByRenewal[0] || null;
    const nextRenewalDate = nextRenewal ? new Date(nextRenewal.renewalDate) : new Date();
    const nextMonthYear = nextRenewal ? nextRenewalDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 'N/A';
    const monthsAway = nextRenewal ? monthDiff(new Date(), nextRenewalDate) : 0;

    // Life Cover
    const lifePolicy = localPolicies.find(p => p.type === 'Life');
    const lifeCoverStr = lifePolicy ? formatLakhs(lifePolicy.coverageAmount) : '₹0';

    const filterCounts = {
        all: localPolicies.length,
        life: localPolicies.filter(p => p.type === 'Life').length,
        health: localPolicies.filter(p => p.type === 'Health').length,
        vehicle: localPolicies.filter(p => p.type === 'Vehicle').length,
        term: localPolicies.filter(p => p.type === 'Term').length,
    };

    const handleAddPolicy = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newPolicy = {
            id: Date.now(),
            insurer: fd.get('insurer'),
            policyNumber: fd.get('policyNumber'),
            type: selectedCat,
            status: 'active',
            coverageAmount: Number(fd.get('coverageAmount')),
            premiumAmount: Number(fd.get('premiumAmount')),
            premiumFrequency: 'Annual',
            startDate: fd.get('startDate'),
            renewalDate: fd.get('renewalDate'),
        };
        setLocalPolicies(prev => [...prev, newPolicy]);
        setIsModalOpen(false);
    };

    const categories = [
        { label: 'Life', icon: ICONS.shield },
        { label: 'Health', icon: ICONS.healthCross },
        { label: 'Vehicle', icon: ICONS.Vehicle },
        { label: 'Home', icon: ICONS.Home },
        { label: 'Travel', icon: ICONS.Travel },
        { label: 'Term', icon: ICONS.clipboard },
        { label: 'Business', icon: ICONS.briefcase },
        { label: 'Other', icon: ICONS.Other }
    ];

    return (
        <div className="insurance-page-container">
            <main className="insurance-page-content">

                {/* PAGE HEADER */}
                <div className="ins-page-header">
                    <div>
                        <h1 className="ins-page-title">Insurance & Protection</h1>
                        <div className="ins-page-sub">{activeCount} active policies · {formatLakhs(totalCoverage)} total coverage · Next renewal in {monthsAway} months</div>
                    </div>
                    <button className="ins-btn-primary" onClick={() => setIsModalOpen(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Policy
                    </button>
                </div>

                {/* METRIC CARDS */}
                <div className="ins-metrics-row">
                    <div className="ins-metric-card dark c1">
                        <div className="ins-mc-top"><div className="ins-mc-label light">Total Coverage</div><div className="ins-mc-icon glow">{ICONS.shield}</div></div>
                        <div className="ins-mc-value ">{formatLakhs(totalCoverage)}</div>
                        <div className="ins-mc-badge glow">{activeCount} policies active</div>
                    </div>
                    <div className="ins-metric-card c2">
                        <div className="ins-mc-top"><div className="ins-mc-label">Annual Premium</div><div className="ins-mc-icon green">{ICONS.creditCard}</div></div>
                        <div className="ins-mc-value green">{formatCurrency(totalPremium)}</div>
                        <div className="ins-mc-badge green">{formatCurrency(Math.floor(totalPremium / 12))}/month</div>
                    </div>
                    <div className="ins-metric-card c3">
                        <div className="ins-mc-top"><div className="ins-mc-label">Upcoming Renewal</div><div className="ins-mc-icon orange">{ICONS.calendar}</div></div>
                        <div className="ins-mc-value orange">{nextMonthYear}</div>
                        <div className="ins-mc-badge orange">{nextRenewal ? nextRenewal.insurer.split(' ')[0] : 'None'} · {monthsAway} mo</div>
                    </div>
                    <div className="ins-metric-card c4">
                        <div className="ins-mc-top"><div className="ins-mc-label">Coverage Gap</div><div className="ins-mc-icon red">{ICONS.alert}</div></div>
                        <div className="ins-mc-value red">None</div>
                        <div className="ins-mc-badge green">All types covered</div>
                    </div>
                    <div className="ins-metric-card c5">
                        <div className="ins-mc-top"><div className="ins-mc-label">Life Cover</div><div className="ins-mc-icon purple">{ICONS.shield}</div></div>
                        <div className="ins-mc-value purple">{lifeCoverStr}</div>
                        <div className="ins-mc-badge purple">{lifePolicy ? lifePolicy.insurer + ' Life policy' : 'No Policy'}</div>
                    </div>
                </div>

                {/* 3-COLUMN BODY */}
                <div className="ins-body-grid">

                    {/* LEFT: Filters + Coverage Donut */}
                    <div className="ins-left-panel">
                        <div className="ins-filter-card">
                            <div className="ins-filter-card-title">Filter by Type</div>
                            <button className={`ins-filter-btn all ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                                <div className="ins-fb-left"><span className="ins-fb-icon">{ICONS.document}</span><span className="ins-fb-label">All Policies</span></div>
                                <span className="ins-fb-count">{filterCounts.all}</span>
                            </button>
                            <button className={`ins-filter-btn life ${activeFilter === 'life' ? 'active' : ''}`} onClick={() => setActiveFilter('life')}>
                                <div className="ins-fb-left"><span className="ins-fb-icon">{ICONS.shield}</span><span className="ins-fb-label">Life</span></div>
                                <span className="ins-fb-count">{filterCounts.life}</span>
                            </button>
                            <button className={`ins-filter-btn health ${activeFilter === 'health' ? 'active' : ''}`} onClick={() => setActiveFilter('health')}>
                                <div className="ins-fb-left"><span className="ins-fb-icon">{ICONS.healthCross}</span><span className="ins-fb-label">Health</span></div>
                                <span className="ins-fb-count">{filterCounts.health}</span>
                            </button>
                            <button className={`ins-filter-btn vehicle ${activeFilter === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveFilter('vehicle')}>
                                <div className="ins-fb-left"><span className="ins-fb-icon">{ICONS.Vehicle}</span><span className="ins-fb-label">Vehicle</span></div>
                                <span className="ins-fb-count">{filterCounts.vehicle}</span>
                            </button>
                            <button className={`ins-filter-btn term ${activeFilter === 'term' ? 'active' : ''}`} onClick={() => setActiveFilter('term')}>
                                <div className="ins-fb-left"><span className="ins-fb-icon">{ICONS.clipboard}</span><span className="ins-fb-label">Term / Other</span></div>
                                <span className="ins-fb-count">{filterCounts.term}</span>
                            </button>
                        </div>

                        <div className="ins-coverage-card">
                            <div className="ins-cc-label">Coverage Breakdown</div>
                            <div className="ins-cc-title">₹<span>{totalCoverage / 100000}L</span> total protection</div>
                            <div className="ins-cc-donut-wrap">
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
                            <div className="ins-cc-stats">
                                {localPolicies.map(policy => {
                                    let dotColor = '#9CA3AF';
                                    if (policy.type === 'Life') dotColor = '#A78BFA';
                                    if (policy.type === 'Term') dotColor = '#FCD34D';
                                    if (policy.type === 'Health') dotColor = '#FCA5A5';
                                    if (policy.type === 'Vehicle') dotColor = '#93C5FD';
                                    return (
                                        <div key={'cb-' + policy.id} className="ins-cc-stat-row">
                                            <div className="ins-cc-stat-dot" style={{ background: dotColor }}></div>
                                            <div className="ins-cc-stat-name">{policy.type} ({policy.insurer.split(' ')[0]})</div>
                                            <div className="ins-cc-stat-val">{formatLakhs(policy.coverageAmount)}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE: Policy Cards List */}
                    <div className="ins-middle-panel">
                        <div className="ins-policies-header">
                            <div>
                                <h2 className="ins-policies-title">All Policies</h2>
                                <div className="ins-policies-sub">{filtered.length} active · sorted by renewal date</div>
                            </div>
                            <select className="ins-sort-select">
                                <option>Sort: Renewal Date</option>
                                <option>Sort: Coverage Amount</option>
                                <option>Sort: Premium</option>
                                <option>Sort: Type</option>
                            </select>
                        </div>

                        <div className="ins-policies-list">
                            {filtered.map(policy => {
                                const typeClass = getPolicyClass(policy.type);
                                const isRenewingSoon = monthDiff(new Date(), new Date(policy.renewalDate)) <= 12;
                                return (
                                    <div key={policy.id} className={`ins-policy-card ${typeClass}`}>
                                        <div className="ins-pc-row1">
                                            <div className={`ins-pc-icon-wrap ${typeClass}`}>{getInsuranceIcon(policy.type)}</div>
                                            <div className="ins-pc-info">
                                                <div className="ins-pc-name">{policy.insurer}</div>
                                                <div className="ins-pc-id">{policy.policyNumber}</div>
                                            </div>
                                            <div className="ins-pc-badges">
                                                <span className={`ins-type-pill ${typeClass}`}>{policy.type}</span>
                                                {isRenewingSoon && policy.type === 'Health' ? (
                                                    <span className="ins-status-pill expiring">Renewing Soon</span>
                                                ) : (
                                                    <span className="ins-status-pill active">Active</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ins-pc-row2">
                                            <div>
                                                <div className="ins-pc-field-label">Coverage</div>
                                                <div className="ins-pc-field-val big">{formatCurrency(policy.coverageAmount)}</div>
                                            </div>
                                            <div>
                                                <div className="ins-pc-field-label">Premium</div>
                                                <div className="ins-pc-field-val">{formatCurrency(policy.premiumAmount)}/yr</div>
                                            </div>
                                            <div>
                                                <div className="ins-pc-field-label">Renewal</div>
                                                <div className="ins-pc-field-val">{new Date(policy.renewalDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* RIGHT: Renewal Timeline + Premium Summary */}
                    <div className="ins-right-panel">

                        <div className="ins-renewal-card">
                            <div className="ins-rc-head">
                                <div className="ins-rc-title">Renewal Timeline</div>
                                <div className="ins-rc-sub">Upcoming policy renewals</div>
                            </div>
                            <div className="ins-timeline-scroll">
                                <div className="ins-timeline">
                                    {sortedByRenewal.map(policy => {
                                        const m = monthDiff(new Date(), new Date(policy.renewalDate));
                                        let urgencyClass = 'far';
                                        if (m <= 3) urgencyClass = 'urgent';
                                        else if (m <= 9) urgencyClass = 'soon';
                                        else if (m <= 18) urgencyClass = 'ok';

                                        return (
                                            <div key={'tl-' + policy.id} className="ins-tl-item">
                                                <div className={`ins-tl-dot ${urgencyClass}`}>{getInsuranceIcon(policy.type)}</div>
                                                <div className="ins-tl-content">
                                                    <div className="ins-tl-name">{policy.insurer}</div>
                                                    <div className="ins-tl-date">{new Date(policy.renewalDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · {formatCurrency(policy.premiumAmount)}</div>
                                                    <div className={`ins-tl-days ${urgencyClass}`}>{m} months away</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="ins-premium-card">
                            <div className="ins-prem-head">
                                <div className="ins-prem-title">Premium Breakdown</div>
                                <div className="ins-prem-sub">Annual spend per policy</div>
                            </div>
                            <div className="ins-prem-scroll">
                                <div className="ins-prem-list">
                                    {localPolicies.map(policy => {
                                        let dotColor = '#9CA3AF';
                                        if (policy.type === 'Life') dotColor = '#A78BFA';
                                        if (policy.type === 'Term') dotColor = '#FCD34D';
                                        if (policy.type === 'Health') dotColor = '#FCA5A5';
                                        if (policy.type === 'Vehicle') dotColor = '#93C5FD';
                                        return (
                                            <div key={'pr-' + policy.id} className="ins-prem-row">
                                                <div className="ins-prem-dot" style={{ background: dotColor }}></div>
                                                <div className="ins-prem-name">{policy.insurer.split(' ')[0]} {policy.type}</div>
                                                <div className="ins-prem-freq">annual</div>
                                                <div className="ins-prem-val">{formatCurrency(policy.premiumAmount)}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="ins-prem-foot">
                                <div className="ins-prem-total-row">
                                    <span className="ins-prem-total-label">Total Annual Premium</span>
                                    <span className="ins-prem-total-val">{formatCurrency(totalPremium)}</span>
                                </div>
                            </div>
                        </div>

                        <button className="ins-add-policy-btn" onClick={() => setIsModalOpen(true)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add New Policy
                        </button>
                    </div>

                </div>
            </main>

            {/* MODAL */}
            <div className={`ins-modal-overlay ${isModalOpen ? 'open' : ''}`}>
                <div className="ins-modal">
                    <div className="ins-modal-header">
                        <div><div className="ins-modal-title">Add New Policy</div><div className="ins-modal-sub">Track a new insurance policy</div></div>
                        <button className="ins-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                    </div>
                    <form onSubmit={handleAddPolicy}>
                        <div style={{ marginBottom: '16px' }}>
                            <div className="ins-form-label" style={{ marginBottom: '8px' }}>Policy Type</div>
                            <div className="ins-cat-grid">
                                {categories.map(c => (
                                    <div key={c.label} className={`ins-cat-opt ${selectedCat === c.label ? 'sel' : ''}`} onClick={() => setSelectedCat(c.label)}>
                                        <div className="ins-cat-opt-icon">{c.icon}</div>
                                        <div className="ins-cat-opt-label">{c.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="ins-form-grid">
                            <div className="ins-form-group full"><label className="ins-form-label">Insurer Name</label><input name="insurer" className="ins-form-input" type="text" placeholder="e.g. LIC, HDFC ERGO, Niva Bupa" required /></div>
                            <div className="ins-form-group full"><label className="ins-form-label">Policy Number</label><input name="policyNumber" className="ins-form-input" type="text" placeholder="e.g. LIC-LIFE-2023-789" required /></div>
                            <div className="ins-form-group"><label className="ins-form-label">Coverage Amount (₹)</label><input name="coverageAmount" className="ins-form-input" type="number" placeholder="0" required /></div>
                            <div className="ins-form-group"><label className="ins-form-label">Annual Premium (₹)</label><input name="premiumAmount" className="ins-form-input" type="number" placeholder="0" required /></div>
                            <div className="ins-form-group"><label className="ins-form-label">Policy Start Date</label><input name="startDate" className="ins-form-input" type="date" required /></div>
                            <div className="ins-form-group"><label className="ins-form-label">Renewal Date</label><input name="renewalDate" className="ins-form-input" type="date" required /></div>
                            <div className="ins-form-group full"><label className="ins-form-label">Notes (optional)</label><input name="notes" className="ins-form-input" type="text" placeholder="e.g. Family floater, includes dental" /></div>
                        </div>
                        <div className="ins-modal-footer">
                            <button type="button" className="ins-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" className="ins-btn-save">Add Policy</button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    );
}
