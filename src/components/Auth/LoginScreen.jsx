import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import EmailAuthForm from './EmailAuthForm';

export default function LoginScreen() {
    const [showEmail, setShowEmail] = useState(false);
    const [consentTraining, setConsentTraining] = useState(false);
    const [consentTerms, setConsentTerms] = useState(false);
    const [error, setError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        // Detect redirect error in URL hash on mount
        if (window.location.hash) {
            try {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                if (hashParams.has('error') || hashParams.has('error_description')) {
                    const errName = hashParams.get('error') || 'auth_error';
                    const errDesc = decodeURIComponent(hashParams.get('error_description') || 'Google sign-in failed.');
                    setError(`Google Login Error: ${errDesc} (${errName})`);
                    
                    // Clean up URL hash so refreshing doesn't keep showing the error
                    window.history.replaceState(null, null, window.location.pathname);
                }
            } catch (e) {
                console.error('Error reading hash error:', e);
            }
        }
    }, []);

    const handleGoogle = async () => {
        if (!consentTerms) {
            setError('Please agree to the Terms & Privacy Policy to continue.');
            return;
        }
        setGoogleLoading(true);
        setError('');
        try {
            // Store consent preference before redirect
            localStorage.setItem('bestiee_consent_training', consentTraining ? 'true' : 'false');
            await authService.signInWithGoogle();
        } catch (e) {
            setError(e.message || 'Google sign-in failed. Try again.');
            setGoogleLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'var(--bg-base)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', zIndex: 9999,
            overflow: 'auto',
        }}>
            {/* Soft background blobs */}
            <div style={{
                position: 'fixed', top: '-20%', right: '-10%',
                width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(255,182,193,0.3) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed', bottom: '-10%', left: '-10%',
                width: '350px', height: '350px',
                background: 'radial-gradient(circle, rgba(216,180,254,0.25) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                    background: 'var(--modal-bg)',
                    borderRadius: '28px',
                    padding: '2.5rem 2rem',
                    width: '100%', maxWidth: '400px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                    border: '1px solid var(--border-primary)',
                    position: 'relative', zIndex: 1,
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        style={{ fontSize: '52px', display: 'block', marginBottom: '0.75rem' }}
                    >
                        🎀
                    </motion.div>
                    <h1 style={{ margin: '0 0 0.4rem', color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 700 }}>
                        Welcome to Bestiee
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                        Your emotionally intelligent AI best friend 💖
                    </p>
                </div>

                {!showEmail ? (
                    <>
                        {/* Consent checkboxes */}
                        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={consentTerms}
                                    onChange={e => { setConsentTerms(e.target.checked); setError(''); }}
                                    style={{ marginTop: '3px', accentColor: 'var(--accent)', width: '16px', height: '16px', flexShrink: 0 }}
                                />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    I agree to the <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Privacy Policy</span> <span style={{ color: '#e74c3c' }}>*</span>
                                </span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={consentTraining}
                                    onChange={e => setConsentTraining(e.target.checked)}
                                    style={{ marginTop: '3px', accentColor: 'var(--accent)', width: '16px', height: '16px', flexShrink: 0 }}
                                />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Help improve Bestiee</span> — share anonymous conversations to make the AI smarter (optional, you can change this anytime)
                                </span>
                            </label>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center', background: 'rgba(231,76,60,0.08)', padding: '0.5rem 1rem', borderRadius: '8px' }}
                            >
                                {error}
                            </motion.p>
                        )}

                        {/* Google Sign In */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGoogle}
                            disabled={googleLoading}
                            style={{
                                width: '100%', padding: '0.9rem 1rem',
                                borderRadius: '14px', border: '1.5px solid var(--border-divider)',
                                background: 'var(--bg-active)', color: 'var(--text-primary)',
                                fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem',
                                marginBottom: '0.75rem', transition: 'all 0.2s',
                                opacity: googleLoading ? 0.7 : 1,
                            }}
                        >
                            {googleLoading ? '⏳ Redirecting...' : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </motion.button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-divider)' }} />
                            <span style={{ color: 'var(--text-placeholder)', fontSize: '0.8rem' }}>or</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-divider)' }} />
                        </div>

                        {/* Email Sign In */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (!consentTerms) { setError('Please agree to the Terms & Privacy Policy to continue.'); return; }
                                setError('');
                                setShowEmail(true);
                            }}
                            style={{
                                width: '100%', padding: '0.9rem 1rem',
                                borderRadius: '14px', border: 'none',
                                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
                                color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem',
                            }}
                        >
                            ✉️ Continue with Email
                        </motion.button>
                    </>
                ) : (
                    <EmailAuthForm
                        consentTraining={consentTraining}
                        onBack={() => setShowEmail(false)}
                    />
                )}
            </motion.div>
        </div>
    );
}
