import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PermissionGate({ onDone }) {
    const [step, setStep] = useState(0); // 0 = storage, 1 = notifications, 2 = done
    const [storageGranted, setStorageGranted] = useState(false);
    const [notifGranted, setNotifGranted] = useState(false);

    useEffect(() => {
        // Check if we've already done this
        if (localStorage.getItem('bestiee_permissions_done') === 'true') {
            onDone();
        }
    }, []);

    const requestStorage = async () => {
        try {
            const result = await navigator.storage?.persist();
            setStorageGranted(result ?? true);
        } catch {
            setStorageGranted(true); // proceed anyway
        }
        setStep(1);
    };

    const requestNotifications = async () => {
        try {
            const result = await Notification.requestPermission();
            setNotifGranted(result === 'granted');
        } catch {
            setNotifGranted(false);
        }
        finish();
    };

    const skipNotifications = () => finish();

    const finish = () => {
        localStorage.setItem('bestiee_permissions_done', 'true');
        onDone();
    };

    const steps = [
        {
            icon: '💾',
            title: 'Keep my memories safe',
            desc: 'Allow Bestiee to protect your chat history from being deleted when your phone is low on storage.',
            primary: { label: '💾 Keep my chats safe', action: requestStorage },
            secondary: null,
        },
        {
            icon: '🔔',
            title: 'Check in on you?',
            desc: 'Let Bestiee send you gentle reminders and check-ins when you need a friend.',
            primary: { label: '🔔 Yes, check in on me', action: requestNotifications },
            secondary: { label: 'Not now', action: skipNotifications },
        },
    ];

    if (step >= steps.length) return null;
    const current = steps[step];

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9998, padding: '1.5rem',
        }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -20 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{
                        background: 'var(--modal-bg)',
                        borderRadius: '28px', padding: '2.5rem 2rem',
                        width: '100%', maxWidth: '380px', textAlign: 'center',
                        boxShadow: '0 30px 70px rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-primary)',
                    }}
                >
                    {/* Step dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1.5rem' }}>
                        {steps.map((_, i) => (
                            <div key={i} style={{
                                width: i === step ? '20px' : '6px', height: '6px',
                                borderRadius: '3px',
                                background: i <= step ? 'var(--accent)' : 'var(--border-divider)',
                                transition: 'all 0.3s',
                            }} />
                        ))}
                    </div>

                    <div style={{ fontSize: '52px', marginBottom: '1rem' }}>{current.icon}</div>
                    <h2 style={{ margin: '0 0 0.75rem', color: 'var(--text-primary)', fontSize: '1.4rem' }}>
                        {current.title}
                    </h2>
                    <p style={{ margin: '0 0 2rem', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        {current.desc}
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={current.primary.action}
                        style={{
                            width: '100%', padding: '0.9rem',
                            borderRadius: '14px', border: 'none',
                            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
                            color: 'white', fontSize: '1rem', fontWeight: 700,
                            cursor: 'pointer', marginBottom: '0.75rem',
                        }}
                    >
                        {current.primary.label}
                    </motion.button>

                    {current.secondary && (
                        <button
                            onClick={current.secondary.action}
                            style={{
                                background: 'none', border: 'none',
                                color: 'var(--text-placeholder)', cursor: 'pointer',
                                fontSize: '0.9rem', padding: '0.5rem',
                            }}
                        >
                            {current.secondary.label}
                        </button>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
