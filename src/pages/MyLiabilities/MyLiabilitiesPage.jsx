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
import { ICONS } from '../../utils/icons';
import './MyLiabilitiesPage.css';

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
      home: '#2F63DB',
      education: '#8B5CF6',
      gold: '#EAB308',
      car: '#06B6D4',
      consumer: '#10B981',
      personal: '#F59E0B',
      credit: '#F43F45',
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
    <div className="my-liabilities-page">
      <section className="my-liabilities-overview-section">
        <div className="my-liabilities-overview-header">
          <div className="my-liabilities-titles">
            <h2>My Liabilities</h2>

            <div className="my-liabilities-breadcrumb">
              <button type="button" className="my-liabilities-breadcrumb-link" onClick={() => navigate('/portfolio')}>
                Portfolio
              </button>
              <MdKeyboardArrowRight size={12} />
              <span>My Liabilities</span>
            </div>
          </div>

          <div className="my-liabilities-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/portfolio')}>
              View Portfolio
            </button>
            <button type="button" className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
              + Add Liability
            </button>
          </div>
        </div>

        <div className="my-liabilities-kpi-grid">
          <article className="my-liabilities-kpi-card">
            <div className="my-liabilities-kpi-top">
              <span className="my-liabilities-kpi-label">Total Outstanding</span>
              <div className="my-liabilities-kpi-icon danger"><MdOutlineCreditCard /></div>
            </div>
            <div className="my-liabilities-kpi-value danger-text">{formatCurrency(totals.totalOutstanding)}</div>
            <div className="my-liabilities-kpi-badge danger-badge">{loanRows.length} active loans</div>
            <div className="my-liabilities-kpi-sub">Current total debt balance</div>
          </article>

          <article className="my-liabilities-kpi-card">
            <div className="my-liabilities-kpi-top">
              <span className="my-liabilities-kpi-label">Monthly EMI</span>
              <div className="my-liabilities-kpi-icon warning"><MdPayments /></div>
            </div>
            <div className="my-liabilities-kpi-value">{formatCurrency(totals.monthlyEmi)}</div>
            <div className="my-liabilities-kpi-badge neutral-badge">Due every month</div>
            <div className="my-liabilities-kpi-sub">Total recurring obligation</div>
          </article>

          <article className="my-liabilities-kpi-card">
            <div className="my-liabilities-kpi-top">
              <span className="my-liabilities-kpi-label">Debt-to-Income</span>
              <div className="my-liabilities-kpi-icon info"><MdPieChart /></div>
            </div>
            <div className="my-liabilities-kpi-value">{totals.debtToIncome.toFixed(1)}%</div>
            <div className="my-liabilities-kpi-badge info-badge">
              {totals.debtToIncome <= 36 ? 'Healthy ratio' : 'Above healthy range'}
            </div>
            <div className="my-liabilities-kpi-sub">Recommended under 36%</div>
          </article>

          <article className="my-liabilities-kpi-card">
            <div className="my-liabilities-kpi-top">
              <span className="my-liabilities-kpi-label">Total Paid So Far</span>
              <div className="my-liabilities-kpi-icon success"><MdAccountBalance /></div>
            </div>
            <div className="my-liabilities-kpi-value success-text">{formatCurrency(totals.totalPaid)}</div>
            <div className="my-liabilities-kpi-badge success-badge">Of {formatCurrency(totals.totalPrincipal)}</div>
            <div className="my-liabilities-kpi-sub">Principal repaid till date</div>
          </article>
        </div>
      </section>

      <section className="my-liabilities-main-grid">
        <div className="my-liabilities-left-stack">
          <article className="card my-liabilities-table-card">
            <div className="my-liabilities-table-header">
              <div>
                <h3>Active Loans</h3>
                <p>{filteredLoanRows.length} loans shown</p>
              </div>

              <div className="my-liabilities-toolbar-controls">
                <div className="my-liabilities-search-wrap">
                  <MdSearch />
                  <input
                    type="text"
                    placeholder="Search liabilities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <label className="my-liabilities-select-wrap">
                  <MdFilterList />
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="long_term">Long-term</option>
                    <option value="current">Current</option>
                  </select>
                </label>

                <label className="my-liabilities-select-wrap">
                  <MdSort />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="outstanding_desc">Outstanding: High to Low</option>
                    <option value="outstanding_asc">Outstanding: Low to High</option>
                    <option value="emi_desc">EMI: High to Low</option>
                    <option value="rate_desc">Rate: High to Low</option>
                    <option value="tenure_asc">Tenure: Short to Long</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="my-liabilities-filter-pills">
              {Object.keys(filterMeta).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`my-liabilities-pill ${typeFilter === key ? 'active' : ''}`}
                  onClick={() => setTypeFilter(key)}
                >
                  <span className="my-liabilities-pill-dot" style={{ background: filterMeta[key].color }} />
                  {filterMeta[key].label}
                  <span className="my-liabilities-pill-count">{filterCounts[key]}</span>
                </button>
              ))}
            </div>

            <div className="my-liabilities-table-wrap">
              <table className="my-liabilities-table">
                <thead>
                  <tr>
                    <th>Loan</th>
                    <th>Type</th>
                    <th className="right-align">Outstanding (₹)</th>
                    <th className="right-align">EMI / Month (₹)</th>
                    <th>Rate</th>
                    <th>Repaid</th>
                    <th className="right-align">Tenure Left</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoanRows.map((loan) => {
                    return (
                      <tr key={loan.id} className="my-liabilities-row-clickable" onClick={() => setSelectedLoanId(loan.id)}>
                        <td>
                          <div className="my-liabilities-loan-cell">
                            <div className="my-liabilities-loan-icon">{loan.iconNode}</div>
                            <div>
                              <div className="loan-name">{loan.name}</div>
                              <div className="loan-sub">{loan.lender}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="my-liabilities-chip">{loan.typeChip}</span></td>
                        <td className="right-align">
                          <div className="loan-money danger">{formatAmount(loan.outstanding)}</div>
                          <small>of {formatAmount(loan.principal)}</small>
                        </td>
                        <td className="right-align">
                          <div className="loan-money">{formatAmount(loan.monthlyPayment)}</div>
                          <small>Monthly</small>
                        </td>
                        <td>
                          <div className="loan-money">{loan.interestRate}%</div>
                          <small>p.a.</small>
                        </td>
                        <td>
                          <div className="my-liabilities-progress-row">
                            <span>{loan.repaidPct.toFixed(0)}%</span>
                            <div className="my-liabilities-progress-track">
                              <div className="my-liabilities-progress-fill" style={{ width: `${Math.min(loan.repaidPct, 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="right-align">
                          <div className="loan-money">{loan.tenureLeft} mo</div>
                          <small>{formatMonthYear(loan.maturityDate)}</small>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLoanRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="my-liabilities-empty-state">No liabilities match your search or filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </article>

          <article className="card my-liabilities-payoff-card">
            <h3>Payoff Strategy</h3>
            <div className="my-liabilities-strategy-toggle">
              <button
                type="button"
                className={strategy === 'avalanche' ? 'active' : ''}
                onClick={() => setStrategy('avalanche')}
              >
                Avalanche
              </button>
              <button
                type="button"
                className={strategy === 'snowball' ? 'active' : ''}
                onClick={() => setStrategy('snowball')}
              >
                Snowball
              </button>
            </div>

            <div className="my-liabilities-highlight">
              <small>{strategy.toUpperCase()} STRATEGY</small>
              <strong>Save {formatCurrency(strategy === 'avalanche' ? totalInterest * 0.22 : totalInterest * 0.12)}</strong>
              <p>
                {strategy === 'avalanche'
                  ? 'Pay highest-interest loans first to reduce total cost of debt.'
                  : 'Pay smallest balances first to gain momentum and close loans faster.'}
              </p>
            </div>

            <ul className="my-liabilities-order-list">
              {orderedLoans.map((loan, idx) => (
                <li key={loan.id}>
                  <div className="my-liabilities-order-left">
                    <span className="order-rank">{idx + 1}</span>
                    <div>
                      <strong>{loan.name}</strong>
                      <small>{loan.interestRate}% p.a.</small>
                    </div>
                  </div>
                  <span>{loan.tenureLeft} mo</span>
                </li>
              ))}
            </ul>

            <div className="my-liabilities-projection">
              Debt-free projection: {formatMonthYear(new Date(new Date().setMonth(new Date().getMonth() + projectedMonths)).toISOString())}
            </div>
          </article>
        </div>

        <aside className="my-liabilities-right-stack">
          <article className="card my-liabilities-side-card my-liabilities-allocation-card">
            <h4>Liability Allocation</h4>
            <div className="my-liabilities-allocation-chart">
              <DonutChart
                data={liabilityAllocationData}
                height={230}
                innerR={58}
                outerR={98}
                colors={liabilityAllocationData.map((row) => row.color)}
                tooltipFmt={(val) => formatCurrency(val)}
                centerLabel={formatCompactCurrency(totals.totalOutstanding)}
                centerSub="Total Liabilities"
                hideLabels
                hideLegend
              />
            </div>

            <ul className="my-liabilities-allocation-list">
              {liabilityAllocationRows.map((row) => (
                <li key={row.name}>
                  <div className="my-liabilities-allocation-name">
                    <span className="my-liabilities-allocation-dot" style={{ background: row.color }} />
                    <span>{row.name}</span>
                  </div>
                  <strong>{formatCompactCurrency(row.value)}</strong>
                  <span>{row.percent.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card my-liabilities-side-card">
            <h4>Interest Burden</h4>
            <ul className="my-liabilities-side-list">
              {interestBurden.map((row) => (
                <li key={row.id}>
                  <span>{row.name}</span>
                  <strong>{formatCurrency(row.annualInterest)} total</strong>
                </li>
              ))}
            </ul>
            <div className="my-liabilities-summary-row">
              <span>Total Interest</span>
              <strong>{formatCurrency(totalInterest)}</strong>
            </div>
          </article>

          <article className="card my-liabilities-side-card">
            <h4>EMI Schedule</h4>
            <ul className="my-liabilities-schedule-list">
              {loanRows.map((loan) => {
                return (
                  <li key={loan.id}>
                    <div className="my-liabilities-schedule-icon">{loan.iconNode}</div>
                    <div>
                      <strong>{loan.name}</strong>
                      <small>{loan.tenureLeft} months left</small>
                    </div>
                    <span>{formatCurrency(loan.monthlyPayment)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="my-liabilities-due-row">
              <MdCalendarToday />
              <span>Next due date</span>
              <strong>1 Apr 2026</strong>
            </div>
          </article>
        </aside>
      </section>

      {selectedLoan && selectedLoanDetails && (
        <div className="my-liabilities-drawer-overlay" onClick={() => setSelectedLoanId(null)}>
          <aside ref={drawerRef} className="my-liabilities-drawer" onClick={(e) => e.stopPropagation()}>
            <header className="my-liabilities-drawer-header">
              <div className="my-liabilities-drawer-title">
                <span className="my-liabilities-loan-icon">{selectedLoan.iconNode}</span>
                <div>
                  <h4>{selectedLoan.name}</h4>
                  <p className="my-liabilities-drawer-subline">{selectedLoan.lender} · {selectedLoan.interestRate}% p.a.</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedLoanId(null)} aria-label="Close details">
                <MdClose />
              </button>
            </header>

            <section className="my-liabilities-balance-card">
              <span>Outstanding Balance</span>
              <strong>{formatCurrency(selectedLoan.outstanding)}</strong>
              <p>Original: {formatCurrency(selectedLoan.principal)} · {selectedLoan.repaidPct.toFixed(0)}% repaid</p>

              <div className="my-liabilities-balance-track">
                <div style={{ width: `${Math.min(selectedLoan.repaidPct, 100)}%` }} />
              </div>

              <div className="my-liabilities-balance-row">
                <small>Paid {formatCurrency(selectedLoanDetails.paidAmount)}</small>
                <small>Remaining {formatCurrency(selectedLoan.outstanding)}</small>
              </div>
            </section>

            <section className="my-liabilities-drawer-section">
              <h5>Loan Details</h5>
              <div className="my-liabilities-drawer-grid">
                <div><span>EMI / Month</span><strong>{formatCurrency(selectedLoan.monthlyPayment)}</strong></div>
                <div><span>Interest Rate</span><strong>{selectedLoan.interestRate}% p.a.</strong></div>
                <div><span>Tenure Left</span><strong>{selectedLoan.tenureLeft} months</strong></div>
                <div><span>Loan End Date</span><strong>{formatMonthYear(selectedLoan.maturityDate)}</strong></div>
                <div><span>Total Interest</span><strong>{formatCurrency(selectedLoanDetails.totalInterest)}</strong></div>
                <div><span>Guarantor</span><strong>None</strong></div>
              </div>
            </section>

            <section className="my-liabilities-drawer-section">
              <h5>This Month's EMI Breakup</h5>
              <div className="my-liabilities-drawer-grid">
                <div><span>Principal Component</span><strong>{formatCurrency(selectedLoanDetails.principalComponent)}</strong></div>
                <div><span>Interest Component</span><strong>{formatCurrency(selectedLoanDetails.monthlyInterest)}</strong></div>
              </div>
            </section>

            <footer className="my-liabilities-drawer-actions">
              <button type="button" className="edit" onClick={openEditModal}>Edit Loan</button>
              <button type="button" className="delete" onClick={handleDeleteLoan}>Delete</button>
            </footer>
          </aside>
        </div>
      )}

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Liability">
        <form className="my-liabilities-edit-form" onSubmit={handleEditSubmit}>
          <label htmlFor="loan-name">Loan Name</label>
          <input id="loan-name" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} required />

          <label htmlFor="loan-lender">Lender</label>
          <input id="loan-lender" value={editForm.lender} onChange={(e) => setEditForm((prev) => ({ ...prev, lender: e.target.value }))} required />

          <label htmlFor="loan-subtype">Type</label>
          <input id="loan-subtype" value={editForm.subType} onChange={(e) => setEditForm((prev) => ({ ...prev, subType: e.target.value }))} />

          <label htmlFor="loan-principal">Principal Amount</label>
          <input id="loan-principal" type="number" min="0" value={editForm.principalAmount} onChange={(e) => setEditForm((prev) => ({ ...prev, principalAmount: e.target.value }))} />

          <label htmlFor="loan-balance">Outstanding Balance</label>
          <input id="loan-balance" type="number" min="0" value={editForm.currentBalance} onChange={(e) => setEditForm((prev) => ({ ...prev, currentBalance: e.target.value }))} required />

          <label htmlFor="loan-emi">Monthly EMI</label>
          <input id="loan-emi" type="number" min="0" value={editForm.monthlyPayment} onChange={(e) => setEditForm((prev) => ({ ...prev, monthlyPayment: e.target.value }))} required />

          <label htmlFor="loan-rate">Interest Rate (% p.a.)</label>
          <input id="loan-rate" type="number" min="0" step="0.1" value={editForm.interestRate} onChange={(e) => setEditForm((prev) => ({ ...prev, interestRate: e.target.value }))} />

          <label htmlFor="loan-maturity">Maturity Date</label>
          <input id="loan-maturity" type="date" value={editForm.maturityDate || ''} onChange={(e) => setEditForm((prev) => ({ ...prev, maturityDate: e.target.value }))} />

          <div className="my-liabilities-edit-actions">
            <button type="button" className="btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Liability">
        <form className="my-liabilities-edit-form" onSubmit={handleAddSubmit}>
          <label htmlFor="add-loan-name">Loan Name</label>
          <input id="add-loan-name" value={addForm.name} onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))} required />

          <label htmlFor="add-loan-lender">Lender</label>
          <input id="add-loan-lender" value={addForm.lender} onChange={(e) => setAddForm((prev) => ({ ...prev, lender: e.target.value }))} />

          <label htmlFor="add-loan-type">Liability Type</label>
          <select
            id="add-loan-type"
            value={addForm.type}
            onChange={(e) => setAddForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="Long-term Liabilities">Long-term Liabilities</option>
            <option value="Current Liabilities">Current Liabilities</option>
          </select>

          <label htmlFor="add-loan-subtype">Sub Type</label>
          <input id="add-loan-subtype" value={addForm.subType} onChange={(e) => setAddForm((prev) => ({ ...prev, subType: e.target.value }))} placeholder="Car Loan / Credit Card / Personal Loan" />

          <label htmlFor="add-loan-principal">Principal Amount</label>
          <input id="add-loan-principal" type="number" min="0" value={addForm.principalAmount} onChange={(e) => setAddForm((prev) => ({ ...prev, principalAmount: e.target.value }))} />

          <label htmlFor="add-loan-balance">Outstanding Balance</label>
          <input id="add-loan-balance" type="number" min="0" value={addForm.currentBalance} onChange={(e) => setAddForm((prev) => ({ ...prev, currentBalance: e.target.value }))} required />

          <label htmlFor="add-loan-emi">Monthly EMI</label>
          <input id="add-loan-emi" type="number" min="0" value={addForm.monthlyPayment} onChange={(e) => setAddForm((prev) => ({ ...prev, monthlyPayment: e.target.value }))} required />

          <label htmlFor="add-loan-rate">Interest Rate (% p.a.)</label>
          <input id="add-loan-rate" type="number" min="0" step="0.1" value={addForm.interestRate} onChange={(e) => setAddForm((prev) => ({ ...prev, interestRate: e.target.value }))} />

          <label htmlFor="add-loan-maturity">Maturity Date</label>
          <input id="add-loan-maturity" type="date" value={addForm.maturityDate} onChange={(e) => setAddForm((prev) => ({ ...prev, maturityDate: e.target.value }))} />

          <div className="my-liabilities-edit-actions">
            <button type="button" className="btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Liability</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
