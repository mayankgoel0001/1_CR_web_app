import { MdChevronRight, MdDownload, MdEdit, MdLock, MdNotifications, MdPrivacyTip, MdUpdate, MdImportExport, MdDelete, MdPalette, MdAttachMoney, MdLanguage, MdFingerprint, MdHelpOutline, MdContactSupport, MdStar, MdDescription } from 'react-icons/md';

const sections = [
    {
        title: 'Account Settings',
        items: [
            { icon: MdDownload, label: 'Download All Reports', desc: 'Export all financial reports', value: '' },
            { icon: MdEdit, label: 'Edit Profile', desc: 'Update your personal information', value: '' },
            { icon: MdLock, label: 'Change Password', desc: 'Update account password', value: '' },
            { icon: MdNotifications, label: 'Notification Preferences', desc: 'Configure push notifications', value: '' },
            { icon: MdPrivacyTip, label: 'Privacy Settings', desc: 'Data sharing & privacy controls', value: '' },
        ],
    },
    {
        title: 'Financial Data',
        items: [
            { icon: MdUpdate, label: 'Update Financial Information', desc: 'Quick update income/expenses', value: '' },
            { icon: MdImportExport, label: 'Data Export', desc: 'Export raw financial data', value: '' },
            { icon: MdDelete, label: 'Delete Financial Data', desc: 'Permanently delete all records', value: '', danger: true },
        ],
    },
    {
        title: 'Preferences',
        items: [
            { icon: MdPalette, label: 'Theme', desc: 'App appearance', value: 'Light' },
            { icon: MdAttachMoney, label: 'Currency Display', desc: 'Preferred currency', value: 'INR (₹)' },
            { icon: MdLanguage, label: 'Language', desc: 'App language', value: 'English' },
            { icon: MdFingerprint, label: 'Biometric Authentication', desc: 'Fingerprint or face unlock', value: 'Off' },
        ],
    },
    {
        title: 'Support',
        items: [
            { icon: MdHelpOutline, label: 'Help Center', desc: 'FAQs and guides', value: '' },
            { icon: MdContactSupport, label: 'Contact Support', desc: 'Chat or email support', value: '' },
            { icon: MdStar, label: 'Rate App', desc: 'Rate us on the app store', value: '' },
            { icon: MdDescription, label: 'Policies & Agreements', desc: 'Terms of service, privacy policy', value: '' },
        ],
    },
];

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-lg">
            <div className="mb-[24px]">
                <h1 className="text-[22px] font-bold text-[#0D1F17]">Settings</h1>
                <p className="text-[12.5px] text-[#8FA99C]">Manage your account and preferences</p>
            </div>

            {sections.map((section, i) => (
                <div key={i} className="bg-white rounded-[14px] border border-[#E4EDE8] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-[24px] transition-shadow duration-200 hover:shadow-md">
                    <h3 className="text-[15px] font-bold text-[#0D1F17] mb-3">{section.title}</h3>
                    <div className="flex flex-col divide-y divide-border-light">
                        {section.items.map((item, j) => (
                            <div key={j} className="flex items-center justify-between py-3 cursor-pointer hover:bg-bg rounded-lg px-2 transition-colors duration-150">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-lg ${item.danger ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-primary-light text-primary'}`}>
                                        <item.icon />
                                    </div>
                                    <div>
                                        <h5 className={`text-[13px] font-bold ${item.danger ? 'text-[#EF4444]' : 'text-[#0D1F17]'}`}>{item.label}</h5>
                                        <p className="text-[12px] text-[#8FA99C] mt-[2px]">{item.desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.value && <span className="text-[11px] font-bold text-[#8FA99C] uppercase tracking-[0.4px] bg-[#F0F4F1] border border-[#E4EDE8] rounded-md px-2.5 py-1">{item.value}</span>}
                                    <MdChevronRight className="text-[#8FA99C] text-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-transparent text-[#EF4444] border border-[#EF4444] rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#FEF2F2] self-start" onClick={() => console.log('Logout')}>
                Logout
            </button>
            <div className="text-center text-[#8FA99C] text-[11px] pb-2">Version 1.0.0</div>
        </div>
    );
}
