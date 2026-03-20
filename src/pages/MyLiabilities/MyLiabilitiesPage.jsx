import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdOutlineCreditCard,
  MdPayments,
  MdPieChart,
  MdAccountBalance,
  MdCalendarToday,
  MdKeyboardArrowRight,
  MdSearch,
  MdFilterList,
  MdSort,
  MdClose,
} from 'react-icons/md';
import { liabilities, userData } from '../../data/mockData';
import DonutChart from '../../components/Charts/DonutChart';
import Modal from '../../components/common/Modal';
import KPICard from '../../components/common/KPICard';
import { ICONS } from '../../utils/icons';


function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatAmount(value) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompactCurrency(value) {
  const amount = Number(value) || 0;

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1).replace('.0', '')}Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1).replace('.0', '')}L`;
  }

  return `₹${formatAmount(amount)}`;
}

function formatMonthYear(dateStr) {
  if (!dateStr) {
    return 'N/A';
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function monthDiff(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

function getLoanIcon(loan) {
  const source = `${loan?.name || ''} ${loan?.subType || ''}`.toLowerCase();
  if (source.includes('car')) return ICONS.Vehicle;
  if (source.includes('education') || source.includes('student')) return ICONS.Education;
  if (source.includes('credit')) return ICONS.creditCard;
  return ICONS.briefcase;
}

function getLoanTypeChip(subType) {
  const value = String(subType || '').toLowerCase();
  if (value.includes('car')) return 'Car Loan';
  if (value.includes('student') || value.includes('education')) return 'Student';
  if (value.includes('credit')) return 'Credit';
  return 'Loan';
}

export default function MyLiabilitiesPage() {
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState('avalanche');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('outstanding_desc');
  const [localLiabilities, setLocalLiabilities] = useState(() => [...liabilities]);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    lender: '',
    type: 'Long-term Liabilities',
    subType: '',
    principalAmount: '',
    currentBalance: '',
    monthlyPayment: '',
    interestRate: '',
    maturityDate: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    lender: '',
    subType: '',
    principalAmount: '',
    currentBalance: '',
    monthlyPayment: '',
    interestRate: '',
    maturityDate: '',
  });
  const drawerRef = useRef(null);

  useEffect(() => {
    if (selectedLoanId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedLoanId]);

  useEffect(() => {
    if (selectedLoanId && drawerRef.current) {
      drawerRef.current.scrollTop = 0;
    }
  }, [selectedLoanId]);

  const loanRows = useMemo(() => {
    return localLiabilities
      .filter((loan) => loan.isActive)
      .map((loan) => {
        const principal = Number(loan.principalAmount || 0);
        const outstanding = Number(loan.currentBalance || 0);
        const monthlyPayment = Number(loan.monthlyPayment || 0);
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
          typeChip: getLoanTypeChip(loan.subType),
          iconNode: getLoanIcon(loan),
        };
      });
  }, [localLiabilities]);

  const selectedLoan = useMemo(
    () => loanRows.find((loan) => String(loan.id) === String(selectedLoanId)) || null,
    [selectedLoanId, loanRows]
  );

  const totals = useMemo(() => {
    const totalOutstanding = loanRows.reduce((sum, loan) => sum + loan.outstanding, 0);
    const totalPrincipal = loanRows.reduce((sum, loan) => sum + loan.principal, 0);
    const totalPaid = Math.max(totalPrincipal - totalOutstanding, 0);
    const monthlyEmi = loanRows.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    const avgRate = loanRows.length
      ? loanRows.reduce((sum, loan) => sum + (Number(loan.interestRate) || 0), 0) / loanRows.length
      : 0;

    const monthlyIncome = Number(userData.monthlyIncome || (userData.annualIncome ? userData.annualIncome / 12 : 0));
    const debtToIncome = monthlyIncome ? (monthlyEmi / monthlyIncome) * 100 : 0;

    return {
      totalOutstanding,
      totalPrincipal,
      totalPaid,
      monthlyEmi,
      avgRate,
      debtToIncome,
    };
  }, [loanRows]);

  const interestBurden = useMemo(() => {
    return loanRows.map((loan) => {
      const annualInterest = loan.outstanding * ((Number(loan.interestRate) || 0) / 100);
      return {
        id: loan.id,
        name: loan.subType || loan.name,
        annualInterest,
      };
    });
  }, [loanRows]);

  const totalInterest = interestBurden.reduce((sum, row) => sum + row.annualInterest, 0);
  const monthlyInterest = totalInterest / 12;
  const monthlyPrincipal = Math.max(totals.monthlyEmi - monthlyInterest, 0);

  const orderedLoans = useMemo(() => {
    const sorted = [...loanRows].sort((a, b) => {
      if (strategy === 'avalanche') {
        return b.interestRate - a.interestRate;
      }
      return a.outstanding - b.outstanding;
    });

    return sorted;
  }, [loanRows, strategy]);

  const projectedMonths = orderedLoans.reduce((sum, loan) => sum + loan.tenureLeft, 0);

  const liabilityAllocationData = useMemo(() => {
    const colorByType = {
      home: '#3B82F6',
      education: '#8B5CF6',
      car: '#06B6D4',
      gold: '#F59E0B',
      consumer: '#10B981',
      personal: '#F97316',
      credit: '#EF4444',
      other: '#64748B',
    };

    const normalizeType = (loan) => {
      const source = String(loan.subType || loan.name || '').toLowerCase();
      if (source.includes('home')) return { key: 'home', label: 'Home Loan' };
      if (source.includes('education') || source.includes('student')) return { key: 'education', label: 'Education Loan' };
      if (source.includes('gold')) return { key: 'gold', label: 'Gold Loan' };
      if (source.includes('consumer')) return { key: 'consumer', label: 'Consumer Loan' };
      if (source.includes('car')) return { key: 'car', label: 'Car Loan' };
      if (source.includes('credit')) return { key: 'credit', label: 'Credit Card' };
      if (source.includes('personal')) return { key: 'personal', label: 'Personal Loan' };
      return { key: 'other', label: loan.subType || 'Other Loan' };
    };

    const grouped = loanRows.reduce((acc, loan) => {
      const { key, label } = normalizeType(loan);

      if (!acc[key]) {
        acc[key] = {
          name: label,
          value: 0,
          color: colorByType[key] || colorByType.other,
        };
      }

      acc[key].value += loan.outstanding;
      return acc;
    }, {});

    return Object.values(grouped)
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [loanRows]);

  const liabilityAllocationRows = useMemo(() => {
    const total = liabilityAllocationData.reduce((sum, row) => sum + row.value, 0);
    if (!total) {
      return [];
    }

    return liabilityAllocationData.map((row) => ({
      ...row,
      percent: (row.value / total) * 100,
    }));
  }, [liabilityAllocationData]);

  const getFilterKey = (loan) => {
    const type = String(loan.type || '').toLowerCase();
    return type.includes('current') ? 'current' : 'long_term';
  };

  const filterMeta = {
    all: { label: 'All Liabilities', color: '#2f9463' },
    long_term: { label: 'Long-term', color: '#3b82f6' },
    current: { label: 'Current', color: '#f59e0b' },
  };

  const filterCounts = useMemo(() => {
    const counts = loanRows.reduce(
      (acc, loan) => {
        const key = getFilterKey(loan);
        acc[key] += 1;
        return acc;
      },
      { all: loanRows.length, long_term: 0, current: 0 }
    );

    return counts;
  }, [loanRows]);

  const filteredLoanRows = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    let rows = loanRows.filter((loan) => {
      const inSearch =
        !search ||
        loan.name.toLowerCase().includes(search) ||
        String(loan.lender || '').toLowerCase().includes(search) ||
        String(loan.subType || '').toLowerCase().includes(search);
      const inType = typeFilter === 'all' || getFilterKey(loan) === typeFilter;
      return inSearch && inType;
    });

    rows = [...rows].sort((a, b) => {
      if (sortBy === 'outstanding_asc') return a.outstanding - b.outstanding;
      if (sortBy === 'emi_desc') return b.monthlyPayment - a.monthlyPayment;
      if (sortBy === 'rate_desc') return b.interestRate - a.interestRate;
      if (sortBy === 'tenure_asc') return a.tenureLeft - b.tenureLeft;
      return b.outstanding - a.outstanding;
    });

    return rows;
  }, [loanRows, searchTerm, typeFilter, sortBy]);

  const selectedLoanDetails = useMemo(() => {
    if (!selectedLoan) {
      return null;
    }

    const paidAmount = Math.max(selectedLoan.principal - selectedLoan.outstanding, 0);
    const monthlyInterest = (selectedLoan.outstanding * (Number(selectedLoan.interestRate) || 0)) / 1200;
    const principalComponent = Math.max(selectedLoan.monthlyPayment - monthlyInterest, 0);
    const totalInterest = Math.max((selectedLoan.monthlyPayment * selectedLoan.tenureLeft) - selectedLoan.outstanding, 0);

    return {
      paidAmount,
      monthlyInterest,
      principalComponent,
      totalInterest,
    };
  }, [selectedLoan]);

  const openEditModal = () => {
    if (!selectedLoan) {
      return;
    }

    setEditForm({
      name: selectedLoan.name || '',
      lender: selectedLoan.lender || '',
      subType: selectedLoan.subType || '',
      principalAmount: String(selectedLoan.principal || selectedLoan.principalAmount || 0),
      currentBalance: String(selectedLoan.outstanding || selectedLoan.currentBalance || 0),
      monthlyPayment: String(selectedLoan.monthlyPayment || 0),
      interestRate: String(selectedLoan.interestRate || 0),
      maturityDate: selectedLoan.maturityDate || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedLoan) {
      return;
    }

    const updated = {
      name: editForm.name.trim(),
      lender: editForm.lender.trim(),
      subType: editForm.subType.trim(),
      principalAmount: Number(editForm.principalAmount),
      currentBalance: Number(editForm.currentBalance),
      monthlyPayment: Number(editForm.monthlyPayment),
      interestRate: Number(editForm.interestRate),
      maturityDate: editForm.maturityDate,
    };

    if (!updated.name || Number.isNaN(updated.currentBalance) || Number.isNaN(updated.monthlyPayment)) {
      return;
    }

    setLocalLiabilities((prev) => prev.map((loan) => (
      String(loan.id) === String(selectedLoan.id)
        ? {
          ...loan,
          ...updated,
        }
        : loan
    )));

    setIsEditModalOpen(false);
  };

  const handleDeleteLoan = () => {
    if (!selectedLoan) {
      return;
    }

    const confirmed = window.confirm(`Delete ${selectedLoan.name} from liabilities?`);
    if (!confirmed) {
      return;
    }

    setLocalLiabilities((prev) => prev.filter((loan) => String(loan.id) !== String(selectedLoan.id)));
    setSelectedLoanId(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const nextId = localLiabilities.reduce((max, loan) => {
      const id = Number(loan.id);
      return Number.isNaN(id) ? max : Math.max(max, id);
    }, 0) + 1;

    const newLoan = {
      id: nextId,
      name: addForm.name.trim(),
      lender: addForm.lender.trim() || 'Unknown Lender',
      type: addForm.type,
      subType: addForm.subType.trim() || 'Loan',
      principalAmount: Number(addForm.principalAmount),
      currentBalance: Number(addForm.currentBalance),
      monthlyPayment: Number(addForm.monthlyPayment),
      interestRate: Number(addForm.interestRate) || 0,
      startDate: new Date().toISOString().slice(0, 10),
      maturityDate: addForm.maturityDate || null,
      isActive: true,
    };

    if (!newLoan.name || Number.isNaN(newLoan.currentBalance) || Number.isNaN(newLoan.monthlyPayment)) {
      return;
    }

    setLocalLiabilities((prev) => [...prev, newLoan]);
    setIsAddModalOpen(false);
    setAddForm({
      name: '',
      lender: '',
      type: 'Long-term Liabilities',
      subType: '',
      principalAmount: '',
      currentBalance: '',
      monthlyPayment: '',
      interestRate: '',
      maturityDate: '',
    });
  };

  return (
    <div className="grid gap-md">
      <section className="">
        <div className="flex justify-between items-start">
          <div className="">
            <h2 className="text-[22px] font-bold text-[#0D1F17]">My Liabilities</h2>

            <div className="mt-[4px] inline-flex gap-2 items-center text-[12.5px] text-[#8FA99C] font-medium">
              <button type="button" className="appearance-none border-none bg-transparent text-[#8FA99C] font-inherit cursor-pointer p-0 hover:text-[#2D7A4F]" onClick={() => navigate('/portfolio')}>
                Portfolio
              </button>
              <MdKeyboardArrowRight size={12} />
              <span className="text-[#2D7A4F] font-bold">My Liabilities</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-[8px] mt-2 lg:mt-0">
            <button type="button" className="bg-white text-[#0D1F17] border border-[#E4EDE8] px-4 py-2 rounded-md text-[13px] font-bold hover:bg-[#F8FAF9]" onClick={() => navigate('/portfolio')}>
              View Portfolio
            </button>
            <button type="button" className="bg-[#2D7A4F] text-white border-none px-4 py-2 rounded-md text-[13px] font-bold hover:bg-[#256341]" onClick={() => setIsAddModalOpen(true)}>
              + Add Liability
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mt-md">
          <KPICard
            label="Total Outstanding"
            value={formatCurrency(totals.totalOutstanding)}
            icon={<MdOutlineCreditCard />}

            valueColor="text-[#ef4444]"
            iconBg="bg-[#fef2f2]"
            iconColor="text-[#ef4444]"
            badge={<span className="text-[11px] font-bold px-[8px] py-[3px] rounded-full bg-[#fef2f2] text-[#ef4444]">{loanRows.length} active loans</span>}
            subText="Current total debt balance"
          />

          <KPICard
            label="Monthly EMI"
            value={formatCurrency(totals.monthlyEmi)}
            icon={<MdPayments />}
            iconBg="bg-[#fffbeb]"
            iconColor="text-[#f59e0b]"
            badge={<span className="text-[11px] font-bold px-[8px] py-[3px] rounded-full bg-[#f8faf9] text-[#0D1F17]">Due every month</span>}
            subText="Total recurring obligation"
          />

          <KPICard
            label="Debt-to-Income"
            value={`${totals.debtToIncome.toFixed(1)}%`}
            icon={<MdPieChart />}
            iconBg="bg-[#eff6ff]"
            iconColor="text-[#3b82f6]"
            badge={
              <span className={`text-[11px] font-bold px-[8px] py-[3px] rounded-full ${totals.debtToIncome <= 36 ? 'bg-[#f0fdf4] text-[#16a34a]' : 'bg-[#eff6ff] text-[#3b82f6]'}`}>
                {totals.debtToIncome <= 36 ? 'Healthy ratio' : 'Above healthy range'}
              </span>
            }
            subText="Recommended under 36%"
          />

          <KPICard
            label="Total Paid So Far"
            value={formatCurrency(totals.totalPaid)}
            icon={<MdAccountBalance />}
            valueColor="text-[#10b981]"
            iconBg="bg-[#ecfdf5]"
            iconColor="text-[#10b981]"
            badge={<span className="text-[11px] font-bold px-[8px] py-[3px] rounded-full bg-[#f1fcf7] text-[#10b981]">Of {formatCurrency(totals.totalPrincipal)}</span>}
            subText="Principal repaid till date"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] gap-[10px] items-start mt-md">
        <div className="grid gap-[10px]">
          <article className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-md p-0 overflow-hidden h-[500px] flex flex-col">
            <div className="border-b border-border p-[14px] flex justify-between items-center gap-[10px] flex-wrap">
              <div>
                <h3 className="text-[15px] font-bold text-[#0D1F17] m-0">Active Loans</h3>
                <p className="text-[12px] text-[#8FA99C] mt-[2px] mb-0">{filteredLoanRows.length} loans shown</p>
              </div>

              <div className="flex gap-[8px] items-center flex-wrap">
                <div className="min-w-[220px] inline-flex items-center gap-[8px] border border-[#E4EDE8] rounded-md bg-white px-[10px] py-[6px] text-[#8FA99C]">
                  <MdSearch />
                  <input
                    type="text"
                    placeholder="Search liabilities..."
                    className="border-none w-full bg-transparent text-[#0D1F17] text-[13px] focus:outline-none p-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <label className="inline-flex items-center gap-[6px] border border-[#E4EDE8] rounded-md bg-white px-[10px] text-[#8FA99C]">
                  <MdFilterList />
                  <select className="border-none bg-transparent text-[#0D1F17] text-[13px] py-[6px] px-[4px] focus:outline-none cursor-pointer" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="long_term">Long-term</option>
                    <option value="current">Current</option>
                  </select>
                </label>

                <label className="inline-flex items-center gap-[6px] border border-[#E4EDE8] rounded-md bg-white px-[10px] text-[#8FA99C]">
                  <MdSort />
                  <select className="border-none bg-transparent text-[#0D1F17] text-[13px] py-[8px] px-[4px] focus:outline-none cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="outstanding_desc">Outstanding: High to Low</option>
                    <option value="outstanding_asc">Outstanding: Low to High</option>
                    <option value="emi_desc">EMI: High to Low</option>
                    <option value="rate_desc">Rate: High to Low</option>
                    <option value="tenure_asc">Tenure: Short to Long</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="flex gap-[8px] overflow-x-auto px-[14px] py-[10px] border-b border-[#F0FAF5] whitespace-nowrap scrollbar-hide">
              {Object.keys(filterMeta).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`border border-[#E4EDE8] rounded-full px-[12px] py-[6px] text-[12px] inline-flex items-center gap-[6px] transition-all cursor-pointer ${typeFilter === key ? 'bg-[#EBF5F0] border-[#2D7A4F] text-[#2D7A4F] font-bold' : 'bg-[#F8FAF9] text-[#8FA99C] hover:bg-[#EBF5F0]'}`}
                  onClick={() => setTypeFilter(key)}
                >
                  <span className="w-[7px] h-[7px] rounded-full" style={{ background: filterMeta[key].color }} />
                  {filterMeta[key].label}
                  <span className={`rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center text-[10px] font-bold px-[5px] ${typeFilter === key ? 'bg-[#2D7A4F] text-white' : 'bg-[#E4EDE8] text-[#8FA99C]'}`}>{filterCounts[key]}</span>
                </button>
              ))}
            </div>

            <div className="overflow-auto flex-1 min-h-0">
              <table className="w-full border-collapse min-w-[940px]">
                <thead>
                  <tr>
                    <th className="text-left text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.8px] border-b border-[#E4EDE8] px-[14px] py-[10px] whitespace-nowrap sticky top-0 z-[5] bg-[#f7f9f8]">Loan</th>
                    <th className="text-left text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.8px] border-b border-[#E4EDE8] px-[14px] py-[10px] whitespace-nowrap sticky top-0 z-[5] bg-[#f7f9f8]">Type</th>
                    <th className="text-right text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.8px] border-b border-[#E4EDE8] px-[14px] py-[10px] whitespace-nowrap sticky top-0 z-[5] bg-[#f7f9f8]">Outstanding (₹)</th>
                    <th className="text-right text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.8px] border-b border-[#E4EDE8] px-[14px] py-[10px] whitespace-nowrap sticky top-0 z-[5] bg-[#f7f9f8]">EMI / Month (₹)</th>
                    <th className="text-left text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.8px] border-b border-[#E4EDE8] px-[14px] py-[10px] whitespace-nowrap sticky top-0 z-[5] bg-[#f7f9f8]">Rate</th>
                    <th className="text-left text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.8px] border-b border-[#E4EDE8] px-[14px] py-[10px] whitespace-nowrap sticky top-0 z-[5] bg-[#f7f9f8]">Repaid</th>
                    <th className="text-right text-[#8FA99C] text-[11px] font-bold uppercase tracking-[0.8px] border-b border-[#E4EDE8] px-[14px] py-[10px] whitespace-nowrap sticky top-0 z-[5] bg-[#f7f9f8]">Tenure Left</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoanRows.map((loan) => {
                    return (
                      <tr key={loan.id} className="cursor-pointer hover:bg-[#f8faf9]" onClick={() => setSelectedLoanId(loan.id)}>
                        <td className="border-b border-[#F0FAF5] px-[14px] py-[10px] align-middle">
                          <div className="inline-flex items-center gap-[10px]">
                            <div className="w-[28px] h-[28px] rounded-lg bg-[#f2f6f4] text-[#2f9463] inline-flex items-center justify-center">{loan.iconNode}</div>
                            <div>
                              <div className="text-[#0D1F17] text-[13px] font-bold">{loan.name}</div>
                              <div className="text-[#8FA99C] text-[11px]">{loan.lender}</div>
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-[#F0FAF5] px-[14px] py-[10px] align-middle"><span className="inline-flex items-center px-[9px] py-[4px] rounded-full bg-[#f2f4f7] text-[#3f4a55] text-[11px] font-bold">{loan.typeChip}</span></td>
                        <td className="text-right border-b border-[#F0FAF5] px-[14px] py-[10px] align-middle">
                          <div className="text-[#ef4444] font-bold text-[13px]">{formatAmount(loan.outstanding)}</div>
                          <small className="block text-right text-[#8FA99C] text-[11px] font-medium mt-[1px]">of {formatAmount(loan.principal)}</small>
                        </td>
                        <td className="text-right border-b border-[#F0FAF5] px-[14px] py-[10px] align-middle">
                          <div className="text-[#0D1F17] font-bold text-[13px]">{formatAmount(loan.monthlyPayment)}</div>
                          <small className="block text-right text-[#8FA99C] text-[11px] font-medium mt-[1px]">Monthly</small>
                        </td>
                        <td className="border-b border-[#F0FAF5] px-[14px] py-[10px] align-middle">
                          <div className="text-[#0D1F17] font-bold text-[13px]">{loan.interestRate}%</div>
                          <small className="block text-[#8FA99C] text-[11px] font-medium mt-[1px]">p.a.</small>
                        </td>
                        <td className="border-b border-[#F0FAF5] px-[14px] py-[10px] align-middle">
                          <div className="inline-flex items-center gap-[8px] min-w-[130px]">
                            <span className="text-[#0D1F17] text-[12px] min-w-[24px] text-right font-bold">{loan.repaidPct.toFixed(0)}%</span>
                            <div className="w-full max-w-[90px] h-[7px] rounded-full bg-[#edf2ef] overflow-hidden">
                              <div className="h-full bg-[#2D7A4F]" style={{ width: `${Math.min(loan.repaidPct, 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="text-right border-b border-[#F0FAF5] px-[14px] py-[10px] align-middle">
                          <div className="text-[#0D1F17] font-bold text-[13px]">{loan.tenureLeft} mo</div>
                          <small className="block text-right text-[#8FA99C] text-[11px] font-medium mt-[1px]">{formatMonthYear(loan.maturityDate)}</small>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLoanRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-[#7b8793] text-[13px] font-medium px-[14px] py-[20px]">No liabilities match your search or filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </article>

          <article className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 flex flex-col p-[20px]">
            <h3 className="text-[16px] font-bold text-[#0D1F17] m-0 mb-[16px]">Payoff Strategy</h3>
            <div className="flex border border-[#E4EDE8] p-[4px] rounded-[10px] mb-[20px]">
              <button
                type="button"
                className={`flex-1 py-[8px] rounded-[6px] text-[13px] font-bold border-none cursor-pointer transition-colors ${strategy === 'avalanche' ? 'bg-[#2D7A4F] text-white shadow-[0_2px_4px_rgba(0,0,0,0.05)]' : 'bg-transparent text-[#8FA99C]'}`}
                onClick={() => setStrategy('avalanche')}
              >
                Avalanche
              </button>
              <button
                type="button"
                className={`flex-1 py-[8px] rounded-[6px] text-[13px] font-bold border-none cursor-pointer transition-colors ${strategy === 'snowball' ? 'bg-[#2D7A4F] text-white shadow-[0_2px_4px_rgba(0,0,0,0.05)]' : 'bg-transparent text-[#8FA99C]'}`}
                onClick={() => setStrategy('snowball')}
              >
                Snowball
              </button>
            </div>

            <div className="bg-[#EDF4EFF2] border border-[#CEE4D8] rounded-[10px] p-[16px] mb-[24px]">
              <small className="block text-[#0D1F17] font-bold text-[10px] uppercase tracking-[0.8px] mb-[4px]">{strategy.toUpperCase()} STRATEGY</small>
              <strong className="block text-[#0D1F17] text-[24px] mb-[4px]">Save {formatCurrency(strategy === 'avalanche' ? totalInterest * 0.22 : totalInterest * 0.12)}</strong>
              <p className="text-[#3F5047] text-[13px] m-0 leading-[1.4]">
                {strategy === 'avalanche'
                  ? 'Pay highest-interest loans first to reduce total cost of debt.'
                  : 'Pay smallest balances first to gain momentum and close loans faster.'}
              </p>
            </div>

            <ul className="list-none p-0 m-0 flex flex-col gap-[12px] overflow-y-auto max-h-[220px] pr-[4px] scrollbar-thin scrollbar-thumb-[#E4EDE8] scrollbar-track-transparent">
              {orderedLoans.map((loan, idx) => (
                <li key={loan.id} className="flex justify-between items-center bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-[12px] rounded-[10px] border border-[#E4EDE8]">
                  <div className="flex items-center gap-[12px]">
                    <span className="w-[28px] h-[28px] rounded-full bg-[#EAF3EE] text-[#2D7A4F] flex items-center justify-center font-bold text-[12px]">{idx + 1}</span>
                    <div>
                      <strong className="block text-[#0D1F17] text-[14px] leading-tight mb-[2px]">{loan.name}</strong>
                      <small className="text-[#8FA99C] text-[12px] leading-none">{loan.interestRate}% p.a.</small>
                    </div>
                  </div>
                  <span className="font-bold text-[#2D7A4F] text-[14px]">{loan.tenureLeft} mo</span>
                </li>
              ))}
            </ul>

            <div className="mt-[20px] font-bold text-[14px] text-[#2D7A4F]">
              Debt-free projection: {formatMonthYear(new Date(new Date().setMonth(new Date().getMonth() + projectedMonths)).toISOString())}
            </div>
          </article>
        </div>

        <aside className="grid gap-[10px]">
          <article className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] flex flex-col">
            <h4 className="text-[16px] font-bold text-[#0D1F17] m-0 mb-[32px]">Liability Allocation</h4>
            <div className="flex flex-col gap-[40px]">
              <div className="flex justify-center -mt-[8px]">
                <DonutChart
                  data={liabilityAllocationData}
                  height={170}
                  innerR={48}
                  outerR={75}
                  colors={liabilityAllocationData.map((row) => row.color)}
                  tooltipFmt={(val) => formatCurrency(val)}
                  centerLabel={formatCompactCurrency(totals.totalOutstanding)}
                  centerSub="Total Liabilities"
                  hideLabels
                  hideLegend
                />
              </div>

              <ul className="list-none p-0 m-0 flex flex-col gap-[16px] overflow-y-auto max-h-[190px] pr-[8px] scrollbar-thin scrollbar-thumb-[#E4EDE8] scrollbar-track-transparent">
                {liabilityAllocationRows.map((row) => (
                  <li key={row.name} className="flex justify-between items-center text-[14px] whitespace-nowrap">
                    <div className="flex items-center gap-[10px] text-[#3F4A55] font-semibold text-[14px]">
                      <span className="w-[10px] h-[10px] rounded-full flex-shrink-0" style={{ background: row.color }} />
                      <span className="truncate">{row.name}</span>
                    </div>
                    <div className="ml-auto flex gap-[12px] items-center">
                      <strong className="text-[#0D1F17] font-bold text-[14px]">{formatCompactCurrency(row.value)}</strong>
                      <span className="text-[#8FA99C] font-semibold text-[14px] min-w-[38px] text-right">{row.percent.toFixed(1)}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-md p-[20px] flex flex-col h-[240px]">
            <h4 className="text-[15px] font-bold text-[#0D1F17] m-0 mb-[16px]">Interest Burden</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[12px] flex-1 overflow-y-auto pr-[5px]">
              {interestBurden.map((row) => (
                <li key={row.id} className="flex justify-between items-center text-[13px]">
                  <span className="text-[#8FA99C] font-medium">{row.name}</span>
                  <strong className="text-[#EF4444] font-bold">{formatCurrency(row.annualInterest)} total</strong>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-[12px] pt-[12px] border-t border-[#E4EDE8] text-[13px]">
              <span className="text-[#8FA99C]">Total Interest</span>
              <strong className="text-[#ef4444] font-bold">{formatCurrency(totalInterest)}</strong>
            </div>
          </article>

          <article className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-md p-[20px] flex flex-col h-[240px]">
            <h4 className="text-[15px] font-bold text-[#0D1F17] m-0 mb-[16px]">EMI Schedule</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-[12px] flex-1 overflow-y-auto pr-[5px]">
              {loanRows.slice(0, 3).map((loan) => {
                return (
                  <li key={loan.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[24px] h-[24px] rounded-[6px] bg-[#f2f6f4] text-[#2D7A4F] inline-flex items-center justify-center text-[14px] flex-shrink-0">{loan.iconNode}</div>
                      <div>
                        <strong className="block text-[13px] text-[#0D1F17] mb-[2px]">{loan.name}</strong>
                        <small className="block text-[11px] text-[#8FA99C]">{loan.tenureLeft} months left</small>
                      </div>
                    </div>
                    <span className="font-bold text-[#0D1F17] text-[13px] flex-shrink-0">{formatCurrency(loan.monthlyPayment)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-[8px] mt-[12px] pt-[12px] border-t border-[#E4EDE8] text-[12.5px]">
              <MdCalendarToday className="text-[#2D7A4F]" />
              <span className="text-[#8FA99C]">Next due</span>
              <strong className="ml-auto text-[#0D1F17] font-bold">1 Apr 2026</strong>
            </div>
          </article>
        </aside>
      </section>

      {selectedLoan && selectedLoanDetails && (
        <div className="fixed inset-0 bg-[#0f172a4d] backdrop-blur-[2px] z-[1200] flex justify-end" onClick={() => setSelectedLoanId(null)}>
          <aside className="absolute top-0 right-0 w-[min(420px,100%)] h-full bg-white border-l border-[#e2e8f0] shadow-[-10px_0_24px_rgba(15,23,42,0.12)] flex flex-col gap-[20px] p-[24px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <header className="flex justify-between items-start gap-[8px] sticky top-0 bg-white z-[2] pb-[16px] border-b border-[#eef2f5]">
              <div className="inline-flex items-center gap-[12px]">
                <span className="w-[36px] h-[36px] rounded-[8px] bg-[#edf2ff] text-[#3b82f6] inline-flex items-center justify-center text-[20px]" aria-hidden="true">{selectedLoan.iconNode || <MdOutlineCreditCard />}</span>
                <div>
                  <h4 className="text-[#0D1F17] text-[15px] font-bold m-0 leading-tight">{selectedLoan.name}</h4>
                  <p className="text-[#8FA99C] text-[12px] mt-[4px] m-0 font-medium">{selectedLoan.lender} · {selectedLoan.interestRate}% p.a.</p>
                </div>
              </div>
              <button type="button" className="appearance-none border-none bg-[#f1f5f9] text-[#6b7280] w-[32px] h-[32px] rounded-[8px] inline-flex items-center justify-center cursor-pointer hover:bg-[#e2e8f0] transition-colors" onClick={() => setSelectedLoanId(null)} aria-label="Close details">
                <MdClose size={18} />
              </button>
            </header>

            <section className="bg-[#fee2e2] border border-[#fecaca] rounded-[16px] p-[20px] flex flex-col gap-[8px]">
              <span className="text-[#111827] text-[11px] uppercase tracking-[1px] font-bold mb-[2px]">Outstanding Balance</span>
              <strong className="text-[#111827] text-[28px] leading-none font-bold mb-[4px]">{formatCurrency(selectedLoan.outstanding)}</strong>
              <p className="text-[#1f2937] text-[12px] font-bold m-0 mb-[8px]">
                Original: {formatCurrency(selectedLoan.principal)} · {selectedLoan.repaidPct.toFixed(0)}% repaid
              </p>
              <div className="w-full h-[8px] rounded-full bg-[#fecaca] overflow-hidden mt-[2px] mb-[6px]">
                <div className="h-full bg-[#ef4444] rounded-full" style={{ width: `${Math.min(100, Math.max(0, selectedLoan.repaidPct))}%` }} />
              </div>
              <div className="flex justify-between gap-[8px] mt-[2px]">
                <small className="text-[#1f2937] text-[11px] font-bold">Paid {formatCurrency(selectedLoanDetails.paidAmount)}</small>
                <small className="text-[#1f2937] text-[11px] font-bold">Remaining {formatCurrency(selectedLoan.outstanding)}</small>
              </div>
            </section>

            <section className="flex flex-col gap-[12px] mt-[8px]">
              <h5 className="text-[#8FA99C] text-[11px] font-bold uppercase tracking-[1px] m-0 mb-[4px]">Loan Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] max-w-full">
                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">EMI / Month</span><strong className="text-[#0D1F17] text-[13px] font-bold">{formatCurrency(selectedLoan.monthlyPayment)}</strong></div>
                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Interest Rate</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedLoan.interestRate}% p.a.</strong></div>
                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Tenure Left</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedLoan.tenureLeft} months</strong></div>
                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Loan End Date</span><strong className="text-[#0D1F17] text-[13px] font-bold">{formatMonthYear(selectedLoan.maturityDate)}</strong></div>
                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Total Interest</span><strong className="text-[#0D1F17] text-[13px] font-bold">{formatCurrency(selectedLoanDetails.totalInterest)}</strong></div>
                <div className="bg-[#f8faf9] border border-[#E4EDE8] rounded-[12px] p-[10px_12px] flex flex-col gap-[4px]"><span className="text-[#8FA99C] text-[11px] font-bold">Guarantor</span><strong className="text-[#0D1F17] text-[13px] font-bold">{selectedLoan.isGuarantor ? 'Yes' : 'None'}</strong></div>
              </div>
            </section>

            <footer className="mt-auto pt-[20px] grid grid-cols-2 gap-[12px]">
              <button type="button" className="appearance-none rounded-[12px] p-[12px] font-bold text-[13px] border border-transparent bg-[#2D7A4F] text-white cursor-pointer hover:bg-[#25754e] transition-colors" onClick={openEditModal}>Edit Loan</button>
              <button type="button" className="appearance-none rounded-[12px] p-[12px] font-bold text-[13px] border border-[#fecaca] bg-[#fff1f2] text-[#e11d48] cursor-pointer hover:bg-[#ffe4e6] transition-colors" onClick={handleDeleteLoan}>Delete</button>
            </footer>
          </aside>
        </div>
      )}

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Liability">
        <form className="grid gap-[16px]" onSubmit={handleEditSubmit}>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Loan Name</label>
            <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Lender</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" value={editForm.lender} onChange={(e) => setEditForm((prev) => ({ ...prev, lender: e.target.value }))} required />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Type</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" value={editForm.subType} onChange={(e) => setEditForm((prev) => ({ ...prev, subType: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Principal Amount</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="number" min="0" value={editForm.principalAmount} onChange={(e) => setEditForm((prev) => ({ ...prev, principalAmount: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Outstanding Balance</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="number" min="0" value={editForm.currentBalance} onChange={(e) => setEditForm((prev) => ({ ...prev, currentBalance: e.target.value }))} required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Monthly EMI</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="number" min="0" value={editForm.monthlyPayment} onChange={(e) => setEditForm((prev) => ({ ...prev, monthlyPayment: e.target.value }))} required />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Interest Rate (% p.a.)</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="number" min="0" step="0.1" value={editForm.interestRate} onChange={(e) => setEditForm((prev) => ({ ...prev, interestRate: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Maturity Date</label>
            <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="date" value={editForm.maturityDate || ''} onChange={(e) => setEditForm((prev) => ({ ...prev, maturityDate: e.target.value }))} />
            </div>
          </div>

          <div className="flex justify-end gap-[12px] mt-[24px]">
            <button type="button" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#2D7A4F] text-white hover:bg-[#256341] shadow-sm">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Liability">
        <form className="grid gap-[16px]" onSubmit={handleAddSubmit}>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Loan Name</label>
            <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" value={addForm.name} onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Lender</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" value={addForm.lender} onChange={(e) => setAddForm((prev) => ({ ...prev, lender: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Liability Type</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <select className="w-full border-none outline-none py-[10px] px-[8px] text-[13px] text-[#0D1F17] bg-transparent appearance-none cursor-pointer" value={addForm.type} onChange={(e) => setAddForm((prev) => ({ ...prev, type: e.target.value }))}>
                  <option value="Long-term Liabilities">Long-term Liabilities</option>
                  <option value="Current Liabilities">Current Liabilities</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Sub Type</label>
            <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" value={addForm.subType} onChange={(e) => setAddForm((prev) => ({ ...prev, subType: e.target.value }))} placeholder="Car Loan / Credit Card / Personal Loan" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Principal Amount</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="number" min="0" value={addForm.principalAmount} onChange={(e) => setAddForm((prev) => ({ ...prev, principalAmount: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Outstanding Balance</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="number" min="0" value={addForm.currentBalance} onChange={(e) => setAddForm((prev) => ({ ...prev, currentBalance: e.target.value }))} required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Monthly EMI</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="number" min="0" value={addForm.monthlyPayment} onChange={(e) => setAddForm((prev) => ({ ...prev, monthlyPayment: e.target.value }))} required />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Interest Rate (% p.a.)</label>
              <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="number" min="0" step="0.1" value={addForm.interestRate} onChange={(e) => setAddForm((prev) => ({ ...prev, interestRate: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.8px]">Maturity Date</label>
            <div className="relative flex items-center border border-[#E4EDE8] rounded-[8px] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input className="w-full border-none outline-none py-[10px] px-[12px] text-[13px] text-[#0D1F17] bg-transparent" type="date" value={addForm.maturityDate} onChange={(e) => setAddForm((prev) => ({ ...prev, maturityDate: e.target.value }))} />
            </div>
          </div>

          <div className="flex justify-end gap-[12px] mt-[24px]">
            <button type="button" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold transition-all cursor-pointer bg-[#2D7A4F] text-white hover:bg-[#256341] shadow-sm">Add Liability</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
