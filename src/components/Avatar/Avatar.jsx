import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalLLM } from '../../hooks/useLocalLLM';

const emotions = {
    happy: { color: '#FF69B4', text: '✨', scale: 1.2, bounce: 0.8 },
    sad: { color: '#87CEEB', text: '🥺', scale: 0.9, bounce: 0.2 },
    angry: { color: '#FF4500', text: '😤', scale: 1.1, bounce: 0.1 },
    concerned: { color: '#9370DB', text: '😟', scale: 1, bounce: 0.3 },
    neutral: { color: '#FFB6C1', text: '🎀', scale: 1, bounce: 0.5 },
};

const Avatar = ({ size = 'md' }) => {
    const { currentEmotion } = useLocalLLM();
    const state = emotions[currentEmotion] || emotions.neutral;

    const sizePx = size === 'lg' ? 120 : size === 'md' ? 60 : 40;

    return (
        <div style={{ position: 'relative', width: sizePx, height: sizePx }}>
            {/* Background Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    inset: -10,
                    borderRadius: '50%',
                    background: state.color,
                    filter: 'blur(20px)',
                    zIndex: 0
                }}
            />

            {/* Main Avatar Body */}
            <motion.div
                animate={{
                    y: [0, -10 * state.bounce, 0],
                    scale: state.scale
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    background: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: sizePx * 0.5,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={state.text}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {state.text}
                    </motion.span>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Avatar;
