import { NavLink } from 'react-router-dom';
import {
    MdDashboard,
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

const overviewItems = [
    { path: '/', label: 'Dashboard', icon: MdDashboard }
];

const portfolioItems = [
    { path: '/portfolio', label: 'Portfolio', icon: MdTimeline },
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

const navItemBase = "flex items-center gap-2.5 px-[18px] py-2 mx-2 rounded-lg cursor-pointer transition-all duration-150 text-[13px] font-bold no-underline";
const navItemActive = "bg-[#2D7A4F] text-white shadow-sm";
const navItemHover = "hover:bg-[rgba(45,122,79,0.12)] hover:text-[#183325] text-[#183325CC]";
const navIconBase = "w-4 h-4 text-[16px] flex-shrink-0 transition-colors duration-150";

function NavGroup({ label, items, onClose }) {
    return (
        <div className="mb-1">
            <div className="text-[11px] font-bold text-[#18332594] tracking-[0.8px] uppercase px-[18px] pt-2.5 pb-1">
                {label}
            </div>
            {items.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                        `${navItemBase} ${isActive ? navItemActive : navItemHover}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <item.icon className={`${navIconBase} ${isActive ? 'text-white' : 'text-[#2D7A4FBA]'}`} />
                            {item.label}
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    );
}

export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[95] backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}
            <aside className={`w-[250px] min-w-[250px] bg-white flex flex-col overflow-y-auto z-[100] h-screen border-r border-[rgba(15,23,42,0.08)] fixed top-0 left-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'lg:translate-x-0 max-lg:-translate-x-full'}`}>

                {/* LOGO AREA */}
                <div className="px-[18px] pt-3 pb-2.5 border-b border-[rgba(15,23,42,0.08)] flex items-center gap-2.5">
                    <img
                        src={appLogo}
                        alt="1CrClub"
                        className="w-full max-w-[150px] max-h-[50px] h-auto block object-contain max-lg:max-w-[135px] max-lg:max-h-[44px]"
                    />
                </div>

                {/* NAVIGATION LINKS */}
                <nav className="flex-1 py-3 flex flex-col">
                    <NavGroup label="Overview" items={overviewItems} onClose={onClose} />
                    <NavGroup label="Portfolio" items={portfolioItems} onClose={onClose} />
                    <NavGroup label="Planning" items={planningItems} onClose={onClose} />
                    <NavGroup label="Tools" items={toolsItems} onClose={onClose} />
                    <NavGroup label="Account" items={accountItems} onClose={onClose} />
                </nav>

                {/* BOTTOM UPGRADE CARD */}
                <div className="px-3 py-3.5 border-t border-[rgba(15,23,42,0.08)]">
                    <div className="bg-gradient-to-br from-[rgba(45,122,79,0.12)] to-[rgba(45,122,79,0.05)] border border-[rgba(45,122,79,0.24)] rounded-[10px] p-3.5">
                        <div className="text-[11px] text-[#2D7A4F] font-bold tracking-[0.5px] uppercase mb-[3px]">
                            Upgrade to
                        </div>
                        <div className="text-[13px] font-bold text-[#183325] mb-0.5">
                            1CrClub PRO
                        </div>
                        <div className="text-[11px] text-[#183325A3] mb-2.5">
                            Advanced insights &amp; planning
                        </div>
                        <button className="w-full bg-[#245F3D] text-white border-0 rounded-[7px] py-[8px] text-[11px] font-bold uppercase tracking-[0.4px] cursor-pointer transition-colors duration-150 hover:bg-[#1E5033]">
                            Get Unlimited Access
                        </button>
                    </div>
                </div>

            </aside>
        </>
    );
}
