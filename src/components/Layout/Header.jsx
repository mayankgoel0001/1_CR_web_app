import { MdRefresh, MdNotificationsNone, MdAutoAwesome, MdMenu } from 'react-icons/md';
import { getGreeting, userData } from '../../data/mockData';
import './Header.css';

export default function Header({ onMenuClick }) {
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
                <div className="header-avatar" title="Profile">
                    {userData.firstName[0]}{userData.lastName[0]}
                </div>
            </div>
        </header>
    );
}
