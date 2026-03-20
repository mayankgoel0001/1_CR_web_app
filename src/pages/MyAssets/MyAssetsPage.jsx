import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdAccountBalance,
    MdAccountBalanceWallet,
    MdAdd,
    MdAutoGraph,
    MdClose,
    MdCurrencyBitcoin,
    MdDeleteOutline,
    MdDirectionsCar,
    MdEdit,
    MdFilterList,
    MdInsights,
    MdKeyboardArrowRight,
    MdSearch,
    MdShield,
    MdSort,
    MdWaterDrop,
} from 'react-icons/md';
import DonutChart from '../../components/Charts/DonutChart';
import Modal from '../../components/common/Modal';
import KPICard from '../../components/common/KPICard';
import { assets, assetAllocation, formatCurrency } from '../../data/mockData';
import { loadAssets, saveAssets } from '../../utils/assetStore';

const categoryMeta = {
    all: { label: 'All Assets', color: 'var(--color-primary)' },
    savings: { label: 'Savings', color: '#16A34A' },
    investments: { label: 'Investments', color: '#2563EB' },
    retirement: { label: 'Retirement', color: '#8B5CF6' },
    crypto: { label: 'Crypto', color: '#F59E0B' },
    vehicles: { label: 'Vehicle', color: '#EF4444' },
};

function toCategoryLabel(value) {
    return categoryMeta[value]?.label || value.replace('_', ' ');
}

function formatAmount(value) {
    return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0);
}

function formatLakh(value) {
    const lakhs = (value || 0) / 100000;
    return `₹${lakhs.toFixed(2)}L`;
}

function formatCompactINR(value) {
    const amount = Number(value) || 0;
    const formatShort = (num) => num.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    if (amount >= 10000000) return `₹${formatShort(amount / 10000000)}Cr`;
    if (amount >= 100000) return `₹${formatShort(amount / 100000)}L`;
    if (amount >= 1000) return `₹${formatShort(amount / 1000)}K`;
    return `₹${formatAmount(amount)}`;
}

export default function MyAssetsPage() {
    const navigate = useNavigate();
    const [assetRows, setAssetRows] = useState(() => loadAssets(assets));
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('value');
    const [page, setPage] = useState(1);
    const [viewAsset, setViewAsset] = useState(null);
    const [editAsset, setEditAsset] = useState(null);
    const [editMode, setEditMode] = useState('edit');
    const [formData, setFormData] = useState({ name: '', category: 'savings', subType: '', currentValue: '', purchasePrice: '', isLiquid: true });
    const pageSize = 6;

    const categories = useMemo(() => ['all', ...Array.from(new Set(assetRows.map(a => a.category)))], [assetRows]);
    const categoryCounts = useMemo(() => {
        const counts = assetRows.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc; }, {});
        counts.all = assetRows.length;
        return counts;
    }, [assetRows]);

    const filteredAssets = useMemo(() => {
        const term = search.trim().toLowerCase();
        let list = assetRows.filter(a => {
            const inSearch = !term || a.name.toLowerCase().includes(term) || (a.subType || '').toLowerCase().includes(term) || a.category.toLowerCase().includes(term);
            return inSearch && (category === 'all' || a.category === category);
        });
        return [...list].sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : b.currentValue - a.currentValue);
    }, [assetRows, search, category, sortBy]);

    useEffect(() => { saveAssets(assetRows); }, [assetRows]);
    useEffect(() => { setPage(1); }, [search, category, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const paginatedAssets = filteredAssets.slice(pageStart, pageStart + pageSize);

    const totals = useMemo(() => {
        const totalPortfolioValue = assetRows.reduce((s, a) => s + a.currentValue, 0);
        const totalInvested = assetRows.reduce((s, a) => s + a.purchasePrice, 0);
        const totalGainLoss = totalPortfolioValue - totalInvested;
        const liquidAssets = assetRows.reduce((s, a) => s + (a.isLiquid ? a.currentValue : 0), 0);
        return { totalPortfolioValue, totalInvested, totalGainLoss, liquidAssets };
    }, [assetRows]);

    const avgReturnPct = totals.totalInvested ? ((totals.totalGainLoss / totals.totalInvested) * 100).toFixed(1) : '0.0';
    const bestPerformer = useMemo(() => [...assetRows].map(a => ({ name: a.name, pct: a.purchasePrice ? ((a.currentValue - a.purchasePrice) / a.purchasePrice) * 100 : 0 })).sort((a, b) => b.pct - a.pct)[0], [assetRows]);
    const worstPerformer = useMemo(() => [...assetRows].map(a => ({ name: a.name, pct: a.purchasePrice ? ((a.currentValue - a.purchasePrice) / a.purchasePrice) * 100 : 0 })).sort((a, b) => a.pct - b.pct)[0], [assetRows]);
    const liquidPct = totals.totalPortfolioValue ? ((totals.liquidAssets / totals.totalPortfolioValue) * 100).toFixed(1) : '0.0';
    const allocationRows = useMemo(() => {
        const total = assetAllocation.reduce((s, r) => s + r.value, 0);
        return assetAllocation.filter(r => r.value > 0).map(r => ({ ...r, pct: total ? ((r.value / total) * 100).toFixed(1) : '0.0' })).sort((a, b) => b.value - a.value);
    }, []);

    const openCreateModal = () => { setEditMode('create'); setEditAsset(null); setFormData({ name: '', category: 'savings', subType: '', currentValue: '', purchasePrice: '', isLiquid: true }); };
    const openEditModal = (asset) => { setEditMode('edit'); setEditAsset(asset); setFormData({ name: asset.name, category: asset.category, subType: asset.subType || '', currentValue: asset.currentValue, purchasePrice: asset.purchasePrice, isLiquid: Boolean(asset.isLiquid) }); };
    const closeEditModal = () => { setEditAsset(null); if (editMode === 'create') setEditMode('edit'); };
    const isEditModalOpen = editMode === 'create' || Boolean(editAsset);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const payload = { name: formData.name.trim(), category: formData.category, subType: formData.subType.trim(), currentValue: Number(formData.currentValue), purchasePrice: Number(formData.purchasePrice), isLiquid: Boolean(formData.isLiquid), isActive: true };
        if (!payload.name || !payload.category || Number.isNaN(payload.currentValue) || Number.isNaN(payload.purchasePrice)) return;
        if (editMode === 'create') {
            setAssetRows(prev => { const nextId = prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1; return [...prev, { ...payload, id: nextId, purchaseDate: new Date().toISOString().slice(0, 10) }]; });
            setEditMode('edit'); setPage(totalPages); setEditAsset(null); return;
        }
        setAssetRows(prev => prev.map(r => r.id === editAsset.id ? { ...r, ...payload } : r));
        setEditAsset(null);
    };

    const handleDelete = (id) => { if (window.confirm('Delete this asset?')) setAssetRows(prev => prev.filter(r => r.id !== id)); };

    const handleAssetRowClick = (asset) => {
        const type = `${asset.type || ''}`.toLowerCase(), subType = `${asset.subType || ''}`.toLowerCase();
        if (type === 'stock' || type === 'mutual_fund' || (asset.category === 'investments' && (subType.includes('stock') || subType.includes('mutual')))) {
            navigate(`/asset/${asset.id}`, { state: { asset } }); return;
        }
        setViewAsset(asset);
    };

    return (
        <div className="flex flex-col gap-lg">
            {/* Header */}
            <header className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h1 className="text-[22px] font-bold text-[#0D1F17]">My Assets</h1>
                    <p className="mt-[4px] text-[#8FA99C] text-[12.5px] inline-flex items-center gap-1.5 font-medium">
                        <button type="button" className="bg-transparent border-0 text-inherit font-inherit p-0 cursor-pointer hover:text-[#2D7A4F]" onClick={() => navigate('/portfolio')}>Portfolio</button>
                        <MdKeyboardArrowRight size={12} />
                        <span className="text-[#2D7A4F] font-bold">My Assets</span>
                    </p>
                </div>
            </header>

            {/* Summary Strip */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                {[
                    { icon: <MdAccountBalanceWallet />, label: 'Total Portfolio Value', value: formatCurrency(totals.totalPortfolioValue), sub: `${assetRows.length} assets tracked` },
                    { icon: <MdAccountBalance />, label: 'Total Invested', value: formatCurrency(totals.totalInvested), sub: 'Cost basis' },
                    { icon: <MdInsights />, label: 'Total Gain / Loss', value: `${totals.totalGainLoss >= 0 ? '+' : '-'}${formatCurrency(Math.abs(totals.totalGainLoss))}`, sub: `${avgReturnPct}% overall return`, positive: totals.totalGainLoss >= 0, signed: true },
                    { icon: <MdWaterDrop />, label: 'Liquid Assets', value: formatCurrency(totals.liquidAssets), sub: `${liquidPct}% of portfolio` },
                ].map((stat, i) => (
                    <KPICard
                        key={i}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        dark={i === 0}
                        subText={stat.sub}
                        valueColor={stat.signed ? (stat.positive ? 'text-[#2D7A4F]' : 'text-[#EF4444]') : 'text-[#0D1F17]'}
                    />
                ))}
            </section>


            {/* Main Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-md items-start">
                {/* Table Card */}
                <div className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-0 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-md border-b border-border-light flex gap-sm flex-wrap items-center">
                        <div className="flex-1 basis-[220px] flex items-center gap-2 bg-bg border border-border rounded-md px-2.5 py-2 text-[#8FA99C]">
                            <MdSearch />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..." className="border-0 bg-transparent w-full p-0 outline-none text-[13px] font-medium text-[#0D1F17] placeholder:text-[#8FA99C]" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-bg border border-border rounded-md pl-2.5 text-[#8FA99C]">
                            <MdFilterList />
                            <select value={category} onChange={e => setCategory(e.target.value)} className="border-0 bg-transparent py-2 pr-1 text-[13px] font-bold text-[#0D1F17] cursor-pointer outline-none">
                                {categories.map(cat => <option key={cat} value={cat}>{toCategoryLabel(cat)}</option>)}
                            </select>
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-[#F9FAFB] border border-border rounded-md pl-2.5 text-[#8FA99C]">
                            <MdSort />
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border-0 bg-transparent py-2 pr-1 text-[13px] font-bold text-[#0D1F17] cursor-pointer outline-none">
                                <option value="value">Sort by Value</option>
                                <option value="name">Sort by Name</option>
                            </select>
                        </div>
                        <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#2D7A4F] text-white rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#256341] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(45,122,79,0.3)]" type="button" onClick={openCreateModal}><MdAdd />Add Asset</button>
                    </div>

                    {/* Pills */}
                    <div className="flex gap-2 overflow-x-auto px-md py-sm border-b border-border-light" style={{ scrollbarWidth: 'none' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`border rounded-full px-2.5 py-1.5 text-[13px] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors
                                    ${category === cat ? 'bg-[#E8F5EE] border-[#2D7A4F] text-[#1B5E35] font-bold' : 'border-[#E4EDE8] bg-white text-[#8FA99C]'}`}
                            >
                                <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: categoryMeta[cat]?.color || '#9CA3AF' }} />
                                {toCategoryLabel(cat)}
                                <span className="bg-black/[0.07] rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center text-[10px] font-bold px-1">{categoryCounts[cat] || 0}</span>
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse" style={{ minWidth: 840 }}>
                            <thead className="sticky top-0 z-[5]">
                                <tr className="bg-[#f7f9f8]">
                                    {['Asset', 'Category', 'Current Value (₹)', 'Purchase Price (₹)', 'Gain / Loss (₹)', 'Actions'].map((h, i) => (
                                        <th key={h} className={`text-left text-[11px] uppercase tracking-[0.5px] text-[#0D1F17] font-bold bg-[#f7f9f8] px-5 py-3 border-b border-[#E4EDE8] whitespace-nowrap ${i >= 2 && i <= 4 ? 'text-right' : i === 5 ? 'text-center' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAssets.map(asset => {
                                    const gain = asset.currentValue - asset.purchasePrice;
                                    const pct = asset.purchasePrice ? (gain / asset.purchasePrice) * 100 : 0;
                                    const dotColor = categoryMeta[asset.category]?.color || '#6B7280';
                                    return (
                                        <tr key={asset.id} className="cursor-pointer hover:bg-[#f9fafb]" onClick={() => handleAssetRowClick(asset)}>
                                            <td className="px-5 py-3.5 text-[13px] border-b border-[#F0FAF5] align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                                                    <div>
                                                        <div className="font-bold text-[13px] text-[#0D1F17] leading-[1.3]">{asset.name}</div>
                                                        <div className="text-[11px] text-[#8FA99C] font-medium mt-0.5">{asset.subType || toCategoryLabel(asset.category)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] border-b border-[#E4EDE8] align-middle">
                                                <span className="inline-flex px-2.5 py-1 rounded-full bg-[#f3f4f6] text-[#0D1F17] text-[11px] font-bold uppercase tracking-[0.5px]">
                                                    {toCategoryLabel(asset.category)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] border-b border-[#E4EDE8] align-middle text-right font-bold text-[#0D1F17]">{formatAmount(asset.currentValue)}</td>
                                            <td className="px-5 py-3.5 text-[13px] border-b border-[#E4EDE8] align-middle text-right font-bold text-[#0D1F17]">{formatAmount(asset.purchasePrice)}</td>
                                            <td className="px-5 py-3.5 text-[13px] border-b border-[#E4EDE8] align-middle text-right">
                                                <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${gain >= 0 ? 'bg-[#E8F5EE] text-[#10B981]' : 'bg-[#FEF2F2] text-[#EF4444]'}`}>
                                                    {gain >= 0 ? '+' : '-'}{formatAmount(Math.abs(gain))} ({Math.abs(pct).toFixed(1)}%)
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] border-b border-[#E4EDE8] align-middle text-center">
                                                <div className="inline-flex gap-1.5">
                                                    {[{ onClick: e => { e.stopPropagation(); openEditModal(asset); }, icon: <MdEdit />, label: 'Edit' },
                                                      { onClick: e => { e.stopPropagation(); handleDelete(asset.id); }, icon: <MdDeleteOutline />, label: 'Delete' }].map(btn => (
                                                        <button key={btn.label} type="button" aria-label={`${btn.label} asset`} onClick={btn.onClick}
                                                            className="w-7 h-7 border border-[#E4EDE8] rounded-lg text-[#8FA99C] inline-flex items-center justify-center bg-white hover:border-[#2D7A4F] hover:text-[#2D7A4F] hover:bg-[#E8F5EE]">
                                                            {btn.icon}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredAssets.length === 0 && <div className="p-lg text-text-secondary text-center">No assets match your search or filter.</div>}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between gap-sm border-t border-[#E4EDE8] px-5 py-3.5 bg-[#f7f9f8] flex-wrap">
                        <div className="text-[#8FA99C] text-[12px] font-medium">
                            Showing {filteredAssets.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + pageSize, filteredAssets.length)} of {filteredAssets.length}
                        </div>
                        <div className="inline-flex items-center gap-2.5">
                            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="border border-[#E4EDE8] bg-white text-[#0D1F17] rounded-md px-2.5 py-1.5 text-[13px] font-bold disabled:opacity-45 disabled:cursor-not-allowed hover:not-disabled:border-[#2D7A4F] hover:not-disabled:text-[#2D7A4F] hover:not-disabled:bg-[#E8F5EE]">Previous</button>
                            <span className="text-[12px] font-medium text-[#8FA99C]">Page {currentPage} of {totalPages}</span>
                            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="border border-[#E4EDE8] bg-white text-[#0D1F17] rounded-md px-2.5 py-1.5 text-[13px] font-bold disabled:opacity-45 disabled:cursor-not-allowed hover:not-disabled:border-[#2D7A4F] hover:not-disabled:text-[#2D7A4F] hover:not-disabled:bg-[#E8F5EE]">Next</button>
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <aside className="flex flex-col gap-md">
                    <div className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] transition-shadow duration-200 hover:shadow-md">
                        <div className="text-[15px] font-bold text-[#0D1F17] mb-2">Portfolio Allocation</div>
                        <DonutChart data={assetAllocation} height={240} innerR={48} outerR={75}
                            colors={assetAllocation.map(a => a.color)} tooltipFmt={val => formatCurrency(val)}
                            centerLabel={formatCompactINR(totals.totalPortfolioValue)} centerSub="Total" hideLabels hideLegend />
                        <div className="mt-1.5 grid gap-2">
                            {allocationRows.map(row => (
                                <div key={row.name} className="grid items-center gap-2.5" style={{ gridTemplateColumns: 'minmax(0,1fr) auto auto' }}>
                                    <div className="inline-flex items-center gap-2.5 min-w-0 text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.4px]">
                                        <span className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: row.color }} />
                                        <span>{row.name}</span>
                                    </div>
                                    <strong className="text-[13px] text-[#0D1F17] font-bold tracking-tight">{formatLakh(row.value)}</strong>
                                    <span className="text-[12px] text-[#8FA99C] font-semibold min-w-[38px] text-right">{row.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] transition-shadow duration-200 hover:shadow-md">
                        <div className="text-[15px] font-bold text-[#0D1F17] mb-2">Performance Summary</div>
                        {[{ label: 'Best Performer', value: bestPerformer?.name || 'N/A' },
                             { label: 'Worst Performer', value: worstPerformer?.name || 'N/A' },
                             { label: 'Avg. Return', value: `${avgReturnPct}%`, positive: true },
                             { label: 'Liquid Ratio', value: `${liquidPct}%` },
                             { label: 'Asset Classes', value: `${new Set(assetRows.map(a => a.category)).size} types` },
                        ].map((r, i, arr) => (
                            <div key={r.label} className={`flex justify-between items-center py-[9px] gap-2.5 ${i < arr.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}>
                                <span className="text-[#8FA99C] text-[13px] font-medium">{r.label}</span>
                                <strong className={`text-[13px] text-right font-bold ${r.positive ? 'text-[#2D7A4F]' : 'text-[#0D1F17]'}`}>{r.value}</strong>
                            </div>
                        ))}
                    </div>
                </aside>
            </section>

            {/* View Drawer */}
            {viewAsset && (
                <div className="fixed inset-0 bg-[rgba(15,23,42,0.3)] backdrop-blur-sm z-[1200]" onClick={() => setViewAsset(null)}>
                    <aside
                        className="absolute top-0 right-0 h-full bg-white border-l border-border-light shadow-drawer p-md flex flex-col gap-md overflow-y-auto animate-drawer-in"
                        style={{ width: 'min(420px, 92vw)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start gap-2.5">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#0D1F17]">{viewAsset.name}</h3>
                                <p className="mt-[3px] text-[#8FA99C] text-[12px] font-medium">{viewAsset.subType || toCategoryLabel(viewAsset.category)}</p>
                            </div>
                            <button type="button" aria-label="Close drawer" onClick={() => setViewAsset(null)}
                                className="w-7 h-7 border border-border rounded-lg bg-white text-text-secondary flex items-center justify-center">
                                <MdClose />
                            </button>
                        </div>
                        <div className="bg-[#2D7A4F] rounded-lg text-white p-md grid gap-[5px]">
                            <span className="opacity-90 text-[11px] tracking-[0.5px] uppercase font-bold">Current Value</span>
                            <strong className="text-[34px] leading-none font-bold">{formatCurrency(viewAsset.currentValue)}</strong>
                            <small className="w-fit bg-white/[0.12] rounded-full px-2.5 py-1 text-[11px] font-bold">
                                {viewAsset.currentValue >= viewAsset.purchasePrice ? '+' : '-'}
                                {Math.abs(((viewAsset.currentValue - viewAsset.purchasePrice) / (viewAsset.purchasePrice || 1)) * 100).toFixed(1)}% return
                            </small>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Purchase Price', value: formatCurrency(viewAsset.purchasePrice) },
                                { label: 'Gain / Loss', value: formatCurrency(viewAsset.currentValue - viewAsset.purchasePrice) },
                                { label: 'Category', value: toCategoryLabel(viewAsset.category) },
                                { label: 'Sub Type', value: viewAsset.subType || toCategoryLabel(viewAsset.category) },
                                { label: 'Purchase Date', value: viewAsset.purchaseDate || 'N/A' },
                                { label: 'Liquid Asset', value: viewAsset.isLiquid ? 'Yes' : 'No' },
                            ].map(item => (
                                <div key={item.label} className="border border-[#E4EDE8] bg-[#F9FAFB] rounded-md p-2.5 grid gap-1">
                                    <span className="text-[11px] uppercase tracking-[0.5px] text-[#8FA99C] font-bold">{item.label}</span>
                                    <strong className="text-[#0D1F17] text-[13px] font-bold">{item.value}</strong>
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto grid grid-cols-2 gap-2.5">
                            <button type="button" className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#2D7A4F] text-white rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#256341] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(45,122,79,0.3)] justify-center" onClick={() => { setViewAsset(null); openEditModal(viewAsset); }}>
                                <MdEdit /> Edit Asset
                            </button>
                            <button type="button"
                                className="border border-[#FEF2F2] text-[#EF4444] bg-[#FEF2F2] rounded-md font-bold inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-[13px] hover:bg-[#FDEDE1]"
                                onClick={() => { handleDelete(viewAsset.id); setViewAsset(null); }}>
                                <MdDeleteOutline /> Delete
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Edit/Create Modal */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={editMode === 'create' ? 'Add Asset' : 'Edit Asset'}>
                <form className="flex flex-col gap-[24px]" onSubmit={handleFormSubmit}>
                    <div className="flex flex-col gap-[4px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1" htmlFor="asset-name">Asset Name</label>
                        <div className="flex items-center gap-[16px] border border-[#E4EDE8] rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-[#2D7A4F] focus-within:shadow-[0_0_0_3px_rgba(45,122,79,0.1)]">
                            <input className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none placeholder:font-normal" id="asset-name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-[16px]">
                        <div className="flex flex-col gap-[4px]">
                            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1" htmlFor="asset-category">Category</label>
                            <div className="flex items-center gap-[16px] border border-[#E4EDE8] rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-[#2D7A4F] focus-within:shadow-[0_0_0_3px_rgba(45,122,79,0.1)]">
                                <select className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none cursor-pointer" id="asset-category" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                                    {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{toCategoryLabel(c)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[4px]">
                            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1" htmlFor="asset-subtype">Subtype</label>
                            <div className="flex items-center gap-[16px] border border-[#E4EDE8] rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-[#2D7A4F] focus-within:shadow-[0_0_0_3px_rgba(45,122,79,0.1)]">
                                <input className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none placeholder:font-normal" id="asset-subtype" value={formData.subType} onChange={e => setFormData(p => ({ ...p, subType: e.target.value }))} placeholder="Optional" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-[16px]">
                        <div className="flex flex-col gap-[4px]">
                            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1" htmlFor="asset-cur">Current Value</label>
                            <div className="flex items-center gap-[16px] border border-[#E4EDE8] rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-[#2D7A4F] focus-within:shadow-[0_0_0_3px_rgba(45,122,79,0.1)]">
                                <span className="text-text-muted">₹</span>
                                <input className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:font-normal" id="asset-cur" type="number" min="0" value={formData.currentValue} onChange={e => setFormData(p => ({ ...p, currentValue: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="flex flex-col gap-[4px]">
                            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1" htmlFor="asset-pp">Purchase Price</label>
                            <div className="flex items-center gap-[16px] border border-[#E4EDE8] rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-[#2D7A4F] focus-within:shadow-[0_0_0_3px_rgba(45,122,79,0.1)]">
                                <span className="text-text-muted">₹</span>
                                <input className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:font-normal" id="asset-pp" type="number" min="0" value={formData.purchasePrice} onChange={e => setFormData(p => ({ ...p, purchasePrice: e.target.value }))} required />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[4px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px] ml-1" htmlFor="asset-liquid">Liquidity</label>
                        <div className="flex items-center gap-[16px] border border-[#E4EDE8] rounded-lg p-[12px_16px] bg-white transition-all duration-200 focus-within:border-[#2D7A4F] focus-within:shadow-[0_0_0_3px_rgba(45,122,79,0.1)]">
                            <select className="border-0 bg-transparent p-0 text-[13px] font-bold text-[#0D1F17] w-full outline-none shadow-none cursor-pointer" id="asset-liquid" value={formData.isLiquid ? 'yes' : 'no'} onChange={e => setFormData(p => ({ ...p, isLiquid: e.target.value === 'yes' }))}>
                                <option value="yes">Liquid</option>
                                <option value="no">Locked</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-[16px] mt-[24px] pt-[24px] border-t border-[#E4EDE8]">
                        <button type="button" className="flex-1 py-3 rounded-lg font-bold text-[13px] cursor-pointer transition-all duration-200 text-center bg-[#F3F4F6] text-[#374151] border-none hover:bg-[#E5E7EB]" onClick={closeEditModal}>Cancel</button>
                        <button type="submit" className="flex-1 py-3 rounded-lg font-bold text-[13px] cursor-pointer transition-all duration-200 text-center bg-[#2D7A4F] text-white border-none hover:bg-[#256341] shadow-sm">{editMode === 'create' ? 'Add Asset' : 'Save Changes'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
