import { useState } from 'react';
import { MdCheck, MdArrowForward, MdTrendingUp } from 'react-icons/md';
import { BsShieldCheck, BsCreditCard2Front, BsPiggyBank, BsGraphUpArrow, BsDroplet } from 'react-icons/bs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    financialScore,
    netWorthData,
    alerts,
    formatCurrency,
    formatCurrencyFull,
} from '../../data/mockData';
import './DashboardPage.css';

const categoryIcons = {
    liquidity: { icon: BsDroplet, bg: '#E8F5E9', color: '#16A34A' },
    debt: { icon: BsCreditCard2Front, bg: '#DBEAFE', color: '#2563EB' },
    savings: { icon: BsPiggyBank, bg: '#FEF3C7', color: '#F59E0B' },
    investments: { icon: BsGraphUpArrow, bg: '#E8F5E9', color: '#16A34A' },
    protection: { icon: BsShieldCheck, bg: '#DBEAFE', color: '#2563EB' },
};

function ScoreGauge({ score, rating, description }) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="score-card card">
            <div className="score-gauge-wrapper">
                <svg className="score-gauge-svg" viewBox="0 0 130 130">
                    <circle className="score-gauge-bg" cx="65" cy="65" r={radius} />
                    <circle
                        className="score-gauge-fill"
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#1B8C4E"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className="score-gauge-value">
                    <div className="score-number">{score}</div>
                    <div className="score-label">out of 100</div>
                </div>
            </div>
            <div className="score-info">
                <div className="score-status-badge">Financial Status</div>
                <h2>{rating}</h2>
                <p>{description}</p>
                <button className="btn-primary">Detailed Report</button>
            </div>
        </div>
    );
}

function AlertsCard() {
    return (
        <div className="alerts-card card">
            <h3>Active Alerts</h3>
            {alerts.length === 0 ? (
                <div className="alerts-empty">
                    <div className="alerts-empty-icon">
                        <MdCheck />
                    </div>
                    <div className="alerts-empty-text">
                        <h4>You're all caught up!</h4>
                        <p>No active alerts at this moment.</p>
                    </div>
                </div>
            ) : (
                <div>
                    {alerts.map((alert, i) => (
                        <div key={i}>{alert.message}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ScoreCategoryCards() {
    const iconMap = ['liquidity', 'debt', 'savings', 'investments', 'protection'];

    return (
        <div className="dashboard-categories">
            {financialScore.categories.map((cat, i) => {
                const iconConfig = categoryIcons[iconMap[i]];
                const IconComp = iconConfig.icon;
                const statusClass =
                    cat.status === 'Strong' ? 'badge-strong' :
                        cat.status === 'Good' ? 'badge-good' :
                            cat.status === 'Attention' ? 'badge-attention' : 'badge-danger';

                return (
                    <div key={cat.name} className="category-card card">
                        <div className="category-card-header">
                            <div
                                className="category-icon"
                                style={{ background: iconConfig.bg, color: iconConfig.color }}
                            >
                                <IconComp />
                            </div>
                            <span className={`badge ${statusClass}`}>{cat.status}</span>
                        </div>
                        <div className="category-name">{cat.name}</div>
                        <div className="category-score">
                            <span className="value">{cat.score}</span>
                            <span className="total">/100</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${cat.score}%`,
                                    background: cat.color,
                                }}
                            />
                        </div>
                        <div className="category-action">
                            Take Action <MdArrowForward />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function NetWorthSection() {
    const [activeFilter, setActiveFilter] = useState('6 Months');

    return (
        <div className="networth-card card">
            <div className="networth-header">
                <div className="networth-title">
                    <h3>Total Net Worth</h3>
                    <p>Consolidated view of your financial standing</p>
                </div>
                <div className="networth-filters">
                    <div className="networth-change">
                        <MdTrendingUp /> +{netWorthData.changePercent}% this year
                    </div>
                    {['6 Months', '1 Year'].map((f) => (
                        <button
                            key={f}
                            className={`networth-filter-btn ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="networth-body">
                <div>
                    <div className="networth-balance-label">Current Balance</div>
                    <div className="networth-balance-value">
                        {formatCurrencyFull(netWorthData.currentNetWorth)}
                    </div>
                    <div className="networth-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={netWorthData.history} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B8C4E" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#1B8C4E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12, dy: 10 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    formatter={(val) => formatCurrency(val)}
                                    contentStyle={{
                                        borderRadius: '10px',
                                        border: '1px solid #E5E7EB',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        fontSize: '0.85rem',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="netWorth"
                                    stroke="#1B8C4E"
                                    strokeWidth={2.5}
                                    fill="url(#netWorthGradient)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#1B8C4E' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="networth-side-cards">
                    <div className="networth-stat-card">
                        <div className="networth-stat-label">Total Assets</div>
                        <div className="networth-stat-value">{formatCurrency(netWorthData.totalAssets)}</div>
                        <div className="networth-stat-bar" style={{ background: '#16A34A' }} />
                    </div>
                    <div className="networth-stat-card">
                        <div className="networth-stat-label">Total Liabilities</div>
                        <div className="networth-stat-value">{formatCurrency(netWorthData.totalLiabilities)}</div>
                        <div className="networth-stat-bar" style={{ background: '#EF4444' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="dashboard">
            <div className="dashboard-row-1">
                <ScoreGauge
                    score={financialScore.overall}
                    rating={financialScore.rating}
                    description={financialScore.description}
                />
                <AlertsCard />
            </div>
            <ScoreCategoryCards />
            <NetWorthSection />
        </div>
    );
}
