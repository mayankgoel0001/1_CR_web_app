import { useState, useRef, useEffect } from 'react';
import { MdRefresh, MdNotificationsNone, MdAutoAwesome, MdMenu } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getGreeting, userData } from '../../data/mockData';

export default function Header({ onMenuClick }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const go = (path) => { setDropdownOpen(false); navigate(path); };

    return (
        <header className="fixed top-0 left-[250px] right-0 h-[64px] bg-white border-b border-[#F0F0F0] flex items-center justify-between px-xl z-[90] max-lg:left-0 max-lg:px-md max-sm:px-4">
            <div className="flex items-center gap-sm">
                <button
                    className="hidden max-lg:flex items-center justify-center text-2xl text-text p-xs mr-xs"
                    onClick={onMenuClick}
                >
                    <MdMenu />
                </button>
                <div className="flex items-center gap-sm text-[15px] font-bold text-[#0D1F17] max-lg:text-[14px]">
                    <MdAutoAwesome className="text-[#2D7A4F] text-[1.2rem] max-lg:hidden" />
                    <span className="truncate">{getGreeting()}, {userData.firstName}</span>
                </div>
            </div>

            <div className="flex items-center gap-md max-sm:gap-xs">
                <button
                    className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-text-secondary text-[1.2rem] transition-all duration-150 border border-[#F0F0F0] bg-white hover:bg-bg hover:text-text"
                    title="Refresh"
                >
                    <MdRefresh />
                </button>
                <button
                    className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-text-secondary text-[1.2rem] transition-all duration-150 border border-[#F0F0F0] bg-white hover:bg-bg hover:text-text"
                    title="Notifications"
                >
                    <MdNotificationsNone />
                </button>

                <div className="relative" ref={dropdownRef}>
                    <div
                        className={`w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#2D7A4F] to-[#1a3a28] flex items-center justify-center text-white font-bold text-[13px] cursor-pointer border-2 border-[#E8F5EE] transition-shadow duration-150 select-none ${dropdownOpen ? 'shadow-[0_0_0_3px_rgba(45,122,79,0.15)]' : ''} hover:shadow-[0_0_0_3px_rgba(45,122,79,0.15)]`}
                        title="Profile"
                        onClick={() => setDropdownOpen(o => !o)}
                    >
                        {userData.firstName[0]}{userData.lastName[0]}
                    </div>

                    {dropdownOpen && (
                        <div className="absolute top-[calc(100%+10px)] right-0 w-[240px] bg-white border border-[#F0F0F0] rounded-[14px] shadow-dropdown overflow-hidden z-[200] animate-dropdown">
                            <div className="flex items-center gap-2.5 px-4 py-3.5">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D7A4F] to-[#1a3a28] flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0">
                                    {userData.firstName[0]}{userData.lastName[0]}
                                </div>
                                <div>
                                    <div className="text-[14px] font-bold text-[#0D1F17]">{userData.firstName} {userData.lastName}</div>
                                    <div className="text-[11px] text-[#8FA99C] mt-[2px]">{userData.email}</div>
                                </div>
                            </div>
                            <div className="h-px bg-[#F0F0F0] my-0.5" />
                            <button
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-transparent border-none text-[13px] font-bold text-[#0D1F17] cursor-pointer text-left transition-colors duration-[120ms] hover:bg-[#F0F4F1]"
                                onClick={() => go('/profile')}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                Profile
                            </button>
                            <button
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-transparent border-none text-[13px] font-bold text-[#0D1F17] cursor-pointer text-left transition-colors duration-[120ms] hover:bg-[#F0F4F1]"
                                onClick={() => go('/settings')}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                Settings
                            </button>
                            <div className="h-px bg-[#F0F0F0] my-0.5" />
                            <button
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-transparent border-none text-[13px] font-bold text-[#EF4444] cursor-pointer text-left transition-colors duration-[120ms] hover:bg-[#FEF2F2]"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
