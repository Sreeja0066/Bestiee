import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`message-wrapper ${isUser ? 'user' : 'ai'}`}
        >
            {!isUser && (
                <div className="avatar-small">
                    🎀
                </div>
            )}

            <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
                {message.content}
            </div>

            {isUser && (
                <div className="avatar-small user">
                    👤
                </div>
            )}
        </motion.div>
    );
};

export default MessageBubble;
