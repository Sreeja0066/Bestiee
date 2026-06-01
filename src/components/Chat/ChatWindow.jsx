import React, { useEffect, useRef } from "react";
import { useLocalLLM } from "../../hooks/useLocalLLM";
import { useAuth } from "../../context/AuthContext";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import Avatar from "../Avatar/Avatar";
import OfflineBadge from "../OfflineBadge/OfflineBadge";
import { Menu } from "lucide-react";

export default function ChatWindow({ onOpenSidebar }) {
    const {
        messages,
        sendMessage,
        isReady,
        isLoading,
        loadingText,
        progress,
        apiKey,
    } = useLocalLLM();

    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
    }, [messages, isLoading]);

    const handleSend = async (text) => {
        await sendMessage(text);
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                {/* Mobile menu button */}
                <button
                    className="mobile-menu-btn"
                    onClick={onOpenSidebar}
                    style={{
                        background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                        display: 'none'
                    }}
                >
                    <Menu size={24} color="var(--accent-deep)" />
                </button>

                <Avatar size="md" />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Bestiee</h3>
                        <OfflineBadge />
                    </div>
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent)' }}>
                                {loadingText} {progress > 0 ? `(${Math.round(progress)}%)` : ''}
                            </p>
                            {progress > 0 && (
                                <div style={{ width: '120px', height: '4px', background: 'var(--progress-track)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Always here for you ✨
                        </p>
                    )}
                </div>
            </div>

            <div className="chat-content">
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-faint)' }}>
                        <p>Say hi to your new best friend! ✨</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <MessageBubble key={idx} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={handleSend} disabled={!isReady || isLoading} />
        </div>
    );
}
