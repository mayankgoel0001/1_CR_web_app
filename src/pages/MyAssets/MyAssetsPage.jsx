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
import { assets, assetAllocation, formatCurrency } from '../../data/mockData';
import './MyAssetsPage.css';

const categoryMeta = {
    all: { label: 'All Assets', color: 'var(--color-primary)' },
    savings: { label: 'Savings', color: '#16A34A' },
    investments: { label: 'Investments', color: '#2563EB' },
    retirement: { label: 'Retirement', color: '#8B5CF6' },
    crypto: { label: 'Crypto', color: '#F59E0B' },
    vehicles: { label: 'Vehicle', color: '#EF4444' },
};

const iconByCategory = {
    savings: MdAccountBalanceWallet,
    investments: MdAutoGraph,
    retirement: MdShield,
    crypto: MdCurrencyBitcoin,
    vehicles: MdDirectionsCar,
};

function toCategoryLabel(value) {
    return categoryMeta[value]?.label || value.replace('_', ' ');
}

function formatAmount(value) {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function formatLakh(value) {
    const lakhs = (value || 0) / 100000;
    return `₹${lakhs.toFixed(2)}L`;
}

function formatCompactINR(value) {
    const amount = Number(value) || 0;

    const formatShort = (num) => {
        const fixed = num.toFixed(2);
        return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
    };

    if (amount >= 10000000) {
        return `₹${formatShort(amount / 10000000)}Cr`;
    }

    if (amount >= 100000) {
        return `₹${formatShort(amount / 100000)}L`;
    }

    if (amount >= 1000) {
        return `₹${formatShort(amount / 1000)}K`;
    }

    return `₹${formatAmount(amount)}`;
}

export default function MyAssetsPage() {
    const navigate = useNavigate();
    const [assetRows, setAssetRows] = useState(() => [...assets]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('value');
    const [page, setPage] = useState(1);
    const [viewAsset, setViewAsset] = useState(null);
    const [editAsset, setEditAsset] = useState(null);
    const [editMode, setEditMode] = useState('edit');
    const [formData, setFormData] = useState({
        name: '',
        category: 'savings',
        subType: '',
        currentValue: '',
        purchasePrice: '',
        isLiquid: true,
    });

    const pageSize = 6;

    const categories = useMemo(() => {
        const unique = Array.from(new Set(assetRows.map((asset) => asset.category)));
        return ['all', ...unique];
    }, [assetRows]);

    const categoryCounts = useMemo(() => {
        const counts = assetRows.reduce((acc, asset) => {
            acc[asset.category] = (acc[asset.category] || 0) + 1;
            return acc;
        }, {});
        counts.all = assetRows.length;
        return counts;
    }, [assetRows]);

    const filteredAssets = useMemo(() => {
        const term = search.trim().toLowerCase();
        let list = assetRows.filter((asset) => {
            const inSearch =
                !term ||
                asset.name.toLowerCase().includes(term) ||
                (asset.subType || '').toLowerCase().includes(term) ||
                asset.category.toLowerCase().includes(term);
            const inCategory = category === 'all' || asset.category === category;
            return inSearch && inCategory;
        });

        list = [...list].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return b.currentValue - a.currentValue;
        });

        return list;
    }, [assetRows, search, category, sortBy]);

    useEffect(() => {
        setPage(1);
    }, [search, category, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const paginatedAssets = filteredAssets.slice(pageStart, pageStart + pageSize);

    const totals = useMemo(() => {
        const totalPortfolioValue = assetRows.reduce((sum, asset) => sum + asset.currentValue, 0);
        const totalInvested = assetRows.reduce((sum, asset) => sum + asset.purchasePrice, 0);
        const totalGainLoss = totalPortfolioValue - totalInvested;
        const liquidAssets = assetRows.reduce((sum, asset) => sum + (asset.isLiquid ? asset.currentValue : 0), 0);
        return { totalPortfolioValue, totalInvested, totalGainLoss, liquidAssets };
    }, [assetRows]);

    const avgReturnPct = totals.totalInvested
        ? ((totals.totalGainLoss / totals.totalInvested) * 100).toFixed(1)
        : '0.0';

    const bestPerformer = useMemo(() => {
        return [...assetRows]
            .map((asset) => ({
                name: asset.name,
                pct: asset.purchasePrice ? ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100 : 0,
            }))
            .sort((a, b) => b.pct - a.pct)[0];
    }, [assetRows]);

    const worstPerformer = useMemo(() => {
        return [...assetRows]
            .map((asset) => ({
                name: asset.name,
                pct: asset.purchasePrice ? ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100 : 0,
            }))
            .sort((a, b) => a.pct - b.pct)[0];
    }, [assetRows]);

    const liquidPct = totals.totalPortfolioValue
        ? ((totals.liquidAssets / totals.totalPortfolioValue) * 100).toFixed(1)
        : '0.0';

    const allocationRows = useMemo(() => {
        const total = assetAllocation.reduce((sum, row) => sum + row.value, 0);
        return assetAllocation
            .filter((row) => row.value > 0)
            .map((row) => ({
                ...row,
                pct: total ? ((row.value / total) * 100).toFixed(1) : '0.0',
            }))
            .sort((a, b) => b.value - a.value);
    }, []);

    const openCreateModal = () => {
        setEditMode('create');
        setEditAsset(null);
        setFormData({
            name: '',
            category: 'savings',
            subType: '',
            currentValue: '',
            purchasePrice: '',
            isLiquid: true,
        });
    };

    const openEditModal = (asset) => {
        setEditMode('edit');
        setEditAsset(asset);
        setFormData({
            name: asset.name,
            category: asset.category,
            subType: asset.subType || '',
            currentValue: asset.currentValue,
            purchasePrice: asset.purchasePrice,
            isLiquid: Boolean(asset.isLiquid),
        });
    };

    const closeEditModal = () => {
        setEditAsset(null);
        if (editMode === 'create') {
            setEditMode('edit');
        }
    };

    const isEditModalOpen = editMode === 'create' || Boolean(editAsset);

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const payload = {
            name: formData.name.trim(),
            category: formData.category,
            subType: formData.subType.trim(),
            currentValue: Number(formData.currentValue),
            purchasePrice: Number(formData.purchasePrice),
            isLiquid: Boolean(formData.isLiquid),
            isActive: true,
        };

        if (!payload.name || !payload.category || Number.isNaN(payload.currentValue) || Number.isNaN(payload.purchasePrice)) {
            return;
        }

        if (editMode === 'create') {
            setAssetRows((prev) => {
                const nextId = prev.length ? Math.max(...prev.map((row) => row.id)) + 1 : 1;
                return [
                    ...prev,
                    {
                        ...payload,
                        id: nextId,
                        purchaseDate: new Date().toISOString().slice(0, 10),
                    },
                ];
            });
            setEditMode('edit');
            setPage(totalPages);
            setEditAsset(null);
            return;
        }

        setAssetRows((prev) => prev.map((row) => (row.id === editAsset.id ? { ...row, ...payload } : row)));
        setEditAsset(null);
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm('Delete this asset from the list?');
        if (!confirmed) {
            return;
        }
        setAssetRows((prev) => prev.filter((row) => row.id !== id));
    };

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
        setViewAsset(asset);
    };

    return (
        <div className="my-assets-page">
            <header className="my-assets-header">
                <h1>My Assets</h1>
                <p>
                    Portfolio
                    <MdKeyboardArrowRight size={12} />
                    <span>My Assets</span>
                </p>
            </header>

            <section className="my-assets-summary-strip">
                <article className="my-assets-stat-card">
                    <div className="my-assets-stat-icon"><MdAccountBalanceWallet /></div>
                    <span>Total Portfolio Value</span>
                    <strong>{formatCurrency(totals.totalPortfolioValue)}</strong>
                    <small>{assetRows.length} assets tracked</small>
                </article>

                <article className="my-assets-stat-card">
                    <div className="my-assets-stat-icon"><MdAccountBalance /></div>
                    <span>Total Invested</span>
                    <strong>{formatCurrency(totals.totalInvested)}</strong>
                    <small>Cost basis</small>
                </article>

                <article className="my-assets-stat-card">
                    <div className="my-assets-stat-icon"><MdInsights /></div>
                    <span>Total Gain / Loss</span>
                    <strong className={totals.totalGainLoss >= 0 ? 'positive' : 'negative'}>
                        {totals.totalGainLoss >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(totals.totalGainLoss))}
                    </strong>
                    <small>{avgReturnPct}% overall return</small>
                </article>

                <article className="my-assets-stat-card">
                    <div className="my-assets-stat-icon"><MdWaterDrop /></div>
                    <span>Liquid Assets</span>
                    <strong>{formatCurrency(totals.liquidAssets)}</strong>
                    <small>{liquidPct}% of portfolio</small>
                </article>
            </section>

            <section className="my-assets-main-grid">
                <div className="my-assets-table-card card">
                    <div className="my-assets-toolbar">
                        <div className="my-assets-search">
                            <MdSearch />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search assets..."
                                aria-label="Search assets"
                            />
                        </div>

                        <div className="my-assets-select-wrap">
                            <MdFilterList />
                            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category filter">
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{toCategoryLabel(cat)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="my-assets-select-wrap">
                            <MdSort />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort assets">
                                <option value="value">Sort by Value</option>
                                <option value="name">Sort by Name</option>
                            </select>
                        </div>

                        <button className="btn-primary" type="button" onClick={openCreateModal}>
                            <MdAdd />
                            Add Asset
                        </button>
                    </div>

                    <div className="my-assets-pills">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={category === cat ? 'pill active' : 'pill'}
                                onClick={() => setCategory(cat)}
                                type="button"
                            >
                                <span className="dot" style={{ background: categoryMeta[cat]?.color || '#9CA3AF' }} />
                                {toCategoryLabel(cat)}
                                <span className="pill-count">{categoryCounts[cat] || 0}</span>
                            </button>
                        ))}
                    </div>

                    <div className="my-assets-table-wrap">
                        <table className="my-assets-table">
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Category</th>
                                    <th className="right">Current Value (₹)</th>
                                    <th className="right">Purchase Price (₹)</th>
                                    <th className="right">Gain / Loss (₹)</th>
                                    <th className="center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAssets.map((asset) => {
                                    const gain = asset.currentValue - asset.purchasePrice;
                                    const pct = asset.purchasePrice ? (gain / asset.purchasePrice) * 100 : 0;
                                    const dotColor = categoryMeta[asset.category]?.color || '#6B7280';

                                    return (
                                        <tr
                                            key={asset.id}
                                            className="asset-row"
                                            onClick={() => handleAssetRowClick(asset)}
                                        >
                                            <td>
                                                <div className="asset-cell">
                                                    <div className="asset-dot" style={{ background: dotColor }} />
                                                    <div>
                                                        <div className="asset-title">{asset.name}</div>
                                                        <div className="asset-subtitle">{asset.subType || toCategoryLabel(asset.category)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="asset-category-pill">{toCategoryLabel(asset.category)}</span>
                                            </td>
                                            <td className="right value-cell">{formatAmount(asset.currentValue)}</td>
                                            <td className="right value-cell">{formatAmount(asset.purchasePrice)}</td>
                                            <td className="right">
                                                <span className={gain >= 0 ? 'liab-rate-badge rate-green' : 'liab-rate-badge rate-red'}>
                                                    {gain >= 0 ? '+' : '-'}{formatAmount(Math.abs(gain))} ({Math.abs(pct).toFixed(1)}%)
                                                </span>
                                            </td>
                                            <td className="center">
                                                <div className="asset-actions">
                                                    <button
                                                        type="button"
                                                        aria-label="Edit asset"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(asset);
                                                        }}
                                                    >
                                                        <MdEdit />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Delete asset"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(asset.id);
                                                        }}
                                                    >
                                                        <MdDeleteOutline />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filteredAssets.length === 0 && (
                            <div className="my-assets-empty">No assets match your search or filter.</div>
                        )}
                    </div>

                    <div className="my-assets-pagination">
                        <div className="my-assets-pagination-meta">
                            Showing {filteredAssets.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageSize, filteredAssets.length)} of {filteredAssets.length}
                        </div>
                        <div className="my-assets-pagination-actions">
                            <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</button>
                        </div>
                    </div>
                </div>

                <aside className="my-assets-side-panel">
                    <div className="card side-card">
                        <div className="side-title">Portfolio Allocation</div>
                        <DonutChart
                            data={assetAllocation}
                            height={240}
                            innerR={48}
                            outerR={75}
                            colors={assetAllocation.map((a) => a.color)}
                            tooltipFmt={(val) => formatCurrency(val)}
                            centerLabel={formatCompactINR(totals.totalPortfolioValue)}
                            centerSub="Total"
                            hideLabels
                            hideLegend
                        />

                        <div className="allocation-breakdown">
                            {allocationRows.map((row) => (
                                <div key={row.name} className="allocation-row">
                                    <div className="allocation-name">
                                        <span className="allocation-dot" style={{ background: row.color }} />
                                        <span>{row.name}</span>
                                    </div>
                                    <strong>{formatLakh(row.value)}</strong>
                                    <span className="allocation-pct">{row.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card side-card">
                        <div className="side-title">Performance Summary</div>
                        <div className="perf-row"><span>Best Performer</span><strong>{bestPerformer?.name || 'N/A'}</strong></div>
                        <div className="perf-row"><span>Worst Performer</span><strong>{worstPerformer?.name || 'N/A'}</strong></div>
                        <div className="perf-row"><span>Avg. Return</span><strong className="positive">{avgReturnPct}%</strong></div>
                        <div className="perf-row"><span>Liquid Ratio</span><strong>{liquidPct}%</strong></div>
                        <div className="perf-row"><span>Asset Classes</span><strong>{new Set(assetRows.map((a) => a.category)).size} types</strong></div>
                    </div>

                    {/* <div className="my-assets-insight">
                        <h4>Smart Insight</h4>
                        <p>
                            Your portfolio is weighted toward investments. Consider balancing with more liquid and low-volatility assets for better risk control.
                        </p>
                    </div> */}
                </aside>
            </section>

            {viewAsset && (
                <div className="my-assets-drawer-overlay" onClick={() => setViewAsset(null)}>
                    <aside className="my-assets-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="my-assets-drawer-header">
                            <div>
                                <h3>{viewAsset.name}</h3>
                                <p>{viewAsset.subType || toCategoryLabel(viewAsset.category)}</p>
                            </div>
                            <button type="button" aria-label="Close drawer" onClick={() => setViewAsset(null)}>
                                <MdClose />
                            </button>
                        </div>

                        <div className="my-assets-drawer-card">
                            <span>Current Value</span>
                            <strong>{formatCurrency(viewAsset.currentValue)}</strong>
                            <small>
                                {viewAsset.currentValue >= viewAsset.purchasePrice ? '+' : '-'}
                                {Math.abs(((viewAsset.currentValue - viewAsset.purchasePrice) / (viewAsset.purchasePrice || 1)) * 100).toFixed(1)}% return
                            </small>
                        </div>

                        <div className="my-assets-drawer-grid">
                            <div className="my-assets-drawer-item"><span>Purchase Price</span><strong>{formatCurrency(viewAsset.purchasePrice)}</strong></div>
                            <div className="my-assets-drawer-item"><span>Gain / Loss</span><strong>{formatCurrency(viewAsset.currentValue - viewAsset.purchasePrice)}</strong></div>
                            <div className="my-assets-drawer-item"><span>Category</span><strong>{toCategoryLabel(viewAsset.category)}</strong></div>
                            <div className="my-assets-drawer-item"><span>Sub Type</span><strong>{viewAsset.subType || toCategoryLabel(viewAsset.category)}</strong></div>
                            <div className="my-assets-drawer-item"><span>Purchase Date</span><strong>{viewAsset.purchaseDate || 'N/A'}</strong></div>
                            <div className="my-assets-drawer-item"><span>Liquid Asset</span><strong>{viewAsset.isLiquid ? 'Yes' : 'No'}</strong></div>
                        </div>

                        <div className="my-assets-drawer-actions">
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => {
                                    setViewAsset(null);
                                    openEditModal(viewAsset);
                                }}
                            >
                                <MdEdit />
                                Edit Asset
                            </button>
                            <button
                                type="button"
                                className="my-assets-delete-btn"
                                onClick={() => {
                                    handleDelete(viewAsset.id);
                                    setViewAsset(null);
                                }}
                            >
                                <MdDeleteOutline />
                                Delete
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            <Modal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title={editMode === 'create' ? 'Add Asset' : 'Edit Asset'}
            >
                <form className="modal-form" onSubmit={handleFormSubmit}>
                    <div className="modal-form-group">
                        <label htmlFor="asset-name">Asset Name</label>
                        <div className="modal-input-wrapper">
                            <input
                                id="asset-name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-form-row">
                        <div className="modal-form-group">
                            <label htmlFor="asset-category">Category</label>
                            <div className="modal-input-wrapper">
                                <select
                                    id="asset-category"
                                    value={formData.category}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                >
                                    {categories.filter((cat) => cat !== 'all').map((cat) => (
                                        <option key={cat} value={cat}>{toCategoryLabel(cat)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="asset-subtype">Subtype</label>
                            <div className="modal-input-wrapper">
                                <input
                                    id="asset-subtype"
                                    value={formData.subType}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, subType: e.target.value }))}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-form-row">
                        <div className="modal-form-group">
                            <label htmlFor="asset-current-value">Current Value</label>
                            <div className="modal-input-wrapper">
                                <input
                                    id="asset-current-value"
                                    type="number"
                                    min="0"
                                    value={formData.currentValue}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, currentValue: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="asset-purchase-price">Purchase Price</label>
                            <div className="modal-input-wrapper">
                                <input
                                    id="asset-purchase-price"
                                    type="number"
                                    min="0"
                                    value={formData.purchasePrice}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, purchasePrice: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label htmlFor="asset-liquid">Liquidity</label>
                        <div className="modal-input-wrapper">
                            <select
                                id="asset-liquid"
                                value={formData.isLiquid ? 'yes' : 'no'}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isLiquid: e.target.value === 'yes' }))}
                            >
                                <option value="yes">Liquid</option>
                                <option value="no">Locked</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="modal-btn modal-btn-cancel" onClick={closeEditModal}>Cancel</button>
                        <button type="submit" className="modal-btn modal-btn-submit">
                            {editMode === 'create' ? 'Add Asset' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
