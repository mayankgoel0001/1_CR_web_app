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
import './FinancialDetailPage.css';

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
    <div className="financial-detail-page">
      <section className="financial-overview-card">
        <div className="financial-overview-head">
          <div>
            <h1>Financial Health Score</h1>
            <p>Detailed score report with recommendations and actionables.</p>
            <span className="financial-last-updated">Updated: {formatDate(financialScore.lastUpdated)}</span>
          </div>
          <div className="financial-head-actions">
            <button type="button" className="financial-icon-btn" aria-label="Refresh report">
              <MdRefresh />
            </button>
            <button type="button" className="financial-icon-btn" aria-label="Share report">
              <MdShare />
            </button>
          </div>
        </div>

        <div className="financial-overview-body">
          <div className="financial-overall-ring-wrap">
            <div
              className="financial-overall-ring"
              style={{ '--score': financialScore.overall, '--ring-color': '#f2a700' }}
            >
              <div className="financial-overall-center">
                <div className="financial-overall-value">{financialScore.overall}</div>
                <div className="financial-overall-label">Overall Score</div>
              </div>
            </div>
          </div>

          <div className="financial-overall-summary">
            <div className="financial-rating-pill">{financialScore.rating}</div>
            <h2>{financialScore.description}</h2>
            <p>
              Your score is calculated across liquidity, debt, savings, investments, and protection to
              reflect overall financial wellness.
            </p>
            <button type="button" className="financial-primary-btn" onClick={() => navigate('/scenario-analysis')}>
              View My Action Plan
              <MdArrowForward />
            </button>
          </div>
        </div>
      </section>

      <section className="financial-section">
        <div className="financial-section-title">Category Breakdown</div>
        <div className="financial-category-grid">
          {categoryCards.map((category) => {
            const TrendIcon = category.tone.trend === 'up' ? MdTrendingUp : MdTrendingDown;
            const CategoryIcon = category.Icon;

            return (
              <article
                className="financial-category-card"
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
                <div className="financial-category-top">
                  <span className="financial-category-icon" style={{ color: category.tone.main, background: category.tone.light }}>
                    <CategoryIcon />
                  </span>
                  <TrendIcon style={{ color: category.tone.main }} />
                </div>

                <div className="financial-mini-ring" style={{ '--score': category.score, '--ring-color': category.tone.main }}>
                  <span>{category.score}</span>
                </div>

                <h3>{category.name}</h3>
                <p>{category.insight}</p>
              </article>
            );
          })}
        </div>
      </section>

      {selectedCategoryDetail && (
        <div className="financial-category-drawer-overlay" onClick={() => setActiveCategoryDrawer(null)}>
          <aside className="financial-category-drawer" onClick={(event) => event.stopPropagation()}>
            <header className="financial-category-drawer-header">
              <div>
                <h4>{selectedCategoryDetail.title}</h4>
                <p>Breakdown</p>
              </div>
              <div className={`financial-category-score-pill ${selectedCategoryDetail.scoreTone}`}>
                {selectedCategoryDetail.score}
              </div>
            </header>

            <section className="financial-category-drawer-body">
              {selectedCategoryDetail.rows.map((row) => (
                <article className="financial-category-drawer-row" key={row.label}>
                  <div>
                    <h5>{row.label}</h5>
                    <p>{row.sub}</p>
                  </div>
                  <strong className={row.valueTone === 'bad' ? 'bad' : 'good'}>{row.value}</strong>
                </article>
              ))}
            </section>

            <footer className="financial-category-drawer-footer">
              <button type="button" onClick={() => setActiveCategoryDrawer(null)}>
                Close
              </button>
            </footer>

            <button
              type="button"
              className="financial-category-drawer-close"
              aria-label="Close category details"
              onClick={() => setActiveCategoryDrawer(null)}
            >
              <MdClose />
            </button>
          </aside>
        </div>
      )}

      <section className="financial-two-column">
        <div className="financial-section financial-panel">
          <div className="financial-section-title with-icon">
            <MdCheckCircle />
            Your Strengths
          </div>
          <div className="financial-list-stack">
            {strengths.map((item) => (
              <article className="financial-note-card positive" key={item.category}>
                <div className="financial-note-icon">
                  <MdCheckCircle />
                </div>
                <div>
                  <h4>Strong {item.category}</h4>
                  <p>
                    {item.detail} ({item.score}/100)
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="financial-section financial-panel">
          <div className="financial-section-title with-icon">
            <MdError />
            Areas for Improvement
          </div>
          <div className="financial-list-stack">
            {improvements.map((item) => (
              <article className="financial-note-card negative financial-note-card-with-action" key={item.category}>
                <div className="financial-note-icon">
                  <MdError />
                </div>
                <div className="financial-note-content">
                  <h4>Improve {item.category}</h4>
                  <p>
                    {item.detail} ({item.score}/100)
                  </p>
                </div>
                <button type="button" className="financial-secondary-btn" onClick={() => navigate('/goals')}>
                  Take Action
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="financial-section financial-history-card">
        <div className="financial-section-title">Score History</div>
        <div className="financial-history-chart">
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

      <section className="financial-section">
        <div className="financial-section-title">Learn More</div>
        <div className="financial-learn-grid">
          <article className="financial-learn-card">
            <div className="financial-learn-icon">
              <MdSchool />
            </div>
            <h4>Understanding Your Score</h4>
            <p>
              Explore how each category contributes to your score and why category weighting impacts your
              overall ranking.
            </p>
            <button type="button" className="financial-text-btn">
              Learn More
              <MdArrowForward />
            </button>
          </article>

          <article className="financial-learn-card">
            <div className="financial-learn-icon">
              <MdLightbulb />
            </div>
            <h4>How to Improve Your Score</h4>
            <p>
              Small, consistent steps like reducing high-interest debt and increasing auto-investments can
              raise your score quickly.
            </p>
            <button type="button" className="financial-text-btn">
              Learn More
              <MdArrowForward />
            </button>
          </article>
        </div>
      </section>
    </div>
  );
}
