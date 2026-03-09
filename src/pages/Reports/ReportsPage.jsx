import { MdDownload, MdShare, MdAccountBalanceWallet, MdFlag, MdAssessment, MdVerifiedUser } from 'react-icons/md';
import './ReportsPage.css';

const reports = [
    { title: 'Net Worth Report', desc: 'Complete breakdown of assets vs liabilities with historical trends.', icon: MdAccountBalanceWallet, bg: '#DBEAFE', color: '#2563EB' },
    { title: 'Assets Report', desc: 'Detailed report of all assets including allocation, performance, and gains.', icon: MdAssessment, bg: '#DCFCE7', color: '#16A34A' },
    { title: 'Liabilities Report', desc: 'Overview of all debts, EMIs, interest rates, and payoff timelines.', icon: MdAssessment, bg: '#FEE2E2', color: '#EF4444' },
    { title: 'Goals Progress Report', desc: 'Track progress across all financial goals with projected completion dates.', icon: MdFlag, bg: '#FEF3C7', color: '#F59E0B' },
    { title: 'Insurance Summary', desc: 'Summary of all active policies, coverage, and renewal schedule.', icon: MdVerifiedUser, bg: '#F3E8FF', color: '#8B5CF6' },
    { title: 'Financial Health Report', desc: 'Comprehensive financial health analysis with score breakdown and recommendations.', icon: MdAssessment, bg: '#E0F2FE', color: '#0EA5E9' },
];

export default function ReportsPage() {
    return (
        <div className="reports-page">
            <div className="page-header">
                <h1>Reports</h1>
                <p>Download and share your financial reports</p>
            </div>
            <div className="reports-grid">
                {reports.map((r, i) => (
                    <div key={i} className="report-card card">
                        <div className="report-card-icon" style={{ background: r.bg, color: r.color }}>
                            <r.icon />
                        </div>
                        <h4>{r.title}</h4>
                        <p>{r.desc}</p>
                        <div className="report-actions">
                            <button className="btn-primary"><MdDownload /> Download PDF</button>
                            <button className="btn-outline"><MdShare /> Share</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
