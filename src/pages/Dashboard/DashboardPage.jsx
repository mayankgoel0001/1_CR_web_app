import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    financialScore,
    dashboardTopAssets,
    dashboardGoals,
    dashboardAlerts,
    dashboardNetWorthHero
} from '../../data/mockData';
import { ICONS, getCatIcon, getAssetIcon } from '../../utils/icons';
import './DashboardPage.css';

export default function DashboardPage() {
    // Quick animation on mount
    useEffect(() => {
        const bars = document.querySelectorAll('.anim-bar, .bd-bar, .goal-prog-fill, .chart-stat-bar');
        bars.forEach(bar => {
            const finalWidth = bar.getAttribute('data-width') || bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = finalWidth; }, 300);
        });

        const gauges = document.querySelectorAll('.gauge-fill');
        gauges.forEach(gauge => {
            const finalArray = gauge.getAttribute('data-dasharray');
            gauge.style.strokeDasharray = '0 264';
            setTimeout(() => { gauge.style.strokeDasharray = finalArray; }, 300);
        });
    }, []);

    const [chartFilter, setChartFilter] = useState('1Y');

    return (
        <div className="dashboard-page-container">
            {/* SVG defs for gauge and chart gradients */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2D7A4F" />
                        <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2D7A4F" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#2D7A4F" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* ROW 1: Score + Net Worth Hero + Alerts */}
            <div className="row-1">

                {/* Financial Health Score */}
                <div className="score-card">
                    <div className="score-card-title">Financial Health Score</div>
                    <div className="score-main">
                        <div className="gauge-wrap">
                            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(135deg)', overflow: 'visible' }}>
                                <circle className="gauge-bg" cx="50" cy="50" r="42" strokeDasharray="198 264" strokeDashoffset="0" />
                                <circle className="gauge-fill" cx="50" cy="50" r="42"
                                    stroke="url(#gaugeGrad)"
                                    data-dasharray={`${198 * (financialScore.overall / 100)} 264`}
                                    style={{
                                        strokeDashoffset: 0,
                                        strokeLinecap: 'round',
                                        fill: 'none',
                                        strokeWidth: 10,
                                        filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.5))',
                                        transition: 'stroke-dasharray 1.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}
                                />
                            </svg>
                            <div className="gauge-center">
                                <span className="gauge-number">{financialScore.overall}</span>
                                <span className="gauge-denom">/ 100</span>
                            </div>
                        </div>
                        <div className="score-info">
                            <div className="score-status">{financialScore.rating}</div>
                            <div className="score-desc">{financialScore.description}</div>
                            <Link className="score-link" to="/financial-detail">
                                View Full Report
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}>
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                    {/* Score mini breakdown */}
                    <div className="score-breakdown">
                        {financialScore.categories.map((cat, idx) => {
                            const colorClass = cat.name === 'Liquidity' || cat.name === 'Investments' ? 'green'
                                : cat.name === 'Savings Rate' ? 'orange'
                                    : cat.name === 'Protection' ? 'purple'
                                        : 'blue'; // Debt Management
                            return (
                                <div className="breakdown-row" key={idx}>
                                    <span className="bd-label">{cat.name === 'Debt Management' ? 'Debt' : cat.name === 'Savings Rate' ? 'Savings' : cat.name}</span>
                                    <div className="bd-bar-wrap">
                                        <div className={`bd-bar ${colorClass}`} data-width={`${cat.score}%`}></div>
                                    </div>
                                    <span className={`bd-val ${colorClass}`}>{cat.score}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Net Worth Hero */}
                <div className="networth-hero">
                    <div className="nw-top">
                        <div>
                            <div className="nw-label">Total Net Worth</div>
                            <div className="nw-value">₹<span>{dashboardNetWorthHero.totalNetWorth.replace('₹', '').replace('L', '')}</span>L</div>
                            <div className="nw-change">{dashboardNetWorthHero.changeText}</div>
                        </div>
                        <div className="nw-stats">
                            <div className="nw-stat">
                                <div className="nw-stat-label">Total Assets</div>
                                <div className="nw-stat-val">{dashboardNetWorthHero.totalAssets}</div>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', width: '80px', marginLeft: 'auto' }}></div>
                            <div className="nw-stat">
                                <div className="nw-stat-label">Liabilities</div>
                                <div className="nw-stat-val red">{dashboardNetWorthHero.liabilities}</div>
                            </div>
                        </div>
                    </div>
                    <div className="nw-bottom">
                        <div className="nw-metric">
                            <div className="nw-metric-label">Cash Runway</div>
                            <div className="nw-metric-val">{dashboardNetWorthHero.cashRunway}</div>
                            <div className="nw-metric-sub">{dashboardNetWorthHero.cashRunwaySub}</div>
                        </div>
                        <div className="nw-divider-v"></div>
                        <div className="nw-metric">
                            <div className="nw-metric-label">ROI (YTD)</div>
                            <div className="nw-metric-val">{dashboardNetWorthHero.roi}</div>
                            <div className="nw-metric-sub">{dashboardNetWorthHero.roiSub}</div>
                        </div>
                    </div>
                    {/* Asset Allocation Bar */}
                    <div className="nw-alloc">
                        <div className="nw-alloc-label">Portfolio Allocation</div>
                        <div className="nw-alloc-bar">
                            {dashboardNetWorthHero.allocation.map((alloc, idx) => (
                                <div key={idx} className="alloc-seg anim-bar" data-width={alloc.width} style={{ background: alloc.color, marginLeft: idx > 0 ? '2px' : '0' }}></div>
                            ))}
                        </div>
                        <div className="nw-alloc-legend">
                            {dashboardNetWorthHero.allocation.map((alloc, idx) => (
                                <div key={idx} className="alloc-item">
                                    <div className="alloc-dot" style={{ background: alloc.color }}></div>
                                    <span className="alloc-name">{alloc.name}</span>
                                    <span className="alloc-pct">{alloc.pct}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Alerts */}
                <div className="alerts-card">
                    <div className="alerts-header">
                        <div className="alerts-title">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '7px' }}>
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            Active Alerts
                        </div>
                        <span className="alerts-count">{dashboardAlerts.length} Action{dashboardAlerts.length !== 1 ? 's' : ''} Required</span>
                    </div>
                    {dashboardAlerts.map((alert, idx) => (
                        <div key={idx} className={`alert-item ${alert.type}`}>
                            <span className="alert-tag">{alert.tag}</span>
                            <div className="alert-title">{alert.title}</div>
                            <div className="alert-desc">{alert.desc}</div>
                            <span className="alert-link">{alert.link}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ROW 2: Portfolio Snapshot + Goals Progress */}
            <div className="row-2">

                {/* Top Performing Assets */}
                <div className="portfolio-snap">
                    <div className="snap-header">
                        <div>
                            <div className="snap-title">Top Performing Assets</div>
                            <div className="snap-sub">Highest return in your portfolio</div>
                        </div>
                        <Link to="/portfolio" className="snap-link" style={{ textDecoration: 'none' }}>View All →</Link>
                    </div>
                    <div className="snap-assets">
                        {dashboardTopAssets.map((asset, idx) => (
                            <div key={idx} className="snap-asset">
                                <div className={`snap-rank r${asset.rank}`}>{asset.rank === 1 ? ICONS.rankGold : asset.rank === 2 ? ICONS.rankSilver : ICONS.rankBronze}</div>
                                <div className="snap-asset-icon" style={{ background: asset.bg }}>{getAssetIcon(asset.type)}</div>
                                <div className="snap-asset-info">
                                    <div className="snap-asset-name">{asset.name}</div>
                                    <div className="snap-asset-type">{asset.type} · {asset.invested}</div>
                                </div>
                                <div className="snap-asset-right">
                                    <div className="snap-asset-val">{asset.currentValue}</div>
                                    <div className={`snap-asset-ret ${asset.returnPct.startsWith('-') ? 'neg' : 'pos'}`}>
                                        {asset.returnPct.startsWith('-') ? '▼' : '▲'} {asset.returnPct} {asset.returnLabel}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Goals Progress */}
                <div className="goals-strip">
                    <div className="goals-header">
                        <div>
                            <div className="goals-title">Goals Progress</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>Track your financial milestones</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="goals-count-pill">{dashboardGoals.length} Active</span>
                            <Link to="/goals" className="goals-link" style={{ textDecoration: 'none' }}>View All →</Link>
                        </div>
                    </div>
                    <div className="goals-list">
                        {dashboardGoals.map((goal, idx) => (
                            <div key={idx} className={`goal-row ${goal.status}`}>
                                <div className="goal-row-top">
                                    <span className="goal-emoji">{getCatIcon(goal.category || 'Other')}</span>
                                    <div className="goal-row-info">
                                        <div className="goal-row-name">{goal.name}</div>
                                        <div className="goal-row-meta">Target {goal.target} · {goal.due}</div>
                                    </div>
                                    <span className={`goal-status-badge ${goal.status}`}>{goal.statusLabel}</span>
                                </div>
                                <div className="goal-row-bottom">
                                    <div className="goal-prog-wrap">
                                        <div className="goal-prog-fill" data-width={`${goal.pct}%`}></div>
                                    </div>
                                    <span className="goal-pct">{goal.pct}%</span>
                                    <span className="goal-amount-pair">{goal.current} / {goal.total}</span>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>Combined goal completion</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '80px', height: '5px', background: '#E5EDE8', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div className="anim-bar" data-width="56%" style={{ height: '100%', background: 'linear-gradient(90deg,#2D7A4F,#34D399)', borderRadius: '99px' }}></div>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--green)' }}>56%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 3: Net Worth Chart + Right Panel */}
            <div className="row-3">

                {/* Net Worth Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Net Worth Growth</div>
                            <div className="chart-sub">Your wealth trajectory over time</div>
                        </div>
                        <div className="chart-filters">
                            {['6M', '1Y', 'All'].map(filter => (
                                <button
                                    key={filter}
                                    className={`filter-pill ${chartFilter === filter ? 'active' : ''}`}
                                    onClick={() => setChartFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="chart-value-row">
                        <div className="chart-value">₹78,69,000</div>
                        <div className="chart-badge">▲ +12.5% this year</div>
                    </div>

                    {/* SVG Area Chart */}
                    <div className="chart-area">
                        <svg className="chart-svg" viewBox="0 0 700 160" preserveAspectRatio="none">
                            <line x1="0" y1="40" x2="700" y2="40" stroke="#E4EDE8" strokeWidth="1" />
                            <line x1="0" y1="80" x2="700" y2="80" stroke="#E4EDE8" strokeWidth="1" />
                            <line x1="0" y1="120" x2="700" y2="120" stroke="#E4EDE8" strokeWidth="1" />
                            <path d="M0,145 C50,140 100,130 150,120 C200,110 230,100 280,88 C330,76 360,68 410,55 C460,42 500,36 550,28 C600,20 650,18 700,15 L700,155 L0,155 Z" fill="url(#chartFill)" />
                            <path d="M0,145 C50,140 100,130 150,120 C200,110 230,100 280,88 C330,76 360,68 410,55 C460,42 500,36 550,28 C600,20 650,18 700,15" fill="none" stroke="#2D7A4F" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="700" cy="15" r="5" fill="#2D7A4F" />
                            <circle cx="700" cy="15" r="9" fill="rgba(45,122,79,0.2)" />
                            <text x="0" y="158" fontSize="10" fill="#000" fontFamily="Inter, sans-serif">JAN</text>
                            <text x="116" y="158" fontSize="10" fill="#000" fontFamily="Inter, sans-serif">MAR</text>
                            <text x="233" y="158" fontSize="10" fill="#000" fontFamily="Inter, sans-serif">MAY</text>
                            <text x="349" y="158" fontSize="10" fill="#000" fontFamily="Inter, sans-serif">JUL</text>
                            <text x="466" y="158" fontSize="10" fill="#000" fontFamily="Inter, sans-serif">SEP</text>
                            <text x="676" y="158" fontSize="10" fill="#2D7A4F" fontFamily="Inter, sans-serif" fontWeight="700">NOV</text>
                        </svg>
                    </div>

                    <div className="chart-bottom">
                        <div className="chart-stat">
                            <div className="chart-stat-label">Total Assets</div>
                            <div className="chart-stat-val">₹84.19L</div>
                            <div className="chart-stat-bar green" data-width="94%"></div>
                        </div>
                        <div className="chart-divider"></div>
                        <div className="chart-stat">
                            <div className="chart-stat-label">Total Liabilities</div>
                            <div className="chart-stat-val" style={{ color: 'var(--red)' }}>₹5.50L</div>
                            <div className="chart-stat-bar red" data-width="6%"></div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="right-panel">

                    {/* Next Action */}
                    <div className="action-card">
                        <div className="action-tag">{ICONS.lightning} Next Big Milestone</div>
                        <div className="action-title">Secure Your Future</div>
                        <div className="action-desc">You have 2 upcoming high-value expenses in 2025. Set up a dedicated fund today to stay on track.</div>
                        <div className="action-footer">
                            <span className="action-link">Explore Planning Tools →</span>
                            <span className="action-impact">+15 pts</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-card">
                        <div className="quick-title">Quick Actions</div>
                        <div className="quick-grid">
                            {[
                                { label: 'Add Asset', icon: ICONS.briefcase, bg: '#E8F5EE' },
                                { label: 'Add Debt', icon: ICONS.creditCard, bg: '#FEE2E2' },
                                { label: 'New Goal', icon: ICONS.flag, bg: '#FEF3C7' },
                                { label: 'Tax Rep', icon: ICONS.document, bg: '#EFF6FF' },
                                { label: 'Insurance', icon: ICONS.shield, bg: '#F5F3FF' },
                                { label: 'Calculate', icon: ICONS.calculator, bg: '#ECFDF5' },
                                { label: 'Scenarios', icon: ICONS.chartLine, bg: '#FFF7ED' },
                                { label: 'Learn', icon: ICONS.books, bg: '#F0FDF4' },
                            ].map((action, idx) => (
                                <div key={idx} className="quick-item">
                                    <div className="quick-icon" style={{ background: action.bg }}>{action.icon}</div>
                                    <span className="quick-label">{action.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
