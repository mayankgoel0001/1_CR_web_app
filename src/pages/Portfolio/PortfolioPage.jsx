import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { assets, liabilities, netWorthData, assetAllocation, liabilityAllocation, formatCurrency } from '../../data/mockData';
import DonutChart from '../../components/Charts/DonutChart';
import Modal from '../../components/common/Modal';
import { MdAccountBalance, MdDriveEta, MdBusiness, MdHome, MdAttachMoney, MdShowChart, MdOutlineCategory, MdPerson, MdCalendarToday, MdOutlineEventNote } from 'react-icons/md';
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

export default function PortfolioPage() {
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

    return (
        <div className="portfolio-page">
            {/* Net Worth Hero */}
            <div className="portfolio-hero">
                <div className="portfolio-hero-header">
                    <h2>Portfolio Overview</h2>
                    <div className="portfolio-time-filters">
                        {['1M', '3M', '6M', '1Y', 'All'].map(f => (
                            <button key={f} className={`portfolio-time-btn ${timeFilter === f ? 'active' : ''}`} onClick={() => setTimeFilter(f)}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="portfolio-hero-stats">
                    <div className="portfolio-stat">
                        <label>Net Worth</label>
                        <div className="value">{formatCurrency(netWorthData.currentNetWorth)}</div>
                    </div>
                    <div className="portfolio-stat">
                        <label>Total Assets</label>
                        <div className="value positive">{formatCurrency(totalAssets)}</div>
                    </div>
                    <div className="portfolio-stat">
                        <label>Total Liabilities</label>
                        <div className="value negative">{formatCurrency(totalLiabilities)}</div>
                    </div>
                </div>
            </div>

            {/* Net Worth Chart + Allocation */}
            <div className="portfolio-grid">
                <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '16px' }}>Net Worth Trend</h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={netWorthData.history} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <defs>
                                <linearGradient id="gradAssets" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradNetWorth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradLiabilities" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, dy: 10 }} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                tickFormatter={(val) => val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${(val / 1000).toFixed(0)}K`}
                                width={60}
                            />
                            <Tooltip
                                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                                labelStyle={{ fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}
                                formatter={(val, name) => [formatCurrency(val), name]}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value) => <span style={{ color: '#4B5563', fontWeight: 500, fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{value}</span>}
                            />
                            <Area type="monotone" dataKey="assets" stroke="#16A34A" strokeWidth={2.5} fill="url(#gradAssets)" dot={false} activeDot={{ r: 5, fill: '#16A34A', stroke: 'white', strokeWidth: 2 }} name="Assets" />
                            <Area type="monotone" dataKey="netWorth" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradNetWorth)" dot={false} activeDot={{ r: 5, fill: '#2563EB', stroke: 'white', strokeWidth: 2 }} name="Net Worth" />
                            <Area type="monotone" dataKey="liabilities" stroke="#EF4444" strokeWidth={2.5} fill="url(#gradLiabilities)" dot={false} activeDot={{ r: 5, fill: '#EF4444', stroke: 'white', strokeWidth: 2 }} name="Liabilities" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="allocation-card card">
                    <h4>Asset Allocation</h4>
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
                <div className="portfolio-section-header">
                    <h3>My Assets</h3>
                    <button className="btn-primary" onClick={() => setIsAssetModalOpen(true)}>+ Add Asset</button>
                </div>
                <div className="assets-table-card card">
                    <div className="assets-search">
                        <input type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="All">All Categories</option>
                            <option value="savings">Savings</option>
                            <option value="investments">Investments</option>
                            <option value="retirement">Retirement</option>
                            <option value="crypto">Crypto</option>
                            <option value="vehicles">Vehicles</option>
                        </select>
                    </div>
                    <div className="table-responsive">
                        <table className="assets-table">
                            <thead>
                                <tr>
                                    <th>Asset Name</th>
                                    <th>Category</th>
                                    <th>Current Value</th>
                                    <th>Purchase Price</th>
                                    <th>Gain/Loss</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssets.map(asset => {
                                    const gain = asset.currentValue - asset.purchasePrice;
                                    const gainPct = ((gain / asset.purchasePrice) * 100).toFixed(1);
                                    return (
                                        <tr key={asset.id}>
                                            <td>
                                                <div className="asset-name-cell">
                                                    <div className="asset-icon-dot" style={{ background: categoryColors[asset.category] }} />
                                                    {asset.name}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="asset-category-pill">{asset.subType || asset.category}</span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{formatCurrency(asset.currentValue)}</td>
                                            <td>{formatCurrency(asset.purchasePrice)}</td>
                                            <td className={gain >= 0 ? 'gain-positive' : 'gain-negative'} style={{ fontWeight: 600 }}>
                                                {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct}%)
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Liabilities */}
            <div className="portfolio-section">
                <div className="portfolio-section-header">
                    <h3>My Liabilities</h3>
                    <button className="btn-primary" onClick={() => setIsLiabilityModalOpen(true)}>+ Add Liability</button>
                </div>

                <div className="portfolio-grid">
                    <div className="allocation-card card">
                        <h4>Liability Allocation</h4>
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

                    <div className="assets-table-card card">
                        <div className="assets-search">
                            <input type="text" placeholder="Search liabilities..." value={liabilitySearch} onChange={(e) => setLiabilitySearch(e.target.value)} />
                            <select value={liabilityCategoryFilter} onChange={(e) => setLiabilityCategoryFilter(e.target.value)}>
                                <option value="All">All Types</option>
                                <option value="Long-term Liabilities">Long-term</option>
                                <option value="Current Liabilities">Current</option>
                            </select>
                        </div>
                        <div className="table-responsive">
                            <table className="assets-table">
                                <thead>
                                    <tr>
                                        <th>Liability</th>
                                        <th>Lender</th>
                                        <th>Outstanding</th>
                                        <th>EMI</th>
                                        <th>Interest Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLiabilities.map(l => (
                                        <tr key={l.id}>
                                            <td style={{ fontWeight: 500 }}>{l.name}</td>
                                            <td>{l.lender}</td>
                                            <td style={{ fontWeight: 600, color: '#EF4444' }}>{formatCurrency(l.currentBalance)}</td>
                                            <td>{formatCurrency(l.monthlyPayment)}/mo</td>
                                            <td>{l.interestRate}% p.a.</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
