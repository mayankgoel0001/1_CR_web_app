import { MdDownload, MdShare, MdAccountBalanceWallet, MdFlag, MdAssessment, MdVerifiedUser } from 'react-icons/md';

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
        <div className="flex flex-col gap-lg">
            <div className="mb-[24px]">
                <h1 className="text-[22px] font-bold text-[#0D1F17]">Reports</h1>
                <p className="text-[12.5px] text-[#8FA99C]">Download and share your financial reports</p>
            </div>
            <div className="grid grid-cols-3 gap-md">
                {reports.map((r, i) => (
                    <div key={i} className="bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-[24px] flex flex-col gap-[16px] hover:shadow-md transition-shadow duration-200 cursor-pointer">
                        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[20px]" style={{ background: r.bg, color: r.color }}>
                            <r.icon />
                        </div>
                        <h4 className="text-[13px] font-bold text-[#0D1F17]">{r.title}</h4>
                        <p className="text-[12px] text-[#8FA99C] leading-[1.5] flex-1">{r.desc}</p>
                        <div className="flex gap-[8px] mt-[8px]">
                            <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#2D7A4F] text-white rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#256341] hover:-translate-y-[1px] shadow-sm"><MdDownload /> Download PDF</button>
                            <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-transparent text-[#2D7A4F] border border-[#E4EDE8] rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#F0F4F1] hover:border-[#2D7A4F]"><MdShare /> Share</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
