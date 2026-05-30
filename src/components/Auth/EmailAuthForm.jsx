import React, { useState } from 'react';
import { motion } from 'framer-motion';
import authService from '../../services/authService';

export default function EmailAuthForm({ consentTraining, onBack }) {
    const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { user } = await authService.signUpWithEmail(email, password, name);
                // Save consent after signup
                if (user) {
                    localStorage.setItem('bestiee_consent_training', consentTraining ? 'true' : 'false');
                    await authService.saveConsent(user.id, consentTraining);
                }
                setSuccess('Check your email for a confirmation link! 📬');
            } else {
                await authService.signInWithEmail(email, password);
                // Auth state change in context will handle the rest
            }
        } catch (e) {
            setError(e.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.85rem 1rem',
        borderRadius: '12px', border: '1.5px solid var(--border-divider)',
        background: 'var(--bg-input)', color: 'var(--text-primary)',
        fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    return (
        <div>
            {/* Back button */}
            <button
                onClick={onBack}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem', padding: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
                ← Back
            </button>

            {/* Toggle sign in / sign up */}
            <div style={{ display: 'flex', background: 'var(--bg-active)', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' }}>
                {['signin', 'signup'].map(m => (
                    <button
                        key={m}
                        onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                        style={{
                            flex: 1, padding: '0.6rem', borderRadius: '9px', border: 'none',
                            background: mode === m ? 'var(--modal-bg)' : 'transparent',
                            color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
                            fontWeight: mode === m ? 700 : 400, cursor: 'pointer',
                            transition: 'all 0.2s', fontSize: '0.9rem',
                            boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        }}
                    >
                        {m === 'signin' ? 'Sign In' : 'Sign Up'}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mode === 'signup' && (
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                )}
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={inputStyle}
                />

                {error && (
                    <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: 0, background: 'rgba(231,76,60,0.08)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                        {error}
                    </p>
                )}
                {success && (
                    <p style={{ color: '#27ae60', fontSize: '0.85rem', margin: 0, background: 'rgba(39,174,96,0.08)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                        {success}
                    </p>
                )}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0.9rem', borderRadius: '14px', border: 'none',
                        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
                        color: 'white', fontSize: '1rem', fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1, marginTop: '0.25rem',
                    }}
                >
                    {loading ? '⏳ Please wait...' : mode === 'signin' ? '🔑 Sign In' : '🎀 Create Account'}
                </motion.button>
            </form>
        </div>
    );
}
