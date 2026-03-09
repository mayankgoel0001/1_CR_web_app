import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="layout-wrapper">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="layout-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
