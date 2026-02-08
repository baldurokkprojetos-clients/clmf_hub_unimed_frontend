import React from 'react';
import Sidebar from '../components/Sidebar';

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-background text-text-primary flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
