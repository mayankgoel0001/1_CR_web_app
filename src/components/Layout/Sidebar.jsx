import { NavLink } from 'react-router-dom';
import {
    MdDashboard,
    MdAccountBalanceWallet,
    MdOutlineAccountBox,
    MdOutlineCreditCard,
    MdFlag,
    MdVerifiedUser,
    MdCalculate,
    MdTimeline,
    MdPerson,
    MdSettings,
} from 'react-icons/md';
import appLogo from '../../assets/app_logo.png';
import './Sidebar.css';

const overviewItems = [
    { path: '/', label: 'Dashboard', icon: MdDashboard }
];

const portfolioItems = [
    { path: '/portfolio', label: 'Portfolio', icon: MdTimeline },
    // { path: '/my-assets', label: 'My Assets', icon: MdOutlineAccountBox },
    // { path: '/my-debts', label: 'My Debts', icon: MdOutlineCreditCard },
];

const planningItems = [
    { path: '/goals', label: 'Goals', icon: MdFlag },
    { path: '/insurance', label: 'Insurance', icon: MdVerifiedUser },
];

const toolsItems = [
    { path: '/calculators', label: 'Calculators', icon: MdCalculate },
    { path: '/scenario-analysis', label: 'Scenario Analysis', icon: MdTimeline },
];

const accountItems = [
    { path: '/profile', label: 'Profile', icon: MdPerson },
    { path: '/settings', label: 'Settings', icon: MdSettings },
];

export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

                {/* LOGO AREA */}
                <div className="sidebar-logo">
                    <img src={appLogo} alt="1CrClub" className="sidebar-logo-img" />
                </div>

                {/* NAVIGATION LINKS */}
                <nav className="sidebar-nav">

                    <div className="nav-group">
                        <div className="nav-label">Overview</div>
                        {overviewItems.map(item => (
                            <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <item.icon className="nav-icon" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="nav-group">
                        <div className="nav-label">Portfolio</div>
                        {portfolioItems.map(item => (
                            <NavLink key={item.path} to={item.path} onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <item.icon className="nav-icon" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="nav-group">
                        <div className="nav-label">Planning</div>
                        {planningItems.map(item => (
                            <NavLink key={item.path} to={item.path} onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <item.icon className="nav-icon" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="nav-group">
                        <div className="nav-label">Tools</div>
                        {toolsItems.map(item => (
                            <NavLink key={item.path} to={item.path} onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <item.icon className="nav-icon" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="nav-group">
                        <div className="nav-label">Account</div>
                        {accountItems.map(item => (
                            <NavLink key={item.path} to={item.path} onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <item.icon className="nav-icon" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                </nav>

                {/* BOTTOM UPGRADE CARD */}
                <div className="sidebar-bottom">
                    <div className="upgrade-card">
                        <div className="upgrade-label">Upgrade to</div>
                        <div className="upgrade-title">1CrClub PRO</div>
                        <div className="upgrade-sub">Advanced insights & planning</div>
                        <button className="upgrade-btn">Get Unlimited Access</button>
                    </div>
                </div>

            </aside>
        </>
    );
}
