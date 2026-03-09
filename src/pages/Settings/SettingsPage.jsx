import { MdChevronRight, MdDownload, MdEdit, MdLock, MdNotifications, MdPrivacyTip, MdUpdate, MdImportExport, MdDelete, MdPalette, MdAttachMoney, MdLanguage, MdFingerprint, MdHelpOutline, MdContactSupport, MdStar, MdDescription } from 'react-icons/md';
import './SettingsPage.css';

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
        <div className="settings-page">
            <div className="page-header">
                <h1>Settings</h1>
                <p>Manage your account and preferences</p>
            </div>

            {sections.map((section, i) => (
                <div key={i} className="settings-section card">
                    <h3>{section.title}</h3>
                    <div className="settings-list">
                        {section.items.map((item, j) => (
                            <div key={j} className="settings-item">
                                <div className="settings-item-left">
                                    <div className="settings-item-icon" style={item.danger ? { color: '#EF4444' } : {}}>
                                        <item.icon />
                                    </div>
                                    <div className="settings-item-text">
                                        <h5 style={item.danger ? { color: '#EF4444' } : {}}>{item.label}</h5>
                                        <p>{item.desc}</p>
                                    </div>
                                </div>
                                <div className="settings-item-right">
                                    {item.value && <span className="settings-item-value">{item.value}</span>}
                                    <MdChevronRight className="settings-chevron" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button className="btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444', alignSelf: 'flex-start' }}>
                Logout
            </button>
            <div className="settings-footer">Version 1.0.0</div>
        </div>
    );
}
