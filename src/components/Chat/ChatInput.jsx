import React from 'react';
import { Send, Mic } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
    const [text, setText] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() && !disabled) {
            onSend(text);
            setText('');
        }
    };

    return (
        <div className="chat-input-container">
            <form onSubmit={handleSubmit} className="chat-input-wrapper">
                <button type="button" className="action-btn" disabled={disabled}>
                    <Mic size={20} />
                </button>

                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={disabled ? "Bestiee is waking up..." : "Message Bestiee..."}
                    disabled={disabled}
                    className="chat-input-field"
                />

                <button
                    type="submit"
                    className={`send-btn ${text.trim() ? 'active' : ''}`}
                    disabled={!text.trim() || disabled}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatInput;
