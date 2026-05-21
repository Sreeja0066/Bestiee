import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocalLLM } from '../../hooks/useLocalLLM';

const ApiKeyModal = () => {
    const { apiKey, setApiKey } = useLocalLLM();
    const [inputKey, setInputKey] = useState('');
    const [status, setStatus] = useState('idle'); // idle, validating, success, error

    // If we already have a key, don't show the modal
    if (apiKey) return null;

    const handleSave = async () => {
        if (!inputKey.trim()) return;
        setStatus('validating');

        try {
            // Simple validation ping to Groq
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${inputKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages: [{ role: 'user', content: 'ping' }],
                    max_tokens: 1
                })
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    setApiKey(inputKey);
                }, 1000);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    return (
        <div className="api-modal-overlay" style={{
            position: 'fixed', inset: 0, background: 'var(--modal-overlay)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="api-modal" style={{
                background: 'var(--modal-bg)', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '400px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center',
                border: '1px solid var(--border-primary)'
            }}>
                <div style={{
                    width: '60px', height: '60px', background: 'var(--bg-active)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                }}>
                    <Key color="var(--accent)" size={30} />
                </div>

                <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Unlock Bestiee</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    To make Bestiee fast and crash-free, we need a free GPU key.
                </p>

                <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                        Enter Groq API Key
                    </label>
                    <input
                        type="password"
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        placeholder="gsk_..."
                        style={{
                            width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border-divider)',
                            fontSize: '1rem', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)'
                        }}
                    />
                    {status === 'error' && (
                        <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={14} /> Invalid Key. Please check and try again.
                        </p>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    disabled={status === 'validating' || !inputKey}
                    style={{
                        width: '100%', padding: '1rem', borderRadius: '14px', border: 'none',
                        background: status === 'success' ? '#4CAF50' : 'var(--accent)', color: 'white',
                        fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    {status === 'validating' ? 'Checking...' : status === 'success' ? 'Success!' : 'Start Chatting'}
                    {status === 'success' && <CheckCircle size={20} />}
                </button>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-divider)' }}>
                    <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        Get a free key here <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
