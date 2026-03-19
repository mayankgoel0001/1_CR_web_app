import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAccountBalanceWallet,
  MdArrowForward,
  MdClose,
  MdLightbulb,
  MdRefresh,
  MdSchool,
  MdSecurity,
  MdShare,
  MdTrendingDown,
  MdTrendingUp,
  MdWaterDrop,
  MdCheckCircle,
  MdError,
} from 'react-icons/md';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { financialScore } from '../../data/mockData';



function getScoreTone(score) {
  if (score >= 80) {
    return {
      label: 'Strong',
      main: '#1fb882',
      light: '#e8f8f2',
      trend: 'up',
    };
  }

  if (score >= 60) {
    return {
      label: 'Good',
      main: '#f2a700',
      light: '#fff7df',
      trend: 'up',
    };
  }

  return {
    label: 'Needs Attention',
    main: '#ef4444',
    light: '#feecec',
    trend: 'down',
  };
}

function getCategoryIcon(name) {
  const value = String(name || '').toLowerCase();

  if (value.includes('liquidity')) return MdWaterDrop;
  if (value.includes('debt')) return MdAccountBalanceWallet;
  if (value.includes('savings')) return MdTrendingUp;
  if (value.includes('investment')) return MdTrendingUp;
  if (value.includes('protection')) return MdSecurity;

  return MdTrendingUp;
}

function getInsightText(category, score) {
  const value = String(category || '').toLowerCase();

  if (value.includes('liquidity')) return `Liquid reserve is healthy at ${score}/100.`;
  if (value.includes('debt')) return `Debt efficiency is steady at ${score}/100.`;
  if (value.includes('savings')) return `Savings discipline currently sits at ${score}/100.`;
  if (value.includes('investment')) return `Diversification quality is ${score}/100 right now.`;
  if (value.includes('protection')) return `Coverage sufficiency is ${score}/100.`;

  return `Current category score is ${score}/100.`;
}

function formatDate(dateValue) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

const categoryDrawerDetails = {
  liquidity: {
    title: 'Liquidity',
    score: '100',
    scoreTone: 'good',
    rows: [
      {
        label: 'Total Liquid Assets',
        sub: '21 active liquid assets',
        value: 'Rs8,418,809.78',
        valueTone: 'good',
      },
      {
        label: 'Monthly Expenses',
        sub: 'Excellent: >6 months expenses covered',
        value: 'Rs20,000',
        valueTone: 'good',
      },
      {
        label: 'Coverage Ratio',
        sub: 'Months of expenses covered',
        value: '420.9x',
        valueTone: 'good',
      },
    ],
  },
  'debt management': {
    title: 'Debt Management',
    score: '40',
    scoreTone: 'bad',
    rows: [
      {
        label: 'Debt-to-Income Ratio',
        sub: 'Critical: High debt burden',
        value: '100.0%',
        valueTone: 'bad',
      },
      {
        label: 'Total Monthly EMI',
        sub: '2 active liabilities',
        value: 'Rs25,000',
        valueTone: 'bad',
      },
      {
        label: 'Monthly Income',
        sub: 'Base for DTI calculation',
        value: 'Rs25,000',
        valueTone: 'good',
      },
    ],
  },
  'savings rate': {
    title: 'Savings Rate',
    score: '80',
    scoreTone: 'good',
    rows: [
      {
        label: 'Monthly Savings',
        sub: 'Income minus expenses',
        value: 'Rs5,000',
        valueTone: 'good',
      },
      {
        label: 'Savings Rate',
        sub: 'Good: Saving >20% of income',
        value: '20.0%',
        valueTone: 'good',
      },
    ],
  },
  investments: {
    title: 'Investment Diversification',
    score: '100',
    scoreTone: 'good',
    rows: [
      {
        label: 'Asset Categories',
        sub: '12 different types of assets',
        value: '12',
        valueTone: 'good',
      },
      {
        label: 'Portfolio Health',
        sub: 'Excellent: Highly diversified portfolio',
        value: 'Diversified',
        valueTone: 'good',
      },
    ],
  },
  protection: {
    title: 'Protection Coverage',
    score: '100',
    scoreTone: 'good',
    rows: [
      {
        label: 'Health Score',
        sub: 'Cover: Rs100000.0L / Target: Rs13.5L',
        value: '50/50',
        valueTone: 'good',
      },
      {
        label: 'Life Score',
        sub: 'Cover: Rs15000.0L / Target: Rs50.0L',
        value: '50/50',
        valueTone: 'good',
      },
      {
        label: 'Total Coverage',
        sub: '3 active policies',
        value: 'Rs11,500,100,000',
        valueTone: 'good',
      },
    ],
  },
};

function getCategoryDrawerData(category) {
  const key = String(category || '').toLowerCase();
  return categoryDrawerDetails[key] || null;
}

export default function FinancialDetailPage() {
  const navigate = useNavigate();
  const [activeCategoryDrawer, setActiveCategoryDrawer] = useState(null);

  useEffect(() => {
    if (!activeCategoryDrawer) {
      return undefined;
    }

    document.body.style.overflow = 'hidden';

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setActiveCategoryDrawer(null);
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [activeCategoryDrawer]);

  const categoryCards = useMemo(
    () =>
      financialScore.categories.map((category) => {
        const tone = getScoreTone(category.score);
        return {
          ...category,
          tone,
          Icon: getCategoryIcon(category.name),
          insight: getInsightText(category.name, category.score),
        };
      }),
    []
  );

  const strengths = useMemo(() => {
    if (financialScore.strengths?.length) {
      return financialScore.strengths;
    }

    return categoryCards
      .filter((item) => item.score >= 75)
      .map((item) => ({
        category: item.name,
        score: item.score,
        detail: item.insight,
      }));
  }, [categoryCards]);

  const improvements = useMemo(() => {
    if (financialScore.improvements?.length) {
      return financialScore.improvements;
    }

    return categoryCards
      .filter((item) => item.score < 70)
      .map((item) => ({
        category: item.name,
        score: item.score,
        detail: item.insight,
      }));
  }, [categoryCards]);

  const selectedCategoryDetail = useMemo(() => {
    if (!activeCategoryDrawer) {
      return null;
    }

    return getCategoryDrawerData(activeCategoryDrawer.name);
  }, [activeCategoryDrawer]);

  return (
    <div className="grid gap-[18px]">
      <section className="bg-card border border-border-light rounded-[14px] shadow-sm p-[clamp(14px,2vw,22px)]">
        <div className="flex justify-between gap-[14px] flex-wrap mb-[20px]">
          <div>
            <h1 className="text-[22px] font-bold text-[#0D1F17]">Financial Health Score</h1>
            <p className="mt-[6px] text-[#8FA99C] max-w-[56ch] text-[12.5px]">Detailed score report with recommendations and actionables.</p>
            <span className="mt-[8px] inline-flex text-[#8FA99C] font-bold text-[11px] uppercase tracking-[0.8px]">Updated: {formatDate(financialScore.lastUpdated)}</span>
          </div>
          <div className="flex gap-[10px] max-md:w-full max-md:justify-end">
            <button type="button" className="w-[38px] h-[38px] rounded-full border border-border bg-white text-[#0f172a] inline-flex items-center justify-center text-[1.2rem] transition-all duration-200 hover:border-primary hover:text-primary hover:bg-[#f7faf8]" aria-label="Refresh report">
              <MdRefresh />
            </button>
            <button type="button" className="w-[38px] h-[38px] rounded-full border border-border bg-white text-[#0f172a] inline-flex items-center justify-center text-[1.2rem] transition-all duration-200 hover:border-primary hover:text-primary hover:bg-[#f7faf8]" aria-label="Share report">
              <MdShare />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[240px_minmax(0,1fr)] gap-[18px] items-center max-xl:grid-cols-1 max-xl:justify-items-center max-xl:text-center">
          <div className="grid place-items-center">
            <div
              className="w-[210px] max-md:w-[min(70vw,250px)] aspect-square rounded-full relative -rotate-[120deg] before:content-[''] before:absolute before:inset-[15px] before:rounded-full before:bg-card"
              style={{ '--score': financialScore.overall, '--ring-color': '#f2a700', background: 'conic-gradient(var(--ring-color) calc(var(--score) * 3.6deg), #edf1f2 0)' }}
            >
              <div className="absolute inset-0 rotate-[120deg] z-[1]">
                <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-[34px] leading-none font-bold text-[#e5a400]">{financialScore.overall}</div>
                <div className="absolute w-full left-[50%] bottom-[clamp(28px,4vw,38px)] -translate-x-[50%] text-center whitespace-nowrap text-[12px] font-medium text-[#6b7280]">Overall Score</div>
              </div>
            </div>
          </div>

          <div className="mt-[14px]">
            <div className="inline-flex items-center px-[10px] py-[3px] rounded-full text-[11px] font-bold text-[#b15d00] bg-[#fff2d9] tracking-[0.8px] uppercase">{financialScore.rating}</div>
            <h2 className="mt-[14px] text-[18px] font-bold leading-[1.25] text-[#0D1F17]">{financialScore.description}</h2>
            <p className="mt-[10px] text-[#8FA99C] max-w-[58ch] text-[13px] font-medium max-xl:mx-auto">
              Your score is calculated across liquidity, debt, savings, investments, and protection to
              reflect overall financial wellness.
            </p>
            <button type="button" className="mt-[16px] inline-flex items-center gap-[8px] rounded-[8px] font-bold text-[13px] transition-transform transition-shadow duration-200 bg-[#2D7A4F] text-white py-[9px] px-[16px] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(27,140,78,0.15)]" onClick={() => navigate('/scenario-analysis')}>
              View My Action Plan
              <MdArrowForward />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-card border border-border-light rounded-[14px] shadow-sm p-[clamp(14px,1.8vw,18px)]">
        <div className="text-[15px] font-bold text-[#0D1F17] mb-[12px]">Category Breakdown</div>
        <div className="grid grid-cols-[repeat(5,minmax(155px,1fr))] gap-[12px] overflow-x-auto pb-[4px]">
          {categoryCards.map((category) => {
            const TrendIcon = category.tone.trend === 'up' ? MdTrendingUp : MdTrendingDown;
            const CategoryIcon = category.Icon;

            return (
              <article
                className="min-w-[155px] border border-border-light rounded-[14px] p-[12px] bg-gradient-to-b from-[#ffffff] to-[#fbfcfc] transition-all duration-200 cursor-pointer hover:border-[#dde8e2] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#75b58f] focus-visible:outline-offset-2"
                key={category.name}
                role="button"
                tabIndex={0}
                onClick={() => setActiveCategoryDrawer(category)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveCategoryDrawer(category);
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="w-[26px] h-[26px] rounded-[8px] inline-flex items-center justify-center text-[0.95rem]" style={{ color: category.tone.main, background: category.tone.light }}>
                    <CategoryIcon />
                  </span>
                  <TrendIcon style={{ color: category.tone.main }} />
                </div>

                <div className="w-[105px] aspect-square mx-auto mt-[10px] mb-[12px] rounded-full relative -rotate-90 before:content-[''] before:absolute before:inset-[10px] before:rounded-full before:bg-white" style={{ '--score': category.score, '--ring-color': category.tone.main, background: 'conic-gradient(var(--ring-color) calc(var(--score) * 3.6deg), #edf1f2 0)' }}>
                  <span className="absolute inset-0 grid place-items-center text-[1.08rem] font-extrabold text-[#111827] rotate-90 z-[1]">{category.score}</span>
                </div>

                <h3 className="text-[0.78rem] font-semibold mb-[6px] text-center">{category.name}</h3>
                <p className="text-[0.74rem] leading-[1.45] text-text-secondary text-center">{category.insight}</p>
              </article>
            );
          })}
        </div>
      </section>

      {selectedCategoryDetail && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[1250] flex justify-end" onClick={() => setActiveCategoryDrawer(null)}>
          <aside className="relative w-[min(430px,100vw)] max-md:w-full h-full bg-white border-l border-border-light shadow-[-10px_0_24px_rgba(15,23,42,0.12)] p-[16px] max-md:p-[14px] flex flex-col gap-[12px] overflow-y-auto animate-[fadeIn_0.22s_ease-out]" onClick={(event) => event.stopPropagation()}>
            <header className="flex justify-between items-start gap-[10px] pr-[40px] pb-[10px] border-b border-[#eef2f5]">
              <div>
                <h4 className="text-[22px] leading-[1.15] font-bold text-[#0D1F17]">{selectedCategoryDetail.title}</h4>
                <p className="mt-[12px] max-md:mt-[8px] text-[15px] font-bold text-[#0D1F17]">Breakdown</p>
              </div>
              <div className={`min-w-[88px] max-md:min-w-[84px] h-[54px] max-md:h-[52px] rounded-full inline-flex items-center justify-center text-[18px] font-bold ${selectedCategoryDetail.scoreTone === 'bad' ? 'text-[#EF4444] bg-[#FEE2E2]' : 'text-[#2D7A4F] bg-[#E8F5EE]'}`}>
                {selectedCategoryDetail.score}
              </div>
            </header>

            <section className="grid gap-0">
              {selectedCategoryDetail.rows.map((row) => (
                <article className="flex justify-between gap-[14px] items-start border-b border-[#f1f4f6] py-[18px]" key={row.label}>
                  <div>
                    <h5 className="text-[13px] font-bold text-[#0D1F17]">{row.label}</h5>
                    <p className="mt-[4px] text-[#8FA99C] text-[12px]">{row.sub}</p>
                  </div>
                  <strong className={`text-[15px] font-bold whitespace-nowrap ${row.valueTone === 'bad' ? 'text-[#EF4444]' : 'text-[#2D7A4F]'}`}>{row.value}</strong>
                </article>
              ))}
            </section>

            <footer className="mt-auto pt-[8px]">
              <button type="button" className="w-full rounded-[12px] py-[12px] px-[14px] bg-[#2D7A4F] text-white text-[14px] font-bold" onClick={() => setActiveCategoryDrawer(null)}>
                Close
              </button>
            </footer>

            <button
              type="button"
              className="absolute top-[14px] right-[14px] w-[30px] h-[30px] rounded-[8px] border border-gray-200 bg-white text-gray-500 inline-flex items-center justify-center"
              aria-label="Close category details"
              onClick={() => setActiveCategoryDrawer(null)}
            >
              <MdClose />
            </button>
          </aside>
        </div>
      )}

      <section className="grid gap-md grid-cols-1 xl:grid-cols-2 items-start">
        <div className="bg-card border border-border-light rounded-[14px] shadow-sm p-[clamp(14px,1.8vw,18px)] h-auto">
          <div className="inline-flex items-center gap-[10px] text-[15px] font-bold text-[#0D1F17] mb-[12px] [&>svg]:text-[1.2rem]">
            <MdCheckCircle />
            Your Strengths
          </div>
          <div className="grid gap-[12px]">
            {strengths.map((item) => (
              <article className="rounded-[14px] border p-[12px] grid grid-cols-[40px_minmax(0,1fr)] gap-[12px] items-start bg-[#f6fbf8] border-[#d6ecdf]" key={item.category}>
                <div className="w-[40px] h-[40px] rounded-full grid place-items-center text-[1.25rem] bg-[#1fb882] text-white">
                  <MdCheckCircle />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#0D1F17]">Strong {item.category}</h4>
                  <p className="mt-[6px] text-[#8FA99C] text-[12.5px]">
                    {item.detail} ({item.score}/100)
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border-light rounded-[14px] shadow-sm p-[clamp(14px,1.8vw,18px)] h-auto">
          <div className="inline-flex items-center gap-[10px] text-[15px] font-bold text-[#0D1F17] mb-[12px] [&>svg]:text-[1.2rem]">
            <MdError />
            Areas for Improvement
          </div>
          <div className="grid gap-[12px]">
            {improvements.map((item) => (
              <article className="rounded-[14px] border p-[12px] grid grid-cols-[40px_minmax(0,1fr)_auto] max-md:grid-cols-[40px_minmax(0,1fr)] items-center max-md:items-start gap-[12px] bg-[#fff8f8] border-[#f4dddd]" key={item.category}>
                <div className="w-[40px] h-[40px] rounded-full grid place-items-center text-[1.25rem] bg-[#ef4444] text-white">
                  <MdError />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold text-[#0D1F17]">Improve {item.category}</h4>
                  <p className="mt-[6px] text-[#8FA99C] text-[12.5px]">
                    {item.detail} ({item.score}/100)
                  </p>
                </div>
                <button type="button" className="inline-flex items-center gap-[8px] rounded-[8px] font-bold text-[13px] transition-transform transition-shadow duration-200 bg-white text-[#EF4444] border border-[#fecaca] py-[8px] px-[12px] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(239,68,68,0.08)] hover:bg-[#fff5f5] self-center justify-self-end whitespace-nowrap max-md:col-start-2 max-md:justify-self-start max-md:mt-[10px]" onClick={() => navigate('/goals')}>
                  Take Action
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card border border-border-light rounded-[14px] shadow-sm p-[clamp(14px,1.8vw,18px)] overflow-hidden">
        <div className="text-[15px] font-bold text-[#0D1F17] mb-[12px]">Score History</div>
        <div className="w-full h-[240px] max-md:h-[220px]">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={financialScore.history} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="financialScoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1b8c4e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#1b8c4e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e7ecea" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={34} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #d9e2de',
                  boxShadow: '0 10px 25px rgba(15,23,42,0.08)',
                }}
                formatter={(value) => [`${value}/100`, 'Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#1b8c4e"
                strokeWidth={3}
                fill="url(#financialScoreFill)"
                dot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#1b8c4e' }}
                activeDot={{ r: 7, fill: '#1b8c4e', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-card border border-border-light rounded-[14px] shadow-sm p-[clamp(14px,1.8vw,18px)]">
        <div className="text-[15px] font-bold text-[#0D1F17] mb-[12px]">Learn More</div>
        <div className="grid grid-cols-2 gap-[12px] max-md:grid-cols-1">
          <article className="border border-[#E4EDE8] rounded-[14px] bg-white p-[16px]">
            <div className="w-[52px] h-[52px] rounded-[14px] grid place-items-center bg-[#E8F5EE] text-[#2D7A4F] text-[1.3rem] mb-[12px]">
              <MdSchool />
            </div>
            <h4 className="text-[13px] font-bold leading-[1.2] mb-[8px] text-[#0D1F17] max-md:text-[0.86rem]">Understanding Your Score</h4>
            <p className="text-[#8FA99C] leading-[1.55] text-[12.5px]">
              Explore how each category contributes to your score and why category weighting impacts your
              overall ranking.
            </p>
            <button type="button" className="mt-[16px] inline-flex items-center gap-[8px] text-[#2D7A4F] font-bold text-[13px] border-b border-transparent transition-colors duration-200 hover:border-[#9fceb3]">
              Learn More
              <MdArrowForward />
            </button>
          </article>

          <article className="border border-[#E4EDE8] rounded-[14px] bg-white p-[16px]">
            <div className="w-[52px] h-[52px] rounded-[14px] grid place-items-center bg-[#E8F5EE] text-[#2D7A4F] text-[1.3rem] mb-[12px]">
              <MdLightbulb />
            </div>
            <h4 className="text-[13px] font-bold leading-[1.2] mb-[8px] text-[#0D1F17] max-md:text-[0.86rem]">How to Improve Your Score</h4>
            <p className="text-[#8FA99C] leading-[1.55] text-[12.5px]">
              Small, consistent steps like reducing high-interest debt and increasing auto-investments can
              raise your score quickly.
            </p>
            <button type="button" className="mt-[16px] inline-flex items-center gap-[8px] text-[#2D7A4F] font-bold text-[13px] border-b border-transparent transition-colors duration-200 hover:border-[#9fceb3]">
              Learn More
              <MdArrowForward />
            </button>
          </article>
        </div>
      </section>
    </div>
  );
}
