import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import VentArena from "../components/VentArena/VentArena";
import LoginScreen from "../components/Auth/LoginScreen";
import PermissionGate from "../components/Permissions/PermissionGate";
import useThemeStore from "../hooks/useTheme";
import MoodBackground from "../components/MoodBackground/MoodBackground";
import MoodNotification from "../components/MoodNotification/MoodNotification";
import { useLocalLLM } from "../hooks/useLocalLLM";
import authService from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/theme.css";

function AppContent() {
    const [view, setView] = useState('chat');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showPermissions, setShowPermissions] = useState(false);
    const initTheme = useThemeStore(s => s.initTheme);
    const { user, loading } = useAuth();
    const { initialize, loadPastChats } = useLocalLLM();

    useEffect(() => {
        initTheme();
    }, []);

    // When user logs in, initialize data layer
    useEffect(() => {
        if (user) {
            initialize(user.id);
            loadPastChats(user.id);
            // Show permissions only once
            const permsDone = localStorage.getItem('bestiee_permissions_done');
            if (!permsDone) setShowPermissions(true);

            // Save consent from pre-login storage
            const consentPending = localStorage.getItem('bestiee_consent_training');
            if (consentPending !== null) {
                authService.saveConsent(user.id, consentPending === 'true');
                localStorage.removeItem('bestiee_consent_training');
            }
        }
    }, [user]);

    // Loading spinner
    if (loading) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'var(--bg-base)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
            }}>
                <div style={{ fontSize: '48px', animation: 'spin 2s linear infinite' }}>🎀</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading Bestiee...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Not logged in — show login screen
    if (!user) return <LoginScreen />;

    // Logged in — show app
    return (
        <div className="app-layout">
            <MoodBackground />
            <MoodNotification onViewChange={setView} />

            {/* Permission gate — shows once after first login */}
            {showPermissions && (
                <PermissionGate onDone={() => setShowPermissions(false)} />
            )}

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

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
