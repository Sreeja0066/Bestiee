import React from 'react';
import { Menu, X, MessageSquare, Heart, Star, Settings, Search, Clock, Sun, Moon, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useLocalLLM } from '../../hooks/useLocalLLM';
import { useAuth } from '../../context/AuthContext';
import useThemeStore from '../../hooks/useTheme';

const Sidebar = ({ currentView, onViewChange, isOpen, setIsOpen }) => {
    const { createNewChat, pastChats, loadSessionMessages, deleteSession, isOnline, webllmReady, webllmProgress, aiMode } = useLocalLLM();
    const { theme, toggleTheme } = useThemeStore();
    const { user, signOut } = useAuth();

    const navigate = (view) => {
        onViewChange(view);
        setIsOpen(false);
    };

    const handleNewChat = () => {
        createNewChat();
        navigate('chat');
    };

    const handleLogout = async () => {
        if (confirm("Sign out of Bestiee?")) {
            await signOut();
            window.location.reload();
        }
    };

    const handleLoadChat = (session) => {
        loadSessionMessages(session.id);
        navigate('chat');
    };

    // Get display name from user object
    const displayName = user?.user_metadata?.full_name
        || user?.user_metadata?.name
        || user?.email?.split('@')[0]
        || 'Bestie';
    const avatarUrl = user?.user_metadata?.avatar_url;
    const initial = displayName[0]?.toUpperCase();

    return (
        <>
            <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button
                    className="mobile-close-btn"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'none', border: 'none',
                        display: isOpen ? 'block' : 'none', cursor: 'pointer'
                    }}
                >
                    <X size={24} color="var(--text-muted)" />
                </button>

                {/* Brand header */}
                <div className="sidebar-header">
                    <span style={{ fontSize: '24px' }}>🎀</span>
                    <h1 className="brand-title">Bestiee</h1>
                </div>

                {/* User profile card */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.7rem',
                    padding: '0.75rem 1rem', margin: '0 0.5rem',
                    background: 'var(--bg-active)', borderRadius: '14px',
                    marginBottom: '0.75rem',
                }}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                        }}>
                            {initial}
                        </div>
                    )}
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {displayName}
                        </p>
                        {/* Online/Offline + AI mode indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            {isOnline
                                ? <Wifi size={10} color="#34c759" />
                                : <WifiOff size={10} color="#ff9500" />
                            }
                            <span style={{ fontSize: '0.7rem', color: isOnline ? '#34c759' : '#ff9500' }}>
                                {isOnline ? 'Online · Bestiee AI' : `Offline · Local AI${!webllmReady ? ` (${webllmProgress}%)` : ''}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="search-bar">
                    <input type="text" placeholder="Search..." className="search-input" />
                    <Search size={16} color="var(--text-placeholder)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                <button className="new-chat-btn" onClick={handleNewChat}>
                    <MessageSquare size={20} />
                    New Chat
                </button>

                <div className="sidebar-menu">
                    <div className={`menu-item ${currentView === 'chat' ? 'active' : ''}`} onClick={() => navigate('chat')}>
                        <MessageSquare size={18} /> Chat
                    </div>
                    <div className={`menu-item ${currentView === 'vent' ? 'active' : ''}`} onClick={() => navigate('vent')}>
                        🥊 Vent Arena
                    </div>
                    <div className="menu-item">
                        <Heart size={18} /> Memories
                    </div>
                    <div className="menu-item">
                        <Star size={18} /> Favorites
                    </div>

                    {/* Theme toggle */}
                    <div className="theme-toggle-wrapper" onClick={toggleTheme}>
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                        <div className="theme-toggle-track">
                            <div className="theme-toggle-thumb" />
                        </div>
                    </div>

                    {/* Past chat sessions */}
                    {pastChats && pastChats.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-placeholder)', padding: '0 1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Recent Chats
                            </div>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {pastChats.map(session => (
                                    <div
                                        key={session.id}
                                        className="menu-item"
                                        onClick={() => handleLoadChat(session)}
                                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Clock size={14} style={{ flexShrink: 0 }} />
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                                            {session.title || 'Chat'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom actions */}
                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-divider)', paddingTop: '10px' }}>
                        <div className="menu-item" onClick={handleLogout} style={{ color: 'var(--text-placeholder)' }}>
                            <LogOut size={18} /> Sign Out
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
