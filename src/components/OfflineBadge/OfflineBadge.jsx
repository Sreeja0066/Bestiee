import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBadge() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setSyncing(true);
            setTimeout(() => setSyncing(false), 3000);
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Don't show anything when online and not syncing
    if (isOnline && !syncing) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 10px', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: 600,
                    background: syncing
                        ? 'rgba(52, 199, 89, 0.15)'
                        : 'rgba(255, 149, 0, 0.15)',
                    color: syncing ? '#34c759' : '#ff9500',
                    border: `1px solid ${syncing ? 'rgba(52,199,89,0.3)' : 'rgba(255,149,0,0.3)'}`,
                }}
            >
                <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: syncing ? '#34c759' : '#ff9500',
                    animation: syncing ? 'pulse 1s infinite' : 'none',
                }} />
                {syncing ? '🔄 Syncing...' : '🟠 Offline Mode'}
            </motion.div>
        </AnimatePresence>
    );
}
