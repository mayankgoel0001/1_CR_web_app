import { NavLink } from 'react-router-dom';
import {
    MdDashboard,
    MdAccountBalanceWallet,
    MdFlag,
    MdInsights,
    MdCalculate,
    MdVerifiedUser,
    MdAssessment,
    MdPerson,
    MdSettings,
} from 'react-icons/md';
import { RiPlantFill } from 'react-icons/ri';
import './Sidebar.css';

const navItems = [
    { path: '/', label: 'Dashboard', icon: MdDashboard },
    { path: '/portfolio', label: 'Portfolio', icon: MdAccountBalanceWallet },
    { path: '/goals', label: 'Goals', icon: MdFlag },
    { path: '/scenario-analysis', label: 'Scenario Analysis', icon: MdInsights },
    { path: '/calculators', label: 'Calculators', icon: MdCalculate },
    { path: '/insurance', label: 'Insurance', icon: MdVerifiedUser },
    { path: '/reports', label: 'Reports', icon: MdAssessment },
];

const bottomItems = [
    { path: '/profile', label: 'Profile', icon: MdPerson },
    { path: '/settings', label: 'Settings', icon: MdSettings },
];

export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <RiPlantFill />
                    </div>
                    <div className="sidebar-logo-text">
                        <h2>1 Cr Club</h2>
                        <span>Wealth Management</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                            onClick={onClose}
                        >
                            <span className="sidebar-link-icon">
                                <item.icon />
                            </span>
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="sidebar-section-label">Account</div>

                    {bottomItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                            onClick={onClose}
                        >
                            <span className="sidebar-link-icon">
                                <item.icon />
                            </span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-upgrade">
                    <div className="sidebar-upgrade-label">Upgrade Pro</div>
                    <p>Get advanced insights and planning tools.</p>
                    <button className="sidebar-upgrade-btn">Upgrade Now</button>
                </div>
            </aside>
        </>
    );
}
