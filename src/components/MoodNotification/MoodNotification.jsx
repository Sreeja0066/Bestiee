import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalLLM } from '../../hooks/useLocalLLM';
import { MOOD_CONFIGS, getRandomMessage, CONGRATS_MESSAGES } from '../../brain/emotionEngine';
import { X, ArrowRight, Zap, Heart, Info } from 'lucide-react';

const MoodNotification = ({ onViewChange }) => {
    const { currentEmotion, messages } = useLocalLLM();
    const config = MOOD_CONFIGS[currentEmotion] || MOOD_CONFIGS.neutral;
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [lastEmotion, setLastEmotion] = useState(null);

    useEffect(() => {
        if (currentEmotion && currentEmotion !== lastEmotion && currentEmotion !== 'neutral') {
            let nextMessage = getRandomMessage(currentEmotion);
            
            // Special celebration for happy/achieved moments
            if (currentEmotion === 'happy') {
                const lastUserMsg = messages[messages.length - 2]?.content?.toLowerCase() || "";
                const isAchievement = /\b(won|finished|done|achieved|graduated|got the job|passed|successful)\b/i.test(lastUserMsg);
                
                if (isAchievement) {
                    nextMessage = CONGRATS_MESSAGES[Math.floor(Math.random() * CONGRATS_MESSAGES.length)];
                }
            }
            
            if (nextMessage) {
                setMessage(nextMessage);
                setIsVisible(true);
                setLastEmotion(currentEmotion);
                
                // Auto-dismiss after 8 seconds (longer for encouragement)
                const timer = setTimeout(() => {
                    setIsVisible(false);
                }, 8000);
                
                return () => clearTimeout(timer);
            }
        }
    }, [currentEmotion, lastEmotion]);

    const handleActionClick = () => {
        if (config.suggestVentRoom && onViewChange) {
            onViewChange('vent');
            setIsVisible(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: 350, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 350, opacity: 0, scale: 0.8 }}
                    transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        right: '25px',
                        width: '320px',
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        padding: '20px',
                        boxShadow: `0 15px 45px rgba(0,0,0,0.1), 0 0 20px ${config.glowColor}`,
                        zIndex: 1000,
                        border: `1px solid ${config.particleColors[0]}44`,
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ 
                                width: '45px', 
                                height: '45px', 
                                background: `linear-gradient(135deg, ${config.particleColors[0]}, ${config.particleColors[1] || config.particleColors[0]})`,
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: `0 4px 15px ${config.particleColors[0]}66`
                            }}
                        >
                            {currentEmotion === 'angry' ? <Zap size={24} /> : 
                             currentEmotion === 'sad' ? <Heart size={24} /> : 
                             <Info size={24} />}
                        </motion.div>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '5px', color: 'var(--text-primary)' }}>
                                {config.toastTitle || "Bestiee Thoughts"}
                            </div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '15px' }}>
                                {message}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {config.suggestVentRoom ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleActionClick}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: 'var(--accent-gradient)',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            boxShadow: '0 4px 12px var(--accent-glow)'
                                        }}
                                    >
                                        Go to Vent Room <ArrowRight size={14} />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsVisible(false)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: 'var(--bg-hover)',
                                            color: 'var(--accent-deep)',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Sweet, thanks!
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsVisible(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '5px',
                                cursor: 'pointer',
                                color: 'var(--text-placeholder)',
                                position: 'absolute',
                                top: '10px',
                                right: '10px'
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MoodNotification;
