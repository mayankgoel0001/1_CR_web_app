import { useState, useRef, useEffect } from 'react';
import { MdRefresh, MdNotificationsNone, MdAutoAwesome, MdMenu } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getGreeting, userData } from '../../data/mockData';
import './Header.css';

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
        <header className="header">
            <div className="header-left">
                <button className="mobile-menu-btn" onClick={onMenuClick}>
                    <MdMenu />
                </button>
                <div className="header-greeting">
                    <MdAutoAwesome className="header-greeting-icon" />
                    <span>{getGreeting()}, {userData.firstName}</span>
                </div>
            </div>
            <div className="header-actions">
                <button className="header-action-btn" title="Refresh">
                    <MdRefresh />
                </button>
                <button className="header-action-btn" title="Notifications">
                    <MdNotificationsNone />
                </button>
                <div className="header-avatar-wrap" ref={dropdownRef}>
                    <div
                        className={`header-avatar ${dropdownOpen ? 'active' : ''}`}
                        title="Profile"
                        onClick={() => setDropdownOpen(o => !o)}
                    >
                        {userData.firstName[0]}{userData.lastName[0]}
                    </div>
                    {dropdownOpen && (
                        <div className="header-dropdown">
                            <div className="header-dropdown-user">
                                <div className="header-dropdown-avatar">{userData.firstName[0]}{userData.lastName[0]}</div>
                                <div>
                                    <div className="header-dropdown-name">{userData.firstName} {userData.lastName}</div>
                                    <div className="header-dropdown-email">{userData.email}</div>
                                </div>
                            </div>
                            <div className="header-dropdown-divider" />
                            <button className="header-dropdown-item" onClick={() => go('/profile')}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                Profile
                            </button>
                            <button className="header-dropdown-item" onClick={() => go('/settings')}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                Settings
                            </button>
                            <div className="header-dropdown-divider" />
                            <button className="header-dropdown-item header-dropdown-signout" onClick={() => setDropdownOpen(false)}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
