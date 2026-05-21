import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import VentArena from "../components/VentArena/VentArena";
import useThemeStore from "../hooks/useTheme";
import MoodBackground from "../components/MoodBackground/MoodBackground";
import MoodNotification from "../components/MoodNotification/MoodNotification";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/theme.css";

export default function App() {
    const [view, setView] = useState('chat'); // 'chat' | 'vent'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const initTheme = useThemeStore(s => s.initTheme);

    useEffect(() => {
        initTheme();
    }, []);

    return (
        <div className="app-layout">
            <MoodBackground />
            <MoodNotification onViewChange={setView} />
            <Sidebar
                currentView={view}
                onViewChange={setView}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                    {view === 'chat' && (
                        <motion.div 
                            key="chat"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <ChatWindow onOpenSidebar={() => setIsSidebarOpen(true)} />
                        </motion.div>
                    )}
                    {view === 'vent' && (
                        <motion.div 
                            key="vent"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <VentArena onOpenSidebar={() => setIsSidebarOpen(true)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
