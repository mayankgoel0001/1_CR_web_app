import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { assets, liabilities, netWorthData, liabilityAllocation, formatCurrency } from '../../data/mockData';
import { ICONS } from '../../utils/icons';
import { loadAssets, saveAssets } from '../../utils/assetStore';

// Format number with commas, no rupee sign
function formatNumber(num) {
    if (num == null) return '';
    return num.toLocaleString('en-IN');
}

function formatMonthYear(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(date);
}

function monthDiff(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(0, months);
}
import DonutChart from '../../components/Charts/DonutChart';
import Modal from '../../components/common/Modal';
import KPICard from '../../components/common/KPICard';
import { MdAccountBalance, MdDriveEta, MdBusiness, MdHome, MdAttachMoney, MdShowChart, MdOutlineCategory, MdPerson, MdCalendarToday, MdOutlineEventNote, MdClose } from 'react-icons/md';



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
            <div className="bg-[#111827] rounded-[10px] p-[12px_16px] shadow-[0_10px_25px_rgba(0,0,0,0.2)] text-white">
                <p className="font-bold mb-[8px] text-[12.5px]">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index}
                        className={`text-[12px] mb-[4px] flex gap-[6px] ${entry.name === 'Assets' ? 'text-[#A7F3D0]' :
                            entry.name === 'Liabilities' ? 'text-[#FECACA]' : 'text-[#BFDBFE]'
                            }`}
                    >
                        <span>{entry.name}:</span>
                        <span className="font-semibold">{formatCurrency(entry.value)}</span>
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
    const [localAssets, setLocalAssets] = useState(() => loadAssets(assets));
    const [localLiabilities, setLocalLiabilities] = useState(liabilities);

    useEffect(() => {
        saveAssets(localAssets);
    }, [localAssets]);

    // Asset filters
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Liability filters
    const [liabilitySearch, setLiabilitySearch] = useState('');
    const [liabilityCategoryFilter, setLiabilityCategoryFilter] = useState('All');

    // Modals state
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isAssetEditModalOpen, setIsAssetEditModalOpen] = useState(false);
    const [isLiabilityModalOpen, setIsLiabilityModalOpen] = useState(false);
    const [isLiabilityEditModalOpen, setIsLiabilityEditModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedLiabilityId, setSelectedLiabilityId] = useState(null);
    const [assetEditForm, setAssetEditForm] = useState({
        name: '',
        category: 'savings',
        subType: '',
        currentValue: '',
        purchasePrice: '',
        purchaseDate: '',
        isLiquid: false,
    });
    const [liabilityEditForm, setLiabilityEditForm] = useState({
        name: '',
        type: '',
        lender: '',
        principalAmount: '',
        currentBalance: '',
        monthlyPayment: '',
        interestRate: '',
        maturityDate: '',
        isGuarantor: false,
    });

    useEffect(() => {
        if (selectedAsset || selectedLiabilityId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedAsset, selectedLiabilityId]);

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

    const allocationData = useMemo(() => {
        const byCategory = localAssets.reduce((acc, asset) => {
            const key = asset.category || 'other';
            acc[key] = (acc[key] || 0) + (Number(asset.currentValue) || 0);
            return acc;
        }, {});

        return Object.entries(byCategory).map(([key, value]) => ({
            name: key.replace('_', ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
            value,
            color: categoryColors[key] || categoryColors.other,
        }));
    }, [localAssets]);

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

    const normalizedLiabilities = useMemo(
        () => localLiabilities.map((loan) => {
            const principal = Number(loan.principalAmount ?? loan.originalAmount ?? 0);
            const outstanding = Number(loan.currentBalance ?? 0);
            const monthlyPayment = Number(loan.monthlyPayment ?? 0);
            const repaid = Math.max(principal - outstanding, 0);
            const repaidPct = principal > 0 ? (repaid / principal) * 100 : 0;
            let tenureLeft = monthDiff(new Date(), loan.maturityDate);

            if (tenureLeft == null && monthlyPayment > 0) {
                tenureLeft = Math.ceil(outstanding / monthlyPayment);
            }

            return {
                ...loan,
                principal,
                outstanding,
                monthlyPayment,
                repaid,
                repaidPct,
                tenureLeft: tenureLeft == null ? 0 : tenureLeft,
            };
        }),
        [localLiabilities]
    );

    const selectedLiability = useMemo(
        () => normalizedLiabilities.find((loan) => String(loan.id) === String(selectedLiabilityId)) || null,
        [normalizedLiabilities, selectedLiabilityId]
    );

    const selectedLiabilityDetails = useMemo(() => {
        if (!selectedLiability) {
            return null;
        }

        const paidAmount = Math.max(selectedLiability.principal - selectedLiability.outstanding, 0);
        const monthlyInterest = (selectedLiability.outstanding * (Number(selectedLiability.interestRate) || 0)) / 1200;
        const principalComponent = Math.max(selectedLiability.monthlyPayment - monthlyInterest, 0);
        const totalInterest = Math.max(
            (selectedLiability.monthlyPayment * selectedLiability.tenureLeft) - selectedLiability.outstanding,
            0
        );

        return {
            paidAmount,
            monthlyInterest,
            principalComponent,
            totalInterest,
        };
    }, [selectedLiability]);

    const handleOpenLiabilityEdit = () => {
        if (!selectedLiability) {
            return;
        }

        setLiabilityEditForm({
            name: selectedLiability.name || '',
            type: selectedLiability.type || 'Long-term Liabilities',
            lender: selectedLiability.lender || '',
            principalAmount: String(selectedLiability.principal || selectedLiability.originalAmount || 0),
            currentBalance: String(selectedLiability.outstanding || selectedLiability.currentBalance || 0),
            monthlyPayment: String(selectedLiability.monthlyPayment || 0),
            interestRate: String(selectedLiability.interestRate || 0),
            maturityDate: selectedLiability.maturityDate || '',
            isGuarantor: Boolean(selectedLiability.isGuarantor),
        });
        setIsLiabilityEditModalOpen(true);
    };

    const handleEditLiabilitySubmit = (e) => {
        e.preventDefault();
        if (!selectedLiability) {
            return;
        }

        const updated = {
            name: liabilityEditForm.name.trim(),
            type: liabilityEditForm.type,
            lender: liabilityEditForm.lender.trim(),
            originalAmount: Number(liabilityEditForm.principalAmount),
            currentBalance: Number(liabilityEditForm.currentBalance),
            monthlyPayment: Number(liabilityEditForm.monthlyPayment),
            interestRate: Number(liabilityEditForm.interestRate),
            maturityDate: liabilityEditForm.maturityDate,
            isGuarantor: Boolean(liabilityEditForm.isGuarantor),
        };

        if (!updated.name || Number.isNaN(updated.currentBalance) || Number.isNaN(updated.monthlyPayment)) {
            return;
        }

        setLocalLiabilities((prev) => prev.map((loan) => (
            String(loan.id) === String(selectedLiability.id)
                ? {
                    ...loan,
                    ...updated,
                }
                : loan
        )));

        setIsLiabilityEditModalOpen(false);
    };

    const handleDeleteLiability = () => {
        if (!selectedLiability) {
            return;
        }

        const confirmed = window.confirm(`Delete ${selectedLiability.name} from liabilities?`);
        if (!confirmed) {
            return;
        }

        setLocalLiabilities((prev) => prev.filter((loan) => String(loan.id) !== String(selectedLiability.id)));
        setSelectedLiabilityId(null);
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
        setSelectedAsset(asset);
    };

    const handleOpenAssetEdit = () => {
        if (!selectedAsset) {
            return;
        }

        setAssetEditForm({
            name: selectedAsset.name || '',
            category: selectedAsset.category || 'savings',
            subType: selectedAsset.subType || '',
            currentValue: String(selectedAsset.currentValue || 0),
            purchasePrice: String(selectedAsset.purchasePrice || 0),
            purchaseDate: selectedAsset.purchaseDate || '',
            isLiquid: Boolean(selectedAsset.isLiquid),
        });
        setIsAssetEditModalOpen(true);
    };

    const handleEditAssetSubmit = (e) => {
        e.preventDefault();
        if (!selectedAsset) {
            return;
        }

        const updated = {
            name: assetEditForm.name.trim(),
            category: assetEditForm.category,
            subType: assetEditForm.subType.trim(),
            currentValue: Number(assetEditForm.currentValue),
            purchasePrice: Number(assetEditForm.purchasePrice),
            purchaseDate: assetEditForm.purchaseDate,
            isLiquid: Boolean(assetEditForm.isLiquid),
        };

        if (!updated.name || Number.isNaN(updated.currentValue) || Number.isNaN(updated.purchasePrice)) {
            return;
        }

        setLocalAssets((prev) => prev.map((asset) => (
            String(asset.id) === String(selectedAsset.id)
                ? {
                    ...asset,
                    ...updated,
                }
                : asset
        )));

        setSelectedAsset((prev) => (prev ? { ...prev, ...updated } : prev));
        setIsAssetEditModalOpen(false);
    };

    const handleDeleteAsset = () => {
        if (!selectedAsset) {
            return;
        }

        const confirmed = window.confirm(`Delete ${selectedAsset.name} from assets?`);
        if (!confirmed) {
            return;
        }

        setLocalAssets((prev) => prev.filter((asset) => String(asset.id) !== String(selectedAsset.id)));
        setSelectedAsset(null);
    };

    return (
        <div className="flex flex-col gap-[24px]">
            {/* Portfolio Header & Cards */}
            <div>
                <div className="flex justify-between items-start flex-wrap gap-[16px]">
                    <div>
                        <h2 className="text-[22px] font-bold text-[#0D1F17] m-0 mb-[4px]">Portfolio Overview</h2>
                        <p className="text-[12.5px] text-[#8FA99C] m-0">Track all your assets, liabilities and net worth in one place</p>
                        <br />
                    </div>
                    <div className="flex gap-[8px]">
                        <button className="bg-white text-text-secondary border border-border px-[16px] py-[8px] rounded-[6px] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-bg" onClick={() => setIsLiabilityModalOpen(true)}>
                            + Add Liability
                        </button>
                        <button className="bg-[#2E7950] text-white border-none px-[16px] py-[8px] rounded-[6px] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[#256341]" onClick={() => setIsAssetModalOpen(true)}>
                            + Add Asset
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mt-[0px]">
                    <KPICard
                        label="Net Worth"
                        value={formatCurrency(netWorthData.currentNetWorth)}
                        icon={ICONS.diamondLg}
                        dark={true}
                        badge={
                            <span className="text-[11.5px] font-semibold py-[3px] px-[8px] rounded-full bg-[rgba(45,122,79,0.12)] border border-[rgba(45,122,79,0.24)] text-[#2D7A4F]">
                                ▲ +4.2% this month
                            </span>
                        }
                        subText="Assets minus liabilities"
                        valueColor="text-[#183325]"
                    />

                    <KPICard
                        label="Total Assets"
                        value={formatCurrency(totalAssets)}
                        icon={ICONS.chartUp}
                        valueColor="text-[#3B82F6]"
                        iconBg="bg-[#EEF2FF]"
                        iconColor="text-[#3B82F6]"
                        badge={
                            <span className="text-[11.5px] font-semibold py-[3px] px-[8px] rounded-full bg-[#F3F4F6] text-[#0D1F17]">
                                {localAssets.length} assets tracked
                            </span>
                        }
                        subText={`Across ${new Set(localAssets.map(a => a.category)).size} categories`}
                    />

                    <KPICard
                        label="Total Liabilities"
                        value={formatCurrency(totalLiabilities)}
                        icon={ICONS.creditCardLg}
                        valueColor="text-[#EF4444]"
                        iconBg="bg-[#FEF2F2]"
                        iconColor="text-[#EF4444]"
                        badge={
                            <span className="text-[11.5px] font-semibold py-[3px] px-[8px] rounded-full bg-[#FEF2F2] text-[#EF4444]">
                                {localLiabilities.length} active loans
                            </span>
                        }
                        subText={`${formatCurrency(totalMonthlyEMI)}/mo total EMI`}
                    />

                    <KPICard
                        label="Total Gain / Loss"
                        value={`+${formatCurrency(57200)}`}
                        icon={ICONS.barChartLg}
                        valueColor="text-[#10B981]"
                        iconBg="bg-[#ECFDF5]"
                        iconColor="text-[#10B981]"
                        badge={
                            <span className="text-[11.5px] font-semibold py-[3px] px-[8px] rounded-full bg-[#ECFDF5] text-[#10B981]">
                                ▲ +9.4% overall return
                            </span>
                        }
                        subText="Unrealised portfolio gain"
                    />
                </div>
            </div>

            {/* Net Worth Chart + Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[24px]">
                <div className="bg-white rounded-[14px] border border-[#E4EDE8] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[32px] transition-shadow duration-200 hover:shadow-md">
                    <div className="flex justify-between items-start mb-[20px] flex-wrap gap-[16px]">
                        <div>
                            <h4 className="font-bold text-[15px] text-[#0D1F17] mb-[4px]">Net Worth Trend</h4>
                            <p className="text-[12px] text-[#8FA99C] m-0">Assets vs Liabilities over time</p>

                            {/* Custom Legend */}
                            <div className="flex gap-[16px] mt-[16px]">
                                <div className="flex items-center gap-[6px] text-[12px] text-[#334155] font-medium">
                                    <div className="w-[8px] h-[8px] rounded-full bg-[#2D7A4F]"></div>
                                    Assets
                                </div>
                                <div className="flex items-center gap-[6px] text-[12px] text-[#334155] font-medium">
                                    <div className="w-[8px] h-[8px] rounded-full bg-[#EF4444]"></div>
                                    Liabilities
                                </div>
                                <div className="flex items-center gap-[6px] text-[12px] text-[#334155] font-medium">
                                    <div className="w-[8px] h-[8px] rounded-full bg-[#3B82F6]"></div>
                                    Net Worth
                                </div>
                            </div>
                        </div>

                        <div className="inline-flex border border-[#E4EDE8] rounded-[8px] overflow-hidden">
                            {['1M', '3M', '6M', '1Y', 'All'].map(f => (
                                <button key={f} className={`bg-white text-text-secondary border-none border-r border-[#E4EDE8] last:border-none px-[12px] py-[6px] text-[12px] font-medium cursor-pointer transition-colors hover:bg-bg ${timeFilter === f ? '!bg-[#2D7A4F] !text-white' : ''}`} onClick={() => setTimeFilter(f)}>
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
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: 10.5, dy: 10, fontWeight: 500 }} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#000', fontSize: 10.5, fontWeight: 500 }}
                                tickFormatter={(val) => {
                                    if (val === 0) return '₹0K';
                                    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                                    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
                                    return `₹${(val / 1000).toFixed(0)}K`;
                                }}
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

                <div className="bg-white rounded-[14px] border border-[#E4EDE8] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] max-md:p-[16px] transition-shadow duration-200 hover:shadow-md">
                    <h4 className="font-bold text-[15px] text-[#0D1F17]">Asset Allocation</h4>
                    <br />
                    <DonutChart
                        data={allocationData}
                        height={260}
                        innerR={50}
                        outerR={75}
                        colors={allocationData.map(a => a.color)}
                        tooltipFmt={(val) => formatCurrency(val)}
                        centerLabel={totalAssets >= 10000000 ? `₹${(totalAssets / 10000000).toFixed(1)}Cr` : `₹${(totalAssets / 100000).toFixed(1)}L`}
                        centerSub="Total Assets"
                    />
                </div>
            </div>

            {/* Assets Table */}
            <div className="flex flex-col gap-[16px]">
                <div className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-md p-0 overflow-hidden max-md:p-[16px]">
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-[16px] p-[20px_24px_16px] border-b border-border flex-wrap">
                        <div>
                            <h3 className="text-[15px] font-bold text-[#0D1F17] m-[0_0_3px]">My Assets</h3>
                            <p className="text-[12px] text-[#8FA99C] m-0">{filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} tracked</p>
                        </div>
                        <div className="flex items-center gap-[10px] flex-wrap">
                            <div className="flex items-center gap-[8px] border border-[#E4EDE8] rounded-[8px] p-[8px_14px] bg-white min-w-[220px] max-md:min-w-full">
                                <svg className="text-[#8FA99C] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                <input className="border-none outline-none text-[13px] text-[#0D1F17] bg-transparent w-full placeholder:text-[#8FA99C]" type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <select className="border border-[#E4EDE8] rounded-[8px] p-[8px_28px_8px_12px] text-[13px] text-[#0D1F17] bg-white bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2210%22_height=%226%22_viewBox=%220_0_10_6%22%3E%3Cpath_d=%22M1_1l4_4_4-4%22_stroke=%22%236B7280%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-[position:right_10px_center] bg-no-repeat appearance-none cursor-pointer min-w-[140px] max-md:min-w-full" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="All">All Categories</option>
                                <option value="savings">Savings</option>
                                <option value="investments">Investments</option>
                                <option value="retirement">Retirement</option>
                                <option value="crypto">Crypto</option>
                                <option value="vehicles">Vehicles</option>
                                <option value="other">Other</option>
                            </select>
                            <button className="bg-[#2D7A4F] text-white border-none px-[16px] py-[8px] rounded-[6px] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[#256341]" onClick={() => navigate('/my-assets')}>View More</button>
                        </div>
                    </div>

                    {/* Scrollable table */}
                    <div className="overflow-auto h-[300px] scrollbar-thin scrollbar-thumb-[#D1D5DB] scrollbar-track-transparent">
                        <table className="w-full min-w-[700px] border-collapse">
                            <thead className="sticky top-0 z-[5] bg-[#F7F9F8]">
                                <tr>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8]">Asset</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8]">Category</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8] text-right">Current Value (₹)</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8] text-right">Purchase Price (₹)</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8] text-right">Gain / Loss (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssets.map(asset => {
                                    const gain = asset.currentValue - asset.purchasePrice;
                                    const gainPct = ((gain / asset.purchasePrice) * 100).toFixed(1);
                                    return (
                                        <tr
                                            key={asset.id}
                                            className="cursor-pointer hover:bg-[#F9FAFB] group"
                                            onClick={() => handleAssetRowClick(asset)}
                                        >
                                            <td className="p-[14px_20px] text-[13px] border-b border-[#E4EDE8] text-[#0D1F17] align-middle group-last:border-none">
                                                <div className="flex items-center gap-[12px]">
                                                    <div className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: categoryColors[asset.category] }} />
                                                    <div>
                                                        <div className="font-bold text-[13px] text-[#0D1F17] leading-[1.3]">{asset.name}</div>
                                                        <div className="text-[11px] text-[#8FA99C] mt-[2px]">{asset.category?.replace('_', ' ')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-[14px_20px] text-[13px] border-b border-[#E4EDE8] text-[#0D1F17] align-middle group-last:border-none">
                                                <span className="text-[11px] p-[4px_10px] rounded-full bg-[#E8F5EE] text-[#2D7A4F] font-bold capitalize tracking-[0.02em]">{asset.subType || asset.category}</span>
                                            </td>
                                            <td className="p-[14px_20px] text-[13px] border-b border-[#E4EDE8] text-[#0D1F17] align-middle group-last:border-none font-bold text-right">{formatNumber(asset.currentValue)}</td>
                                            <td className="p-[14px_20px] text-[13px] border-b border-[#E4EDE8] text-[#0D1F17] align-middle group-last:border-none font-medium text-right">{formatNumber(asset.purchasePrice)}</td>
                                            <td className="p-[14px_20px] text-[13px] border-b border-[#E4EDE8] text-[#0D1F17] align-middle group-last:border-none text-right">
                                                <span className={`inline-block text-[11px] font-bold py-[4px] px-[10px] rounded-full whitespace-nowrap ${gain >= 0 ? 'bg-[#E8F5EE] text-[#2D7A4F]' : 'bg-[#FEF2F2] text-[#EF4444]'}`}>
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
                <div className="fixed inset-0 bg-[#0f172a4d] backdrop-blur-[2px] z-[1200]" onClick={() => setSelectedAsset(null)}>
                    <aside className="absolute top-0 right-0 w-[min(420px,92vw)] h-full bg-white border-l border-border-light shadow-[-8px_0_30px_rgba(15,23,42,0.12)] p-[24px] flex flex-col gap-[24px] overflow-y-auto animate-[portfolioAssetDrawerIn_0.22s_ease-out]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start gap-[10px]">
                            <div>
                                <h3 className="text-[15px] font-bold text-[#0D1F17] m-0">{selectedAsset.name}</h3>
                                <p className="mt-[3px] text-[#8FA99C] text-[12.5px] m-0">{selectedAsset.subType || selectedAsset.category?.replace('_', ' ')}</p>
                            </div>
                            <button type="button" className="appearance-none w-[28px] h-[28px] border border-border rounded-[8px] bg-white text-text-secondary flex items-center justify-center cursor-pointer hover:bg-bg" aria-label="Close drawer" onClick={() => setSelectedAsset(null)}>
                                <MdClose />
                            </button>
                        </div>

                        <div className="rounded-[12px] bg-gradient-to-r from-primary to-[#2f9463] text-white p-[24px] flex flex-col gap-[5px]">
                            <span className="opacity-90 text-[11px] tracking-[0.06em] uppercase font-bold">Current Value</span>
                            <strong className="text-[30px] leading-none mb-[4px]">{formatCurrency(selectedAsset.currentValue)}</strong>
                            <small className="w-fit bg-white/12 rounded-full px-[10px] py-[4px] text-[12px] font-bold">
                                {selectedAsset.currentValue >= selectedAsset.purchasePrice ? '+' : '-'}
                                {Math.abs(((selectedAsset.currentValue - selectedAsset.purchasePrice) / (selectedAsset.purchasePrice || 1)) * 100).toFixed(1)}% return
                            </small>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
                            <div className="border border-border-light bg-bg rounded-[8px] p-[10px] flex flex-col gap-[4px]"><span className="text-[10px] uppercase tracking-[0.03em] text-[#8FA99C] font-bold">Purchase Price</span><strong className="text-[#0D1F17] text-[13px] font-bold">{formatCurrency(selectedAsset.purchasePrice)}</strong></div>
                            <div className="border border-border-light bg-bg rounded-[8px] p-[10px] flex flex-col gap-[4px]"><span className="text-[10px] uppercase tracking-[0.03em] text-[#8FA99C] font-bold">Gain / Loss</span><strong className="text-[#0D1F17] text-[13px] font-bold">{formatCurrency(selectedAsset.currentValue - selectedAsset.purchasePrice)}</strong></div>
                            <div className="border border-border-light bg-bg rounded-[8px] p-[10px] flex flex-col gap-[4px]"><span className="text-[10px] uppercase tracking-[0.03em] text-[#8FA99C] font-bold">Category</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedAsset.category?.replace('_', ' ')}</strong></div>
                            <div className="border border-border-light bg-bg rounded-[8px] p-[10px] flex flex-col gap-[4px]"><span className="text-[10px] uppercase tracking-[0.03em] text-[#8FA99C] font-bold">Sub Type</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedAsset.subType || selectedAsset.category?.replace('_', ' ')}</strong></div>
                            <div className="border border-border-light bg-bg rounded-[8px] p-[10px] flex flex-col gap-[4px]"><span className="text-[10px] uppercase tracking-[0.03em] text-[#8FA99C] font-bold">Purchase Date</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedAsset.purchaseDate || 'N/A'}</strong></div>
                            <div className="border border-border-light bg-bg rounded-[8px] p-[10px] flex flex-col gap-[4px]"><span className="text-[10px] uppercase tracking-[0.03em] text-[#8FA99C] font-bold">Liquid Asset</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedAsset.isLiquid ? 'Yes' : 'No'}</strong></div>
                        </div>

                        <footer className="mt-[6px] grid grid-cols-2 gap-[8px]">
                            <button type="button" className="appearance-none rounded-[10px] p-[10px_12px] font-bold text-[13px] border-none bg-[#2D7A4F] text-white cursor-pointer hover:bg-[#25754e]" onClick={handleOpenAssetEdit}>Edit Asset</button>
                            <button type="button" className="appearance-none rounded-[10px] p-[10px_12px] font-bold text-[13px] border border-[#fecaca] bg-[#fff1f2] text-[#e11d48] cursor-pointer hover:bg-[#ffe4e6]" onClick={handleDeleteAsset}>Delete</button>
                        </footer>
                    </aside>
                </div>
            )}

            {/* Liabilities */}
            <div className="flex flex-col gap-[16px]">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[24px]">
                    <div className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-md p-0 overflow-hidden max-md:p-[16px]">
                        {/* Liabilities table header */}
                        <div className="flex items-center justify-between gap-[16px] p-[20px_24px_16px] border-b border-border flex-wrap">
                            <div>
                                <h3 className="text-[15px] font-bold text-[#0D1F17] m-[0_0_3px]">My Liabilities</h3>
                                <p className="text-[12px] text-[#8FA99C] m-0">{filteredLiabilities.length} active loan{filteredLiabilities.length !== 1 ? 's' : ''} &amp; credit lines</p>
                            </div>
                            <div className="flex items-center gap-[10px] flex-wrap">
                                <div className="flex items-center gap-[8px] border border-[#E4EDE8] rounded-[8px] p-[8px_14px] bg-white min-w-[220px] max-md:min-w-full">
                                    <svg className="text-[#8FA99C] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    <input className="border-none outline-none text-[13px] text-[#0D1F17] bg-transparent w-full placeholder:text-[#8FA99C]" type="text" placeholder="Search liabilities..." value={liabilitySearch} onChange={(e) => setLiabilitySearch(e.target.value)} />
                                </div>
                                <select className="border border-[#E4EDE8] rounded-[8px] p-[8px_28px_8px_12px] text-[13px] text-[#0D1F17] bg-white bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2210%22_height=%226%22_viewBox=%220_0_10_6%22%3E%3Cpath_d=%22M1_1l4_4_4-4%22_stroke=%22%236B7280%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-[position:right_10px_center] bg-no-repeat appearance-none cursor-pointer min-w-[140px] max-md:min-w-full" value={liabilityCategoryFilter} onChange={(e) => setLiabilityCategoryFilter(e.target.value)}>
                                    <option value="All">All Types</option>
                                    <option value="Long-term Liabilities">Long-term</option>
                                    <option value="Current Liabilities">Current liabilities</option>
                                </select>
                                <button className="bg-[#2D7A4F] text-white border-none px-[16px] py-[8px] rounded-[6px] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[#256341]" onClick={() => navigate('/my-liabilities')}>View More</button>
                            </div>
                        </div>

                        {/* Scrollable table */}
                        <div className="overflow-auto h-[220px] scrollbar-thin scrollbar-thumb-[#D1D5DB] scrollbar-track-transparent">
                            <table className="w-full min-w-[700px] border-collapse">
                                <thead className="sticky top-0 z-[5] bg-[#F7F9F8]">
                                    <tr>
                                        <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8]">Liability</th>
                                        <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8]">Lender</th>
                                        <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8] text-right">Outstanding (₹)</th>
                                        <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8] text-right">EMI / Month (₹)</th>
                                        <th className="text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#183325] p-[12px_20px] border-b border-[#E4EDE8]">Interest Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLiabilities.map(l => {
                                        const rateColor = l.interestRate >= 30 ? 'bg-[#FEF2F2] text-[#EF4444]' : l.interestRate >= 15 ? 'bg-[#FFFBEB] text-[#F59E0B]' : 'bg-[#ECFDF5] text-[#10B981]';
                                        return (
                                            <tr key={l.id} className="cursor-pointer hover:bg-[#F9FAFB] group" onClick={() => setSelectedLiabilityId(l.id)}>
                                                <td className="p-[14px_20px] text-[13px] border-b border-[#E4EDE8] text-[#0D1F17] align-middle group-last:border-none">
                                                    <div className="flex items-center gap-[12px]">
                                                        <div className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: l.interestRate >= 30 ? '#EF4444' : l.interestRate >= 15 ? '#F59E0B' : '#3B82F6' }} />
                                                        <div>
                                                            <div className="font-bold text-[13px] text-[#0D1F17] leading-[1.3]">{l.name}</div>
                                                            <div className="text-[11px] text-[#8FA99C] mt-[2px]">{l.lender} · {l.type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-[14px_20px] font-bold text-[13px] border-b border-[#E4EDE8] text-[#0D1F17] align-middle group-last:border-none">{l.lender}</td>
                                                <td className="p-[14px_20px] font-bold text-[13px] border-b border-[#E4EDE8] text-[#EF4444] align-middle group-last:border-none text-right">{formatNumber(l.currentBalance)}</td>
                                                <td className="p-[14px_20px] font-bold text-[13px] border-b border-[#E4EDE8] text-[#0D1F17] align-middle group-last:border-none text-right">{formatNumber(l.monthlyPayment)}</td>
                                                <td className="p-[14px_20px] border-b border-[#E4EDE8] text-[#0D1F17] align-middle group-last:border-none">
                                                    <span className={`inline-block text-[11px] font-bold py-[4px] px-[10px] rounded-full whitespace-nowrap ${rateColor}`}>{l.interestRate}% p.a.</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center p-[14px_24px] border-t border-[#E4EDE8] bg-[#F7F9F8] rounded-b-[16px]">
                            <span className="text-[12px] text-[#8FA99C]">Total monthly EMI obligation</span>
                            <span className="text-[15px] font-bold text-[#0D1F17] tracking-tight">{formatCurrency(totalMonthlyEMI)} / month</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[14px] border border-[#E4EDE8] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] max-md:p-[16px] transition-shadow duration-200 hover:shadow-md">
                        <h4 className="font-bold text-[15px] text-[#0D1F17]">Liability Allocation</h4>
                        <br />
                        <DonutChart
                            data={liabilityAllocation}
                            height={260}
                            innerR={50}
                            outerR={80}
                            hideLabels
                            colors={liabilityAllocation.map(l => l.color)}
                            tooltipFmt={(val) => formatCurrency(val)}
                            centerLabel={totalLiabilities >= 10000000 ? `₹${(totalLiabilities / 10000000).toFixed(1)}Cr` : `₹${(totalLiabilities / 100000).toFixed(1)}L`}
                            centerSub="Total Liabilities"
                        />
                    </div>
                </div>
            </div>

            {selectedLiability && selectedLiabilityDetails && (
                <div className="fixed inset-0 bg-[#0f172a4d] backdrop-blur-[2px] z-[1200] flex justify-end" onClick={() => setSelectedLiabilityId(null)}>
                    <aside className="absolute top-0 right-0 w-[min(420px,100%)] h-full bg-white border-l border-[#e2e8f0] shadow-[-10px_0_24px_rgba(15,23,42,0.12)] flex flex-col gap-[20px] p-[24px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <header className="flex justify-between items-start gap-[8px] sticky top-0 bg-white z-[2] pb-[16px] border-b border-[#eef2f5]">
                            <div className="inline-flex items-center gap-[12px]">
                                <span className="w-[36px] h-[36px] rounded-[8px] bg-[#edf2ff] text-[#3b82f6] inline-flex items-center justify-center text-[20px]" aria-hidden="true">{ICONS.creditCard}</span>
                                <div>
                                    <h4 className="text-[#0D1F17] text-[15px] font-bold m-0 leading-tight">{selectedLiability.name}</h4>
                                    <p className="text-[#8FA99C] text-[12px] mt-[4px] m-0 font-medium">{selectedLiability.lender} · {selectedLiability.interestRate}% p.a.</p>
                                </div>
                            </div>
                            <button type="button" className="appearance-none border-none bg-[#f1f5f9] text-[#6b7280] w-[32px] h-[32px] rounded-[8px] inline-flex items-center justify-center cursor-pointer hover:bg-[#e2e8f0] transition-colors" onClick={() => setSelectedLiabilityId(null)} aria-label="Close details">
                                <MdClose size={18} />
                            </button>
                        </header>

                        <section className="bg-[#fee2e2] border border-[#fecaca] rounded-[16px] p-[20px] flex flex-col gap-[8px]">
                            <span className="text-[#111827] text-[11px] uppercase tracking-[1px] font-bold mb-[2px]">Outstanding Balance</span>
                            <strong className="text-[#111827] text-[28px] leading-none font-bold mb-[4px]">{formatCurrency(selectedLiability.outstanding)}</strong>
                            <p className="text-[#1f2937] text-[12px] font-bold m-0 mb-[8px]">
                                Original: {formatCurrency(selectedLiability.principal)} · {selectedLiability.repaidPct.toFixed(0)}% repaid
                            </p>
                            <div className="w-full h-[8px] rounded-full bg-[#fecaca] overflow-hidden mt-[2px] mb-[6px]">
                                <div className="h-full bg-[#ef4444] rounded-full" style={{ width: `${Math.min(100, Math.max(0, selectedLiability.repaidPct))}%` }} />
                            </div>
                            <div className="flex justify-between gap-[8px] mt-[2px]">
                                <small className="text-[#1f2937] text-[11px] font-bold">Paid {formatCurrency(selectedLiabilityDetails.paidAmount)}</small>
                                <small className="text-[#1f2937] text-[11px] font-bold">Remaining {formatCurrency(selectedLiability.outstanding)}</small>
                            </div>
                        </section>

                        <section className="flex flex-col gap-[12px] mt-[8px]">
                            <h5 className="text-[#8FA99C] text-[11px] font-bold uppercase tracking-[1px] m-0 mb-[4px]">Loan Details</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] max-w-full">
                                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">EMI / Month</span><strong className="text-[#0D1F17] text-[13px] font-bold">{formatCurrency(selectedLiability.monthlyPayment)}</strong></div>
                                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Interest Rate</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedLiability.interestRate}% p.a.</strong></div>
                                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Tenure Left</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedLiability.tenureLeft} months</strong></div>
                                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Loan End Date</span><strong className="text-[#0D1F17] text-[13px] font-bold">{formatMonthYear(selectedLiability.maturityDate)}</strong></div>
                                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Total Interest</span><strong className="text-[#0D1F17] text-[13px] font-bold">{formatCurrency(selectedLiabilityDetails.totalInterest)}</strong></div>
                                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Guarantor</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedLiability.isGuarantor ? 'Yes' : 'None'}</strong></div>
                            </div>
                        </section>

                        <footer className="mt-auto pt-[20px] grid grid-cols-2 gap-[12px]">
                            <button type="button" className="appearance-none rounded-[12px] p-[12px] font-bold text-[13px] border border-transparent bg-[#2D7A4F] text-white cursor-pointer hover:bg-[#25754e] transition-colors" onClick={handleOpenLiabilityEdit}>Edit Loan</button>
                            <button type="button" className="appearance-none rounded-[12px] p-[12px] font-bold text-[13px] border border-[#fecaca] bg-[#fff1f2] text-[#e11d48] cursor-pointer hover:bg-[#ffe4e6] transition-colors" onClick={handleDeleteLiability}>Delete</button>
                        </footer>
                    </aside>
                </div>
            )}

            {/* Modals */}
            <Modal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} title="Add New Asset">
                <form className="grid gap-[16px]" onSubmit={handleAddAsset}>
                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Asset Category *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdOutlineCategory className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <select className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent appearance-none cursor-pointer" name="assetCategory" required>
                                <option value="" disabled selected>Select Category</option>
                                <option value="savings">Savings</option>
                                <option value="investments">Investments</option>
                                <option value="real_estate">Real Estate</option>
                                <option value="vehicles">Vehicles</option>
                                <option value="retirement">Retirement</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Asset Name *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <span className="px-[12px] text-[#8FA99C] shrink-0 text-[14px]">T</span>
                            <input className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent" type="text" name="assetName" placeholder="e.g. HDFC Savings Account" required />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Current Value (₹) *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdAttachMoney className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent" type="number" name="currentValue" placeholder="0" required />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[0.85rem] font-medium text-text-secondary">Purchase Price (₹)</label>
                        <div className="relative flex items-center border border-border rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdShowChart className="px-[12px] text-text-muted shrink-0" size={38} />
                            <input className="w-full border-none outline-none py-[10px] px-[4px] text-[0.9rem] bg-transparent" type="number" name="purchasePrice" placeholder="0" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-[12px] mt-[24px]">
                        <button type="button" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]" onClick={() => setIsAssetModalOpen(false)}>Cancel</button>
                        <button type="submit" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#2D7A4F] text-white hover:bg-[#256341] shadow-sm">Add Asset</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isLiabilityModalOpen} onClose={() => setIsLiabilityModalOpen(false)} title="Add New Liability">
                <form className="grid gap-[16px]" onSubmit={handleAddLiability}>
                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Liability Name *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <span className="px-[12px] text-[#8FA99C] shrink-0 text-[14px]">T</span>
                            <input className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent" type="text" name="liabilityName" placeholder="e.g. Home Loan - SBI" required />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Liability Type *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdHome className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <select className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent appearance-none cursor-pointer" name="liabilityType" required>
                                <option value="" disabled selected>Select Type</option>
                                <option value="Long-term Liabilities">Long-term Liabilities</option>
                                <option value="Current Liabilities">Current Liabilities</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-[8px] px-[4px]">
                        <label className="text-[12px] font-bold text-[#0D1F17]">Are you a Guarantor?</label>
                        <input type="checkbox" name="isGuarantor" className="w-[18px] h-[18px] accent-[#2D7A4F] cursor-pointer" />
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Lender Name</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdBusiness className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent" type="text" name="lenderName" placeholder="e.g. HDFC Bank" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Principal Amount (₹) *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdAttachMoney className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent" type="number" name="principalAmount" placeholder="0" required />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Current Outstanding Balance (₹) *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdAttachMoney className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent" type="number" name="currentBalance" placeholder="0" required />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[0.85rem] font-medium text-text-secondary">Interest Rate (% p.a.)</label>
                        <div className="relative flex items-center border border-border rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <span className="px-[12px] text-text-muted shrink-0 text-[14px] font-bold">%</span>
                            <input className="w-full border-none outline-none py-[10px] px-[4px] text-[0.9rem] bg-transparent" type="number" step="0.1" name="interestRate" placeholder="0.0" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-[12px] mt-[24px]">
                        <button type="button" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]" onClick={() => setIsLiabilityModalOpen(false)}>Cancel</button>
                        <button type="submit" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#2D7A4F] text-white hover:bg-[#256341] shadow-sm">Add Liability</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isLiabilityEditModalOpen} onClose={() => setIsLiabilityEditModalOpen(false)} title="Edit Liability">
                <form className="grid gap-[16px]" onSubmit={handleEditLiabilitySubmit}>
                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Liability Name *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <span className="px-[12px] text-[#8FA99C] shrink-0 text-[14px]">T</span>
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="text"
                                value={liabilityEditForm.name}
                                onChange={(e) => setLiabilityEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Home Loan - SBI"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Liability Type *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdHome className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <select
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent appearance-none cursor-pointer"
                                value={liabilityEditForm.type}
                                onChange={(e) => setLiabilityEditForm((prev) => ({ ...prev, type: e.target.value }))}
                                required
                            >
                                <option value="Long-term Liabilities">Long-term Liabilities</option>
                                <option value="Current Liabilities">Current Liabilities</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Lender Name</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdBusiness className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="text"
                                value={liabilityEditForm.lender}
                                onChange={(e) => setLiabilityEditForm((prev) => ({ ...prev, lender: e.target.value }))}
                                placeholder="e.g. HDFC Bank"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Principal Amount (₹) *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdAttachMoney className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="number"
                                min="0"
                                value={liabilityEditForm.principalAmount}
                                onChange={(e) => setLiabilityEditForm((prev) => ({ ...prev, principalAmount: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Current Outstanding Balance (₹) *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdAttachMoney className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="number"
                                min="0"
                                value={liabilityEditForm.currentBalance}
                                onChange={(e) => setLiabilityEditForm((prev) => ({ ...prev, currentBalance: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">EMI / Month (₹) *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdAttachMoney className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="number"
                                min="0"
                                value={liabilityEditForm.monthlyPayment}
                                onChange={(e) => setLiabilityEditForm((prev) => ({ ...prev, monthlyPayment: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Interest Rate (% p.a.)</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <span className="px-[12px] text-[#8FA99C] shrink-0 text-[14px] font-bold">%</span>
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="number"
                                step="0.1"
                                min="0"
                                value={liabilityEditForm.interestRate}
                                onChange={(e) => setLiabilityEditForm((prev) => ({ ...prev, interestRate: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[0.85rem] font-medium text-text-secondary">Maturity Date</label>
                        <div className="relative flex items-center border border-border rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdCalendarToday className="px-[12px] text-text-muted shrink-0" size={14} />
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[0.9rem] bg-transparent"
                                type="date"
                                value={liabilityEditForm.maturityDate || ''}
                                onChange={(e) => setLiabilityEditForm((prev) => ({ ...prev, maturityDate: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-[8px] px-[4px]">
                        <label className="text-[0.85rem] font-medium text-text-secondary">Are you a Guarantor?</label>
                        <input
                            type="checkbox"
                            checked={liabilityEditForm.isGuarantor}
                            onChange={(e) => setLiabilityEditForm((prev) => ({ ...prev, isGuarantor: e.target.checked }))}
                            className="w-[20px] h-[20px] accent-primary"
                        />
                    </div>

                    <div className="flex justify-end gap-[12px] mt-[24px]">
                        <button type="button" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]" onClick={() => setIsLiabilityEditModalOpen(false)}>Cancel</button>
                        <button type="submit" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#2D7A4F] text-white hover:bg-[#256341] shadow-sm">Save Changes</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isAssetEditModalOpen} onClose={() => setIsAssetEditModalOpen(false)} title="Edit Asset">
                <form className="grid gap-[16px]" onSubmit={handleEditAssetSubmit}>
                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Asset Name *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <span className="px-[12px] text-[#8FA99C] shrink-0 text-[14px]">T</span>
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="text"
                                value={assetEditForm.name}
                                onChange={(e) => setAssetEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Asset Category *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdOutlineCategory className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <select
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent appearance-none cursor-pointer"
                                value={assetEditForm.category}
                                onChange={(e) => setAssetEditForm((prev) => ({ ...prev, category: e.target.value }))}
                                required
                            >
                                <option value="savings">Savings</option>
                                <option value="investments">Investments</option>
                                <option value="real_estate">Real Estate</option>
                                <option value="vehicles">Vehicles</option>
                                <option value="retirement">Retirement</option>
                                <option value="crypto">Crypto</option>
                                <option value="personal_property">Personal Property</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Sub Type</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <span className="px-[12px] text-[#8FA99C] shrink-0 text-[14px]">T</span>
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="text"
                                value={assetEditForm.subType}
                                onChange={(e) => setAssetEditForm((prev) => ({ ...prev, subType: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Current Value (₹) *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdAttachMoney className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="number"
                                min="0"
                                value={assetEditForm.currentValue}
                                onChange={(e) => setAssetEditForm((prev) => ({ ...prev, currentValue: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Purchase Price (₹) *</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdShowChart className="px-[12px] text-[#8FA99C] shrink-0" size={38} />
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="number"
                                min="0"
                                value={assetEditForm.purchasePrice}
                                onChange={(e) => setAssetEditForm((prev) => ({ ...prev, purchasePrice: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Purchase Date</label>
                        <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                            <MdCalendarToday className="px-[12px] text-[#8FA99C] shrink-0" size={14} />
                            <input
                                className="w-full border-none outline-none py-[10px] px-[4px] text-[13px] text-[#0D1F17] bg-transparent"
                                type="date"
                                value={assetEditForm.purchaseDate || ''}
                                onChange={(e) => setAssetEditForm((prev) => ({ ...prev, purchaseDate: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-[8px] px-[4px]">
                        <label className="text-[12px] font-bold text-[#0D1F17]">Is Liquid Asset?</label>
                        <input
                            type="checkbox"
                            checked={assetEditForm.isLiquid}
                            onChange={(e) => setAssetEditForm((prev) => ({ ...prev, isLiquid: e.target.checked }))}
                            className="w-[18px] h-[18px] accent-[#2D7A4F] cursor-pointer"
                        />
                    </div>

                    <div className="flex justify-end gap-[12px] mt-[24px]">
                        <button type="button" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]" onClick={() => setIsAssetEditModalOpen(false)}>Cancel</button>
                        <button type="submit" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#2D7A4F] text-white hover:bg-[#256341] shadow-sm">Save Changes</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
