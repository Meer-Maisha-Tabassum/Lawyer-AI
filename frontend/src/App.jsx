import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase/config';

// Import Pages and Components
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DocumentAnalysis from './pages/DocumentAnalysis';
import LegalChatbot from './pages/LegalChatbot';
import TimelineGenerator from './pages/TimelineGenerator';
import Skills from './pages/Skills';


export default function App() {
    const [activePage, setActivePage] = useState('dashboard');
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                setIsAuthReady(true);
            } else {
                signInAnonymously(auth).catch((error) => {
                    console.error("Anonymous sign-in failed:", error);
                    setIsAuthReady(true);
                });
            }
        });
        return () => unsubscribe();
    }, []);

    const renderPage = () => {
        if (!isAuthReady) {
            return <div className="w-full h-full flex justify-center items-center"><Loader className="w-16 h-16 animate-spin text-indigo-600" /></div>;
        }
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'analysis': return <DocumentAnalysis userId={userId} isAuthReady={isAuthReady} />;
            case 'chatbot': return <LegalChatbot userId={userId} isAuthReady={isAuthReady} />;
            case 'timeline': return <TimelineGenerator userId={userId} isAuthReady={isAuthReady} />;
            case 'skills': return <Skills />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-100 flex font-sans">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={activePage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="h-full">
                            {renderPage()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}