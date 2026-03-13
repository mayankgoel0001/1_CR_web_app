import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { assets, liabilities, netWorthData, assetAllocation, liabilityAllocation, formatCurrency } from '../../data/mockData';
import { ICONS } from '../../utils/icons';

// Format number with commas, no rupee sign
function formatNumber(num) {
    if (num == null) return '';
    return num.toLocaleString('en-IN');
}
import DonutChart from '../../components/Charts/DonutChart';
import Modal from '../../components/common/Modal';
import { MdAccountBalance, MdDriveEta, MdBusiness, MdHome, MdAttachMoney, MdShowChart, MdOutlineCategory, MdPerson, MdCalendarToday, MdOutlineEventNote, MdClose } from 'react-icons/md';
import './PortfolioPage.css';

const categoryColors = {
    savings: '#16A34A',
    investments: '#2563EB',
    real_estate: '#8B5CF6',
    vehicles: '#EC4899',
    retirement: '#F59E0B',
    crypto: '#F97316',
    personal_property: '#06B6D4',
    other: '#6B7280',
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-chart-tooltip" style={{
                background: '#111827',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                color: 'white'
            }}>
                <p style={{ fontWeight: 700, margin: '0 0 8px 0', fontSize: '13px' }}>{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} style={{
                        color: entry.name === 'Assets' ? '#A7F3D0' :
                            entry.name === 'Liabilities' ? '#FECACA' : '#BFDBFE',
                        fontSize: '13px',
                        marginBottom: '4px',
                        display: 'flex',
                        gap: '6px'
                    }}>
                        <span>{entry.name}:</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function PortfolioPage() {
    const navigate = useNavigate();
    const [timeFilter, setTimeFilter] = useState('6M');

    // Local data state (initialized from mock data)
    const [localAssets, setLocalAssets] = useState(assets);
    const [localLiabilities, setLocalLiabilities] = useState(liabilities);

    // Asset filters
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Liability filters
    const [liabilitySearch, setLiabilitySearch] = useState('');
    const [liabilityCategoryFilter, setLiabilityCategoryFilter] = useState('All');

    // Modals state
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isLiabilityModalOpen, setIsLiabilityModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    // Form submit handlers
    const handleAddAsset = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newAsset = {
            id: Date.now().toString(),
            name: formData.get('assetName'),
            category: formData.get('assetCategory'),
            currentValue: Number(formData.get('currentValue')),
            purchasePrice: Number(formData.get('purchasePrice')) || Number(formData.get('currentValue')),
        };

        setLocalAssets([...localAssets, newAsset]);
        setIsAssetModalOpen(false);
    };

    const handleAddLiability = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newLiability = {
            id: Date.now().toString(),
            name: formData.get('liabilityName'),
            type: formData.get('liabilityType'),
            lender: formData.get('lenderName') || 'Unknown',
            originalAmount: Number(formData.get('principalAmount')),
            currentBalance: Number(formData.get('currentBalance')),
            monthlyPayment: 0, // Simplified for mock
            interestRate: Number(formData.get('interestRate')) || 0,
        };

        setLocalLiabilities([...localLiabilities, newLiability]);
        setIsLiabilityModalOpen(false);
    };

    const totalAssets = localAssets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalLiabilities = localLiabilities.reduce((sum, l) => sum + l.currentBalance, 0);
    const totalMonthlyEMI = localLiabilities.reduce((sum, l) => sum + (l.monthlyPayment || 0), 0);

    const filteredAssets = localAssets.filter(a => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'All' || a.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    const filteredLiabilities = localLiabilities.filter(l => {
        const matchSearch = l.name.toLowerCase().includes(liabilitySearch.toLowerCase()) || l.lender.toLowerCase().includes(liabilitySearch.toLowerCase());
        const matchCategory = liabilityCategoryFilter === 'All' || l.type === liabilityCategoryFilter;
        return matchSearch && matchCategory;
    });

    const isAssetDetailType = (asset) => {
        const type = `${asset.type || ''}`.toLowerCase();
        const subType = `${asset.subType || ''}`.toLowerCase();
        const isInvestments = asset.category === 'investments';
        return (
            type === 'stock' ||
            type === 'mutual_fund' ||
            (isInvestments && (subType.includes('stock') || subType.includes('mutual')))
        );
    };

    const handleAssetRowClick = (asset) => {
        if (isAssetDetailType(asset)) {
            navigate(`/asset/${asset.id}`, { state: { asset } });
            return;
        }
        setSelectedAsset(asset);
    };

    return (
        <div className="portfolio-page">
            {/* Portfolio Header & Cards */}
            <div className="portfolio-overview-section">
                <div className="portfolio-overview-header">
                    <div className="portfolio-titles">
                        <h2>Portfolio Overview</h2>
                        <p>Track all your assets, liabilities and net worth in one place</p>
                        <br />
                    </div>
                    <div className="portfolio-actions">
                        <button className="btn-secondary" onClick={() => setIsLiabilityModalOpen(true)}>
                            + Add Liability
                        </button>
                        <button className="btn-primary" onClick={() => setIsAssetModalOpen(true)}>
                            + Add Asset
                        </button>
                    </div>
                </div>

                <div className="portfolio-cards-grid">
                    {/* 1. Net Worth Card (Dark Variante) */}
                    <div className="port-card dark-card">
                        <div className="port-card-top">
                            <span className="port-card-label">NET WORTH</span>
                            <div className="port-card-icon diamond-icon">{ICONS.diamondLg}</div>
                        </div>
                        <div className="port-card-val text-white">{formatCurrency(netWorthData.currentNetWorth)}</div>
                        <div className="port-card-badge badge-green dark-badge">
                            ▲ +4.2% this month
                        </div>
                        <div className="port-card-sub text-muted-white">Assets minus liabilities</div>
                    </div>

                    {/* 2. Total Assets Card */}
                    <div className="port-card">
                        <div className="port-card-top">
                            <span className="port-card-label">TOTAL ASSETS</span>
                            <div className="port-card-icon chart-icon">{ICONS.chartUp}</div>
                        </div>
                        <div className="port-card-val text-blue">{formatCurrency(totalAssets)}</div>
                        <div className="port-card-badge badge-gray">
                            {localAssets.length} assets tracked
                        </div>
                        <div className="port-card-sub text-muted">Across {new Set(localAssets.map(a => a.category)).size} categories</div>
                    </div>

                    {/* 3. Total Liabilities Card */}
                    <div className="port-card">
                        <div className="port-card-top">
                            <span className="port-card-label">TOTAL LIABILITIES</span>
                            <div className="port-card-icon card-icon">{ICONS.creditCardLg}</div>
                        </div>
                        <div className="port-card-val text-red">{formatCurrency(totalLiabilities)}</div>
                        <div className="port-card-badge badge-light-red">
                            {localLiabilities.length} active loans
                        </div>
                        <div className="port-card-sub text-muted">{formatCurrency(totalMonthlyEMI)}/mo total EMI</div>
                    </div>

                    {/* 4. Total Gain/Loss Card */}
                    <div className="port-card">
                        <div className="port-card-top">
                            <span className="port-card-label">TOTAL GAIN / LOSS</span>
                            <div className="port-card-icon bar-icon">{ICONS.barChartLg}</div>
                        </div>
                        <div className="port-card-val text-green">+{formatCurrency(57200)}</div>
                        <div className="port-card-badge badge-light-green">
                            ▲ +9.4% overall return
                        </div>
                        <div className="port-card-sub text-muted">Unrealised portfolio gain</div>
                    </div>
                </div>
            </div>

            {/* Net Worth Chart + Allocation */}
            <div className="portfolio-grid">
                <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
                    <div className="chart-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <h4 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '4px' }}>Net Worth Trend</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Assets vs Liabilities over time</p>

                            {/* Custom Legend */}
                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2D7A4F' }}></div>
                                    Assets
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></div>
                                    Liabilities
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></div>
                                    Net Worth
                                </div>
                            </div>
                        </div>

                        <div className="portfolio-time-filters">
                            {['1M', '3M', '6M', '1Y', 'All'].map(f => (
                                <button key={f} className={`portfolio-time-btn ${timeFilter === f ? 'active' : ''}`} onClick={() => setTimeFilter(f)}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={netWorthData.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradAssets" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2D7A4F" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#2D7A4F" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradNetWorth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: 11, dy: 10, fontWeight: 500 }} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#000', fontSize: 11, fontWeight: 500 }}
                                tickFormatter={(val) => val >= 100000 ? `₹${(val / 100000).toFixed(0)}L` : `₹${(val / 1000).toFixed(0)}K`}
                                width={50}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }} />

                            <Area type="monotone" dataKey="assets" stroke="#2D7A4F" strokeWidth={2.5} fill="url(#gradAssets)" dot={false} activeDot={{ r: 5, fill: '#2D7A4F', stroke: 'white', strokeWidth: 2 }} name="Assets" />
                            <Area type="monotone" dataKey="netWorth" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gradNetWorth)" dot={false} activeDot={{ r: 5, fill: '#3B82F6', stroke: 'white', strokeWidth: 2 }} name="Net Worth" />
                            {/* Rendering Liabilities last so it's on top and dashed */}
                            <Area type="monotone" dataKey="liabilities" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" fill="none" dot={false} activeDot={{ r: 5, fill: '#EF4444', stroke: 'white', strokeWidth: 2 }} name="Liabilities" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="allocation-card card">
                    <h4>Asset Allocation</h4>
                    <br />
                    <DonutChart
                        data={assetAllocation}
                        height={260}
                        innerR={50}
                        outerR={75}
                        colors={assetAllocation.map(a => a.color)}
                        tooltipFmt={(val) => formatCurrency(val)}
                        centerLabel={totalAssets >= 10000000 ? `₹${(totalAssets / 10000000).toFixed(1)}Cr` : `₹${(totalAssets / 100000).toFixed(1)}L`}
                        centerSub="Total Assets"
                    />
                </div>
            </div>

            {/* Assets Table */}
            <div className="portfolio-section">
                <div className="assets-table-card card">
                    {/* Header row */}
                    <div className="liab-table-header">
                        <div className="liab-table-titles">
                            <h3>My Assets</h3>
                            <p>{filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} tracked</p>
                        </div>
                        <div className="liab-table-controls">
                            <div className="liab-search-wrap">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                <input type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <select className="liab-filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="All">All Categories</option>
                                <option value="savings">Savings</option>
                                <option value="investments">Investments</option>
                                <option value="retirement">Retirement</option>
                                <option value="crypto">Crypto</option>
                                <option value="vehicles">Vehicles</option>
                            </select>
                            <button className="btn-primary" onClick={() => navigate('/my-assets')}>View More</button>
                        </div>
                    </div>

                    {/* Scrollable table */}
                    <div className="liab-table-scroll-wrap">
                        <table className="liab-table">
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Category</th>
                                    <th style={{ textAlign: 'right' }}>Current Value (₹)</th>
                                    <th style={{ textAlign: 'right' }}>Purchase Price (₹)</th>
                                    <th style={{ textAlign: 'right' }}>Gain / Loss (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssets.map(asset => {
                                    const gain = asset.currentValue - asset.purchasePrice;
                                    const gainPct = ((gain / asset.purchasePrice) * 100).toFixed(1);
                                    return (
                                        <tr
                                            key={asset.id}
                                            className="portfolio-asset-row"
                                            onClick={() => handleAssetRowClick(asset)}
                                        >
                                            <td>
                                                <div className="liab-name-cell">
                                                    <div className="liab-dot" style={{ background: categoryColors[asset.category] }} />
                                                    <div>
                                                        <div className="liab-name">{asset.name}</div>
                                                        <div className="liab-sub">{asset.category?.replace('_', ' ')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="asset-category-pill">{asset.subType || asset.category}</span>
                                            </td>
                                            <td className="liab-val-neutral right-align">{formatNumber(asset.currentValue)}</td>
                                            <td className="liab-val-neutral right-align">{formatNumber(asset.purchasePrice)}</td>
                                            <td className="right-align">
                                                <span className={`liab-rate-badge ${gain >= 0 ? 'rate-green' : 'rate-red'}`}>
                                                    {gain >= 0 ? '▲' : '▼'} {gain >= 0 ? '+' : ''}{formatNumber(gain)} ({gainPct}%)
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

            {selectedAsset && (
                <div className="portfolio-asset-drawer-overlay" onClick={() => setSelectedAsset(null)}>
                    <aside className="portfolio-asset-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="portfolio-asset-drawer-header">
                            <div>
                                <h3>{selectedAsset.name}</h3>
                                <p>{selectedAsset.subType || selectedAsset.category?.replace('_', ' ')}</p>
                            </div>
                            <button type="button" aria-label="Close drawer" onClick={() => setSelectedAsset(null)}>
                                <MdClose />
                            </button>
                        </div>

                        <div className="portfolio-asset-drawer-card">
                            <span>Current Value</span>
                            <strong>{formatCurrency(selectedAsset.currentValue)}</strong>
                            <small>
                                {selectedAsset.currentValue >= selectedAsset.purchasePrice ? '+' : '-'}
                                {Math.abs(((selectedAsset.currentValue - selectedAsset.purchasePrice) / (selectedAsset.purchasePrice || 1)) * 100).toFixed(1)}% return
                            </small>
                        </div>

                        <div className="portfolio-asset-drawer-grid">
                            <div className="portfolio-asset-drawer-item"><span>Purchase Price</span><strong>{formatCurrency(selectedAsset.purchasePrice)}</strong></div>
                            <div className="portfolio-asset-drawer-item"><span>Gain / Loss</span><strong>{formatCurrency(selectedAsset.currentValue - selectedAsset.purchasePrice)}</strong></div>
                            <div className="portfolio-asset-drawer-item"><span>Category</span><strong>{selectedAsset.category?.replace('_', ' ')}</strong></div>
                            <div className="portfolio-asset-drawer-item"><span>Sub Type</span><strong>{selectedAsset.subType || selectedAsset.category?.replace('_', ' ')}</strong></div>
                            <div className="portfolio-asset-drawer-item"><span>Purchase Date</span><strong>{selectedAsset.purchaseDate || 'N/A'}</strong></div>
                            <div className="portfolio-asset-drawer-item"><span>Liquid Asset</span><strong>{selectedAsset.isLiquid ? 'Yes' : 'No'}</strong></div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Liabilities */}
            <div className="portfolio-section">
                <div className="portfolio-grid">
                    <div className="assets-table-card card">
                        {/* Liabilities table header */}
                        <div className="liab-table-header">
                            <div className="liab-table-titles">
                                <h3>My Liabilities</h3>
                                <p>{filteredLiabilities.length} active loan{filteredLiabilities.length !== 1 ? 's' : ''} &amp; credit lines</p>
                            </div>
                            <div className="liab-table-controls">
                                <div className="liab-search-wrap">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    <input type="text" placeholder="Search liabilities..." value={liabilitySearch} onChange={(e) => setLiabilitySearch(e.target.value)} />
                                </div>
                                <select className="liab-filter-select" value={liabilityCategoryFilter} onChange={(e) => setLiabilityCategoryFilter(e.target.value)}>
                                    <option value="All">All Types</option>
                                    <option value="Long-term Liabilities">Long-term</option>
                                    <option value="Current Liabilities">Current</option>
                                </select>
                                <button className="btn-primary" onClick={() => setIsLiabilityModalOpen(true)}>+ Add</button>
                            </div>
                        </div>

                        {/* Scrollable table */}
                        <div className="liab-table-scroll-wrap">
                            <table className="liab-table">
                                <thead>
                                    <tr>
                                        <th>Liability</th>
                                        <th>Lender</th>
                                        <th style={{ textAlign: 'right' }}>Outstanding (₹)</th>
                                        <th style={{ textAlign: 'right' }}>EMI / Month (₹)</th>
                                        <th>Interest Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLiabilities.map(l => {
                                        const rateColor = l.interestRate >= 30 ? 'rate-red' : l.interestRate >= 15 ? 'rate-orange' : 'rate-green';
                                        return (
                                            <tr key={l.id}>
                                                <td>
                                                    <div className="liab-name-cell">
                                                        <div className="liab-dot" style={{ background: l.interestRate >= 30 ? '#EF4444' : l.interestRate >= 15 ? '#F59E0B' : '#3B82F6' }} />
                                                        <div>
                                                            <div className="liab-name">{l.name}</div>
                                                            <div className="liab-sub">{l.lender} · {l.type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="liab-val-neutral">{l.lender}</td>
                                                <td className="liab-val-red right-align">{formatNumber(l.currentBalance)}</td>
                                                <td className="liab-val-neutral right-align">{formatNumber(l.monthlyPayment)}</td>
                                                <td>
                                                    <span className={`liab-rate-badge ${rateColor}`}>{l.interestRate}% p.a.</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="liab-table-footer">
                            <span className="liab-footer-label">Total monthly EMI obligation</span>
                            <span className="liab-footer-val">{formatCurrency(totalMonthlyEMI)} / month</span>
                        </div>
                    </div>

                    <div className="allocation-card card">
                        <h4>Liability Allocation</h4>
                        <br />
                        <DonutChart
                            data={liabilityAllocation}
                            height={260}
                            innerR={50}
                            outerR={80}
                            colors={liabilityAllocation.map(l => l.color)}
                            tooltipFmt={(val) => formatCurrency(val)}
                            centerLabel={totalLiabilities >= 10000000 ? `₹${(totalLiabilities / 10000000).toFixed(1)}Cr` : `₹${(totalLiabilities / 100000).toFixed(1)}L`}
                            centerSub="Total Liabilities"
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} title="Add New Asset">
                <form className="modal-form" onSubmit={handleAddAsset}>
                    <div className="modal-form-group">
                        <label>Asset Category *</label>
                        <div className="modal-input-wrapper">
                            <MdOutlineCategory className="modal-input-icon" />
                            <select name="assetCategory" required>
                                <option value="" disabled selected>Select Category</option>
                                <option value="savings">Savings</option>
                                <option value="investments">Investments</option>
                                <option value="real_estate">Real Estate</option>
                                <option value="vehicles">Vehicles</option>
                                <option value="retirement">Retirement</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Asset Name *</label>
                        <div className="modal-input-wrapper">
                            <span className="modal-input-icon">T</span>
                            <input type="text" name="assetName" placeholder="e.g. HDFC Savings Account" required />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Current Value (₹) *</label>
                        <div className="modal-input-wrapper">
                            <MdAttachMoney className="modal-input-icon" />
                            <input type="number" name="currentValue" placeholder="0" required />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Purchase Price (₹)</label>
                        <div className="modal-input-wrapper">
                            <MdShowChart className="modal-input-icon" />
                            <input type="number" name="purchasePrice" placeholder="0" />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsAssetModalOpen(false)}>Cancel</button>
                        <button type="submit" className="modal-btn modal-btn-submit">Add Asset</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isLiabilityModalOpen} onClose={() => setIsLiabilityModalOpen(false)} title="Add New Liability">
                <form className="modal-form" onSubmit={handleAddLiability}>
                    <div className="modal-form-group">
                        <label>Liability Name *</label>
                        <div className="modal-input-wrapper">
                            <span className="modal-input-icon">T</span>
                            <input type="text" name="liabilityName" placeholder="e.g. Home Loan - SBI" required />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Liability Type *</label>
                        <div className="modal-input-wrapper">
                            <MdHome className="modal-input-icon" />
                            <select name="liabilityType" required>
                                <option value="" disabled selected>Select Type</option>
                                <option value="Long-term Liabilities">Long-term Liabilities</option>
                                <option value="Current Liabilities">Current Liabilities</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
                        <label style={{ margin: 0 }}>Are you a Guarantor?</label>
                        <input type="checkbox" name="isGuarantor" style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }} />
                    </div>

                    <div className="modal-form-group">
                        <label>Lender Name</label>
                        <div className="modal-input-wrapper">
                            <MdBusiness className="modal-input-icon" />
                            <input type="text" name="lenderName" placeholder="e.g. HDFC Bank" />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Principal Amount (₹) *</label>
                        <div className="modal-input-wrapper">
                            <MdAttachMoney className="modal-input-icon" />
                            <input type="number" name="principalAmount" placeholder="0" required />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Current Outstanding Balance (₹) *</label>
                        <div className="modal-input-wrapper">
                            <MdAttachMoney className="modal-input-icon" />
                            <input type="number" name="currentBalance" placeholder="0" required />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Interest Rate (% p.a.)</label>
                        <div className="modal-input-wrapper">
                            <span className="modal-input-icon">%</span>
                            <input type="number" step="0.1" name="interestRate" placeholder="0.0" />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsLiabilityModalOpen(false)}>Cancel</button>
                        <button type="submit" className="modal-btn modal-btn-submit">Add Liability</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
