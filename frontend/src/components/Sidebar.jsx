import React from 'react';
import { BarChart2, FileText, Bot, Clock, Code, BrainCircuit } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
    const navItems = [
        { id: 'dashboard', icon: BarChart2, label: 'Dashboard' },
        { id: 'analysis', icon: FileText, label: 'Document Analysis' },
        { id: 'chatbot', icon: Bot, label: 'Legal Chatbot' },
        { id: 'timeline', icon: Clock, label: 'Timeline Generator' },
        { id: 'skills', icon: Code, label: 'Skills & Stack' },
    ];
    return (
        <aside className="w-16 md:w-64 bg-gray-900 text-white flex flex-col transition-all duration-300">
            <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-800">
                <BrainCircuit className="h-8 w-8 text-indigo-400" />
                <h1 className="hidden md:block ml-3 text-xl font-bold tracking-wider">LAWYER AI</h1>
            </div>
            <nav className="flex-1 px-2 md:px-4 py-6">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setActivePage(item.id)} className={`w-full flex items-center justify-center md:justify-start p-3 my-2 rounded-lg transition-colors duration-200 ${activePage === item.id ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
                        <item.icon className="h-6 w-6" />
                        <span className="hidden md:block ml-4 font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-center md:justify-start">
                    <img src="https://placehold.co/40x40/7e22ce/ffffff?text=ME" alt="User" className="w-10 h-10 rounded-full" />
                    <div className="hidden md:block ml-3">
                        <p className="text-sm font-semibold">MEER MAISHA TABASSUM</p>
                        <p className="text-xs text-gray-400">ML Engineer</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;