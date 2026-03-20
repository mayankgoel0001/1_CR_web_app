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

const colorMap = {
    green: {
        bar: 'bg-green-bar',
        val: 'text-[#2D7A4F]',
    },
    blue: {
        bar: 'bg-blue-bar',
        val: 'text-[#2563EB]',
    },
    orange: {
        bar: 'bg-orange-bar',
        val: 'text-[#D97706]',
    },
    purple: {
        bar: 'bg-purple-bar',
        val: 'text-[#7C3AED]',
    },
};

const goalProgressBg = {
    'at-risk': 'bg-orange-bar',
    possible: 'bg-blue-bar',
    'on-track': 'bg-green-bar',
    behind: 'bg-red-bar',
};

const goalAccentColor = {
    'at-risk': '#F59E0B',
    possible: '#3B82F6',
    'on-track': '#2D7A4F',
    behind: '#EF4444',
};

const goalBadgeStyles = {
    'at-risk': 'bg-[#FFFBEB] text-[#92400E]',
    possible: 'bg-[#EFF6FF] text-[#1D4ED8]',
    'on-track': 'bg-[#E8F5EE] text-[#2D7A4F]',
    behind: 'bg-[#FEF2F2] text-[#EF4444]',
};

export default function DashboardPage() {
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
        <div className="flex flex-col gap-5 text-[#0D1F17] font-sans animate-fade-up">
            {/* SVG defs */}
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
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] xl:grid-cols-[340px_1fr_300px] gap-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>

                {/* Financial Health Score */}
                <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-6 relative overflow-hidden flex flex-col">
                    <div className="text-[11px] font-bold text-[#183325] uppercase tracking-[0.8px] mb-[18px]">
                        Financial Health Score
                    </div>
                    <div className="flex items-center gap-5">
                        {/* Gauge */}
                        <div className="relative w-[110px] h-[110px] flex-shrink-0">
                            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(135deg)', overflow: 'visible', width: 110, height: 110 }}>
                                <circle className="gauge-bg" cx="50" cy="50" r="42"
                                    fill="none" stroke="#E8F0EB" strokeWidth="10" strokeLinecap="round"
                                    strokeDasharray="198 264" strokeDashoffset="0" />
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[26px] font-bold text-[#0D1F17] leading-none">{financialScore.overall}</span>
                                <span className="text-[11px] text-black mt-px">/ 100</span>
                            </div>
                        </div>
                        {/* Info */}
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-[5px] bg-[#E8F5EE] text-[#2D7A4F] text-[12px] font-semibold rounded-[20px] px-2.5 py-[3px] mb-2 before:content-['●'] before:text-[8px]">
                                {financialScore.rating}
                            </div>
                            <div className="text-[12.5px] text-black font-medium leading-[1.5] mb-3.5">{financialScore.description}</div>
                            <Link className="inline-flex items-center gap-[5px] text-[#2D7A4F] text-[12.5px] font-semibold no-underline cursor-pointer border-b-[1.5px] border-[#C5E8D1] pb-px hover:border-[#2D7A4F]" to="/financial-detail">
                                View Full Report
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}>
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                    {/* Score mini breakdown */}
                    <div className="mt-[18px] pt-4 border-t border-[#E4EDE8] flex flex-col gap-2">
                        {financialScore.categories.map((cat, idx) => {
                            const colorKey = cat.name === 'Liquidity' || cat.name === 'Investments' ? 'green'
                                : cat.name === 'Savings Rate' ? 'orange'
                                    : cat.name === 'Protection' ? 'purple'
                                        : 'blue';
                            const colors = colorMap[colorKey];
                            return (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="text-[11px] text-black font-semibold w-[72px] flex-shrink-0">
                                        {cat.name === 'Debt Management' ? 'Debt' : cat.name === 'Savings Rate' ? 'Savings' : cat.name}
                                    </span>
                                    <div className="flex-1 h-1.5 bg-[#EEF2EF] rounded-full overflow-hidden">
                                        <div className={`bd-bar h-full rounded-full ${colors.bar}`} data-width={`${cat.score}%`} />
                                    </div>
                                    <span className={`text-[11px] font-bold w-[22px] text-right flex-shrink-0 ${colors.val}`}>{cat.score}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Net Worth Hero */}
                <div className="bg-gradient-to-br from-[rgba(45,122,79,0.12)] to-[rgba(45,122,79,0.05)] border border-[rgba(45,122,79,0.24)] rounded-[14px] p-[22px] relative overflow-hidden flex flex-col gap-0">
                    <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: '1fr auto' }}>
                        <div>
                            <div className="text-[11px] text-black font-bold uppercase tracking-[0.8px] mb-1">Total Net Worth</div>
                            <div className="text-[34px] font-bold text-[#183325] leading-none tracking-[-1px]">
                                ₹<span>{dashboardNetWorthHero.totalNetWorth.replace('₹', '').replace('L', '')}</span>L
                            </div>
                            <div className="inline-flex items-center gap-1 bg-[rgba(45,122,79,0.12)] border border-[rgba(45,122,79,0.24)] text-[#2D7A4F] text-[11.5px] font-semibold rounded-[6px] px-2 py-[3px] mt-1.5">
                                {dashboardNetWorthHero.changeText}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <div className="text-right">
                                <div className="text-[10px] text-black font-semibold uppercase tracking-[0.5px]">Total Assets</div>
                                <div className="text-[16px] font-bold text-[#183325]">{dashboardNetWorthHero.totalAssets}</div>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', width: '80px', marginLeft: 'auto' }} />
                            <div className="text-right">
                                <div className="text-[10px] text-black font-semibold uppercase tracking-[0.5px]">Liabilities</div>
                                <div className="text-[16px] font-bold text-[#C24141]">{dashboardNetWorthHero.liabilities}</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1px_1fr]">
                        <div className="p-3 pl-4">
                            <div className="text-[10px] text-black font-semibold uppercase tracking-[0.6px] mb-0.5">Cash Runway</div>
                            <div className="text-[18px] font-bold text-[#183325]">{dashboardNetWorthHero.cashRunway}</div>
                            <div className="text-[11px] text-black mt-px">{dashboardNetWorthHero.cashRunwaySub}</div>
                        </div>
                        <div className="hidden sm:block bg-[rgba(45,122,79,0.16)]" />
                        <div className="p-3 pl-4">
                            <div className="text-[10px] text-black font-semibold uppercase tracking-[0.6px] mb-0.5">ROI (YTD)</div>
                            <div className="text-[18px] font-bold text-[#183325]">{dashboardNetWorthHero.roi}</div>
                            <div className="text-[11px] text-black mt-px">{dashboardNetWorthHero.roiSub}</div>
                        </div>
                    </div>
                    {/* Allocation bar */}
                    <div className="px-4 pt-3 pb-3.5 border-t border-[rgba(45,122,79,0.16)]">
                        <div className="text-[10px] text-black uppercase tracking-[0.6px] mb-2 font-bold">Portfolio Allocation</div>
                        <div className="h-1.5 rounded-full overflow-hidden flex mb-2.5">
                            {dashboardNetWorthHero.allocation.map((alloc, idx) => (
                                <div key={idx} className="alloc-seg anim-bar h-full" data-width={alloc.width} style={{ background: alloc.color, marginLeft: idx > 0 ? '2px' : '0' }} />
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {dashboardNetWorthHero.allocation.map((alloc, idx) => (
                                <div key={idx} className="flex items-center gap-[5px]">
                                    <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: alloc.color }} />
                                    <span className="text-[10.5px] text-black">{alloc.name}</span>
                                    <span className="text-[10.5px] text-black font-bold ml-px">{alloc.pct}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Alerts */}
                <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="text-[14px] font-bold text-[#183325] flex items-center">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '7px' }}>
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            Active Alerts
                        </div>
                        <span className="bg-[#FEE2E2] text-[#DC2626] text-[11px] font-bold rounded-[20px] px-2 py-0.5">
                            {dashboardAlerts.length} Action{dashboardAlerts.length !== 1 ? 's' : ''} Required
                        </span>
                    </div>
                    {dashboardAlerts.map((alert, idx) => (
                        <div key={idx}
                            className={`rounded-[10px] p-[11px_13px] border-l-[3px] flex flex-col gap-[3px] ${alert.type === 'warning' ? 'bg-[#FFFBEB] border-[#F59E0B]' : 'bg-[#FEF2F2] border-[#EF4444]'}`}>
                            <span className={`text-[9.5px] font-bold uppercase tracking-[0.5px] ${alert.type === 'warning' ? 'text-[#92400E]' : 'text-[#991B1B]'}`}>{alert.tag}</span>
                            <div className="text-[12.5px] font-bold text-[#183325]">{alert.title}</div>
                            <div className="text-[11.5px] text-black font-medium leading-[1.4]">{alert.desc}</div>
                            <span className="text-[11.5px] font-semibold text-[#2D7A4F] mt-1 cursor-pointer w-fit hover:underline">{alert.link}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ROW 2: Portfolio Snapshot + Goals Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>

                {/* Top Performing Assets */}
                <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-[14px] font-bold text-[#0D1F17]">Top Performing Assets</div>
                            <div className="text-[11.5px] text-black mt-0.5">Highest return in your portfolio</div>
                        </div>
                        <Link to="/portfolio" className="text-[12px] font-semibold text-[#2D7A4F] cursor-pointer whitespace-nowrap no-underline">View All →</Link>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {dashboardTopAssets.map((asset, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-[11px_13px] bg-[#F0F4F1] rounded-[10px] border border-[#E4EDE8] transition-all duration-150 cursor-pointer hover:bg-[#E8F5EE] hover:border-[#C5E8D1] hover:translate-x-0.5">
                                <div className={`w-[22px] h-[22px] flex items-center justify-center flex-shrink-0 ${asset.rank === 3 ? 'opacity-75' : ''}`}>
                                    {asset.rank === 1 ? ICONS.rankGold : asset.rank === 2 ? ICONS.rankSilver : ICONS.rankBronze}
                                </div>
                                <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-[#0D1F17] flex-shrink-0" style={{ background: asset.bg }}>
                                    {getAssetIcon(asset.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12.5px] font-semibold text-[#0D1F17] whitespace-nowrap overflow-hidden text-ellipsis">{asset.name}</div>
                                    <div className="text-[11px] text-black mt-px">{asset.type} · {asset.invested}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-[13px] font-bold text-[#0D1F17]">{asset.currentValue}</div>
                                    <div className={`text-[11px] font-semibold mt-0.5 flex items-center gap-[3px] justify-end ${asset.returnPct.startsWith('-') ? 'text-[#EF4444]' : 'text-[#2D7A4F]'}`}>
                                        {asset.returnPct.startsWith('-') ? '▼' : '▲'} {asset.returnPct} {asset.returnLabel}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Goals Progress */}
                <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-[14px] font-bold text-[#0D1F17]">Goals Progress</div>
                            <div className="text-[11.5px] text-black mt-0.5">Track your financial milestones</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold bg-[#E8F5EE] text-[#2D7A4F] rounded-[20px] px-[9px] py-0.5">{dashboardGoals.length} Active</span>
                            <Link to="/goals" className="text-[12px] font-semibold text-[#2D7A4F] cursor-pointer no-underline">View All →</Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                        {dashboardGoals.map((goal, idx) => (
                            <div key={idx}
                                className="flex flex-col gap-1.5 p-[12px_14px] rounded-[10px] border border-[#E4EDE8] bg-[#F0F4F1] relative overflow-hidden transition-all duration-150 cursor-pointer hover:translate-x-0.5 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                                style={{ borderLeft: `3px solid ${goalAccentColor[goal.status]}` }}
                            >
                                <div className="flex items-center gap-[9px]">
                                    <span className="w-7 h-7 flex items-center justify-center text-black">{getCatIcon(goal.category || 'Other')}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[12.5px] font-bold text-[#0D1F17]">{goal.name}</div>
                                        <div className="text-[11px] text-black mt-px">Target {goal.target} · {goal.due}</div>
                                    </div>
                                    <span className={`text-[10px] font-bold rounded-[20px] px-2 py-0.5 whitespace-nowrap ${goalBadgeStyles[goal.status]}`}>
                                        {goal.statusLabel}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="flex-1 h-[5px] bg-[#E5EDE8] rounded-full overflow-hidden">
                                        <div className={`goal-prog-fill h-full rounded-full ${goalProgressBg[goal.status]}`} data-width={`${goal.pct}%`} />
                                    </div>
                                    <span className="text-[11.5px] font-bold text-black whitespace-nowrap">{goal.pct}%</span>
                                    <span className="text-[11px] text-black whitespace-nowrap">{goal.current} / {goal.total}</span>
                                </div>
                            </div>
                        ))}
                        <div className="mt-auto pt-3 border-t border-[#E4EDE8] flex justify-between items-center">
                            <span className="text-[11.5px] text-black">Combined goal completion</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-[5px] bg-[#E5EDE8] rounded-full overflow-hidden">
                                    <div className="anim-bar h-full bg-green-bar rounded-full" data-width="56%" />
                                </div>
                                <span className="text-[12px] font-bold text-[#2D7A4F]">56%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 3: Net Worth Chart + Right Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 animate-fade-up" style={{ animationDelay: '0.25s' }}>

                {/* Net Worth Chart */}
                <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-start justify-between mb-1.5">
                        <div>
                            <div className="text-[15px] font-bold text-[#0D1F17]">Net Worth Growth</div>
                            <div className="text-[12px] text-black mt-0.5">Your wealth trajectory over time</div>
                        </div>
                        <div className="flex gap-1">
                            {['6M', '1Y', 'All'].map(filter => (
                                <button
                                    key={filter}
                                    className={`text-[12px] font-medium px-3 py-1 rounded-[20px] border cursor-pointer font-sans transition-all duration-150 ${chartFilter === filter ? 'bg-[#2D7A4F] text-white border-[#2D7A4F]' : 'bg-transparent text-black border-[#E4EDE8] hover:bg-[#E8F5EE] hover:border-[#C5E8D1]'}`}
                                    onClick={() => setChartFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2.5 mb-5">
                        <div className="text-[30px] font-extrabold text-[#0D1F17] tracking-[-1px] font-sans">₹78,69,000</div>
                        <div className="inline-flex items-center gap-1 bg-[#E8F5EE] text-[#2D7A4F] text-[11.5px] font-semibold rounded-[6px] px-2 py-[3px]">▲ +12.5% this year</div>
                    </div>
                    <div className="relative h-[160px] mb-[18px]">
                        <svg className="w-full h-[160px]" viewBox="0 0 700 160" preserveAspectRatio="none">
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
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1px 1fr' }}>
                        <div className="p-3 pl-4">
                            <div className="text-[10px] text-black uppercase tracking-[0.6px] font-semibold mb-[3px]">Total Assets</div>
                            <div className="text-[17px] font-bold text-[#0D1F17]">₹84.19L</div>
                            <div className="chart-stat-bar green h-1 rounded-full mt-1.5 bg-green-bar" data-width="94%" style={{ width: '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                        </div>
                        <div className="bg-[#E4EDE8]" />
                        <div className="p-3 pl-4">
                            <div className="text-[10px] text-black uppercase tracking-[0.6px] font-semibold mb-[3px]">Total Liabilities</div>
                            <div className="text-[17px] font-bold text-[#EF4444]">₹5.50L</div>
                            <div className="chart-stat-bar red h-1 rounded-full mt-1.5 bg-red-bar" data-width="6%" style={{ width: '0%', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex flex-col gap-3.5">
                    {/* Next Action card */}
                    <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[18px] relative overflow-hidden border-l-4 border-l-[#F59E0B]">
                        <div className="inline-flex items-center gap-[5px] bg-[#FFFBEB] text-[#92400E] text-[10px] font-bold rounded-[20px] px-[9px] py-[3px] uppercase tracking-[0.5px] mb-[9px]">
                            {ICONS.lightning} Next Big Milestone
                        </div>
                        <div className="text-[14.5px] font-bold text-[#0D1F17] mb-[5px]">Secure Your Future</div>
                        <div className="text-[12px] text-black leading-[1.5] mb-3">You have 2 upcoming high-value expenses in 2025. Set up a dedicated fund today to stay on track.</div>
                        <div className="flex items-center justify-between">
                            <span className="text-[12.5px] font-semibold text-[#2D7A4F] cursor-pointer">Explore Planning Tools →</span>
                            <span className="bg-[#E8F5EE] text-[#2D7A4F] text-[10.5px] font-bold rounded-[20px] px-2 py-0.5">+15 pts</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-[#E4EDE8] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[18px] flex-1">
                        <div className="text-[13px] font-bold text-[#0D1F17] mb-3.5">Quick Actions</div>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
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
                                <div key={idx} className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-[10px] cursor-pointer border border-[#E4EDE8] bg-[#F0F4F1] transition-all duration-150 hover:bg-[#E8F5EE] hover:border-[#C5E8D1] hover:-translate-y-px">
                                    <div className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center text-[#0D1F17]" style={{ background: action.bg }}>{action.icon}</div>
                                    <span className="text-[10px] font-semibold text-black text-center leading-[1.2]">{action.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
