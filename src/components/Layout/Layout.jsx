import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col ml-[250px] w-[calc(100%-250px)] max-lg:ml-0 max-lg:w-full">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="mt-[64px] p-xl min-h-[calc(100vh-64px)] max-lg:p-md max-sm:p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
