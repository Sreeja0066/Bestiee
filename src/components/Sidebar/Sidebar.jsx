import React, { useState } from 'react';
import { Menu, X, MessageSquare, Heart, Star, Settings, Search, Clock } from 'lucide-react';
import { useLocalLLM } from '../../hooks/useLocalLLM';

const Sidebar = ({ currentView, onViewChange, isOpen, setIsOpen }) => {
    const { logout, createNewChat, pastChats, loadChat } = useLocalLLM();

    // Helper to close on mobile when navigating
    const navigate = (view) => {
        onViewChange(view);
        setIsOpen(false);
    };

    const handleNewChat = () => {
        createNewChat();
        navigate('chat');
    };

    const handleLogout = () => {
        if (confirm("Reset API Key? You'll need to enter it again.")) {
            logout();
            window.location.reload();
        }
    };

    return (
        <>
            {/* Removed internal mobile-header to avoid duplicates */}
            <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button
                    className="mobile-close-btn"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        display: isOpen ? 'block' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} color="#666" />
                </button>

                <div className="sidebar-header">
                    <span style={{ fontSize: '24px' }}>🎀</span>
                    <h1 className="brand-title">Bestiee</h1>
                </div>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                    />
                    <Search
                        size={16}
                        color="#999"
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                </div>

                <button className="new-chat-btn" onClick={handleNewChat}>
                    <MessageSquare size={20} />
                    New Chat
                </button>

                <div className="sidebar-menu">
                    <div
                        className={`menu-item ${currentView === 'chat' ? 'active' : ''}`}
                        onClick={() => navigate('chat')}
                    >
                        <MessageSquare size={18} /> Chat
                    </div>
                    <div
                        className={`menu-item ${currentView === 'vent' ? 'active' : ''}`}
                        onClick={() => navigate('vent')}
                    >
                        🥊 Vent Arena
                    </div>
                    <div className="menu-item">
                        <Heart size={18} /> Memories
                    </div>
                    <div className="menu-item">
                        <Star size={18} /> Favorites
                    </div>

                    {pastChats && pastChats.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#999', padding: '0 1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Saved Chats
                            </div>
                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {pastChats.map(chat => (
                                    <div
                                        key={chat.id}
                                        className="menu-item"
                                        onClick={() => {
                                            loadChat(chat.id);
                                            navigate('chat');
                                        }}
                                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                    >
                                        <Clock size={16} />
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                                            {chat.preview || 'Old Chat'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                        <div className="menu-item" onClick={handleLogout} style={{ color: '#999' }}>
                            <Settings size={18} /> Reset/Settings
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
