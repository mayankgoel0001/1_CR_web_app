// Centralized static data for Phase 1
// Easy to replace with API calls in Phase 2

export const userData = {
  firstName: 'Mayank',
  lastName: 'Goel',
  email: 'mayank.goel@example.com',
  phone: '+91 98765 43210',
  dob: '1995-06-15',
  occupation: 'Software Engineer',
  panCard: 'ABCPG1234H',
  location: 'New Delhi',
  aadhaar: '•••• •••• 4567',
  relationshipStatus: 'Single',
  annualIncome: 1200000,
  monthlyIncome: 100000,
  monthlyExpenses: 60000,
  monthlySavings: 40000,
  profilePhoto: null,
  familyMembers: [
    { id: 1, name: 'Rajesh Goel', relationship: 'Father', age: 58, dependent: false },
    { id: 2, name: 'Sunita Goel', relationship: 'Mother', age: 54, dependent: true },
    { id: 3, name: 'Priya Goel', relationship: 'Sister', age: 22, dependent: true },
  ],
};

export const financialScore = {
  overall: 85,
  rating: 'Excellent',
  description: "Your financial health is in the top 5% of users. You've demonstrated strong management.",
  lastUpdated: '2026-03-09',
  categories: [
    { name: 'Liquidity', score: 92, icon: 'liquidity', status: 'Strong', color: '#16A34A' },
    { name: 'Debt Management', score: 78, icon: 'debt', status: 'Good', color: '#2563EB' },
    { name: 'Savings Rate', score: 65, icon: 'savings', status: 'Attention', color: '#F59E0B' },
    { name: 'Investments', score: 88, icon: 'investments', status: 'Strong', color: '#16A34A' },
    { name: 'Protection', score: 72, icon: 'protection', status: 'Good', color: '#2563EB' },
  ],
  history: [
    { month: 'Oct', score: 62 },
    { month: 'Nov', score: 68 },
    { month: 'Dec', score: 72 },
    { month: 'Jan', score: 76 },
    { month: 'Feb', score: 80 },
    { month: 'Mar', score: 85 },
  ],
  strengths: [
    { category: 'Liquidity', score: 92, detail: 'Your liquid assets cover 8 months of expenses' },
    { category: 'Investments', score: 88, detail: 'Well-diversified across 5 asset classes' },
  ],
  improvements: [
    { category: 'Savings Rate', score: 65, detail: 'Increase monthly savings by ₹5,000 to reach 45% savings rate' },
    { category: 'Protection', score: 72, detail: 'Consider adding term insurance for adequate coverage' },
  ],
};

export const netWorthData = {
  currentNetWorth: 842500,
  totalAssets: 950200,
  totalLiabilities: 107700,
  changePercent: 12.5,
  history: [
    { month: 'May', netWorth: 620000, assets: 720000, liabilities: 100000 },
    { month: 'Jun', netWorth: 655000, assets: 760000, liabilities: 105000 },
    { month: 'Jul', netWorth: 700000, assets: 810000, liabilities: 110000 },
    { month: 'Aug', netWorth: 740000, assets: 850000, liabilities: 110000 },
    { month: 'Sep', netWorth: 790000, assets: 900000, liabilities: 110000 },
    { month: 'Oct', netWorth: 842500, assets: 950200, liabilities: 107700 },
  ],
};

export const assets = [
  { id: 1, name: 'HDFC Savings Account', category: 'savings', currentValue: 185000, purchasePrice: 185000, purchaseDate: '2024-01-15', isLiquid: true, isActive: true },
  { id: 2, name: 'Reliance Industries', category: 'investments', subType: 'Stocks', currentValue: 125000, purchasePrice: 98000, purchaseDate: '2024-06-20', isLiquid: true, isActive: true },
  { id: 3, name: 'SBI Bluechip Fund', category: 'investments', subType: 'Mutual Funds', currentValue: 210000, purchasePrice: 180000, purchaseDate: '2023-11-10', isLiquid: true, isActive: true },
  { id: 4, name: 'Sovereign Gold Bond', category: 'investments', subType: 'Gold', currentValue: 95000, purchasePrice: 80000, purchaseDate: '2024-03-01', isLiquid: false, isActive: true },
  { id: 5, name: 'Fixed Deposit - ICICI', category: 'savings', currentValue: 150000, purchasePrice: 150000, purchaseDate: '2025-01-15', isLiquid: false, isActive: true },
  { id: 6, name: 'PPF Account', category: 'retirement', currentValue: 120000, purchasePrice: 100000, purchaseDate: '2022-04-01', isLiquid: false, isActive: true },
  { id: 7, name: 'Bitcoin', category: 'crypto', currentValue: 45200, purchasePrice: 35000, purchaseDate: '2024-09-15', isLiquid: true, isActive: true },
  { id: 8, name: 'Honda City (2022)', category: 'vehicles', currentValue: 620000, purchasePrice: 1100000, purchaseDate: '2022-08-10', isLiquid: false, isActive: true },
];

export const liabilities = [
  { id: 1, name: 'Car Loan - HDFC', type: 'Long-term Liabilities', subType: 'Car Loan', lender: 'HDFC Bank', principalAmount: 800000, currentBalance: 52000, interestRate: 8.5, monthlyPayment: 16500, startDate: '2022-08-15', maturityDate: '2027-08-15', isActive: true },
  { id: 2, name: 'Credit Card - Axis', type: 'Current Liabilities', subType: 'Credit Card', lender: 'Axis Bank', principalAmount: 35700, currentBalance: 35700, interestRate: 36, monthlyPayment: 5000, startDate: '2026-02-01', maturityDate: null, isActive: true },
  { id: 3, name: 'Personal Loan - SBI', type: 'Long-term Liabilities', subType: 'Personal Loan', lender: 'SBI', principalAmount: 100000, currentBalance: 20000, interestRate: 12, monthlyPayment: 8900, startDate: '2025-06-01', maturityDate: '2026-06-01', isActive: true },
];

export const goals = [
  { id: 1, title: 'Buy a Car', category: 'Vehicle', currentAmount: 350000, goalAmount: 800000, targetDate: '2027-06-01', status: 'On Track', linkedSources: [] },
  { id: 2, title: 'Dream Home Down Payment', category: 'Home', currentAmount: 500000, goalAmount: 2000000, targetDate: '2030-12-01', status: 'Possible', linkedSources: [] },
  { id: 3, title: 'MBA Education Fund', category: 'Education', currentAmount: 120000, goalAmount: 1500000, targetDate: '2028-07-01', status: 'At Risk', linkedSources: [] },
  { id: 4, title: 'Retirement Corpus', category: 'Retirement', currentAmount: 220000, goalAmount: 50000000, targetDate: '2055-01-01', status: 'On Track', linkedSources: [] },
];

export const insurancePolicies = [
  { id: 1, insurer: 'HDFC ERGO', policyNumber: 'HE-VEH-2024-001', type: 'Vehicle', status: 'active', coverageAmount: 100000, premiumAmount: 2000, premiumFrequency: 'Annual', startDate: '2025-03-15', renewalDate: '2027-03-15' },
  { id: 2, insurer: 'Niva Bupa', policyNumber: 'NB-HLT-2024-052', type: 'Health', status: 'active', coverageAmount: 1000000, premiumAmount: 7000, premiumFrequency: 'Annual', startDate: '2024-12-01', renewalDate: '2026-12-01' },
  { id: 3, insurer: 'LIC', policyNumber: 'LIC-LIFE-2023-789', type: 'Life', status: 'active', coverageAmount: 5000000, premiumAmount: 15000, premiumFrequency: 'Annual', startDate: '2023-05-10', renewalDate: '2028-05-10' },
];

export const alerts = [];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyFull = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'On Track': return '#16A34A';
    case 'Possible': return '#2563EB';
    case 'At Risk': return '#F59E0B';
    case 'Behind': return '#EF4444';
    default: return '#6B7280';
  }
};

export const getStatusBg = (status) => {
  switch (status) {
    case 'On Track': return '#DCFCE7';
    case 'Possible': return '#DBEAFE';
    case 'At Risk': return '#FEF3C7';
    case 'Behind': return '#FEE2E2';
    default: return '#F3F4F6';
  }
};

export const getCategoryIcon = (category) => {
  const icons = {
    Vehicle: '🚗',
    Home: '🏠',
    Education: '🎓',
    Marriage: '💍',
    Vacation: '✈️',
    Emergency: '🛡️',
    Retirement: '🏖️',
    Other: '🎯',
  };
  return icons[category] || '🎯';
};

export const assetAllocation = [
  { name: 'Savings', value: 335000, color: '#16A34A' },
  { name: 'Investments', value: 430000, color: '#2563EB' },
  { name: 'Retirement', value: 120000, color: '#8B5CF6' },
  { name: 'Crypto', value: 45200, color: '#F59E0B' },
  { name: 'Vehicles', value: 620000, color: '#EC4899' },
];

export const liabilityAllocation = [
  { name: 'Car Loan', value: 52000, color: '#2563EB' },
  { name: 'Credit Card', value: 35700, color: '#EF4444' },
  { name: 'Personal Loan', value: 20000, color: '#F59E0B' },
];
