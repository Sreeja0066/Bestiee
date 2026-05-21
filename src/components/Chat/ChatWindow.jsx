import React, { useEffect, useRef } from "react";
import { useLocalLLM } from "../../hooks/useLocalLLM";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import Avatar from "../Avatar/Avatar";
import { Menu } from "lucide-react";

export default function ChatWindow({ onOpenSidebar }) {
    const {
        messages,
        sendMessage,
        initialize,
        isReady,
        isLoading,
        loadingText,
        progress
    } = useLocalLLM();

    const messagesEndRef = useRef(null);

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        // Tiny timeout to ensure DOM is updated
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
    }, [messages, isLoading]); // Also scroll when loading state changes (e.g. typing indicator appearing)

    const handleSend = async (text) => {
        await sendMessage(text);
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                {/* Mobile Menu Button - Visible < 768px via CSS */}
                <button
                    className="mobile-menu-btn"
                    onClick={onOpenSidebar}
                    style={{
                        background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                        display: 'none' // Hidden by default, shown via CSS query
                    }}
                >
                    <Menu size={24} color="var(--accent-deep)" />
                </button>

                <Avatar size="md" />
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Bestiee</h3>
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent)' }}>
                                {loadingText} ({Math.round(progress)}%)
                            </p>
                            <div style={{ width: '100px', height: '4px', background: 'var(--progress-track)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
                            </div>
                        </div>
                    ) : (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Always here for you ✨</p>
                    )}
                </div>
            </div>

            <div className="chat-content">
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-faint)' }}>
                        <p>Say hi to your new best friend! ✨</p>
                        {!isReady && <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>(Brain is loading in the background...)</p>}
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <MessageBubble key={idx} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={handleSend} disabled={!isReady} />
        </div>
    );
}
