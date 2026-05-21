import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalLLM } from '../../hooks/useLocalLLM';
import { MOOD_CONFIGS, generateParticles } from '../../brain/emotionEngine';

const MoodBackground = () => {
    const { currentEmotion } = useLocalLLM();
    const config = MOOD_CONFIGS[currentEmotion] || MOOD_CONFIGS.neutral;
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Regenerate particles when emotion changes
        setParticles(generateParticles(currentEmotion));
    }, [currentEmotion]);

    return (
        <div 
            className="mood-background-container"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none',
                background: 'var(--bg-primary)',
                transition: 'background 1s ease'
            }}
        >
            {/* Animated Gradients */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentEmotion + "-gradients"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                    }}
                >
                    {config.gradients.map((gradient, idx) => (
                        <motion.div
                            key={idx}
                            animate={{
                                scale: [1, 1.2, 0.9, 1],
                                x: [0, 50, -30, 0],
                                y: [0, -40, 60, 0],
                            }}
                            transition={{
                                duration: 15 + idx * 5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                position: 'absolute',
                                inset: -200,
                                background: gradient,
                                mixBlendMode: 'soft-light',
                                filter: 'blur(80px)',
                            }}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Floating Particles */}
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ 
                            opacity: 0, 
                            x: `${p.x}vw`, 
                            y: '110vh',
                            scale: 0.5
                        }}
                        animate={{ 
                            opacity: [0, p.opacity, p.opacity, 0],
                            y: '-10vh',
                            x: `${p.x + p.drift}vw`,
                            rotate: 360,
                            scale: [0.5, 1, 1.2, 0.8]
                        }}
                        transition={{ 
                            duration: p.duration,
                            delay: p.delay,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            fontSize: `${p.size}px`,
                            color: 'white',
                            textShadow: `0 0 10px ${config.glowColor}`,
                            userSelect: 'none',
                        }}
                    >
                        {p.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Global Mood Overlay Glow */}
            <motion.div 
                animate={{
                    opacity: [0.05, 0.15, 0.05]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `background: radial-gradient(circle at 50% 50%, ${config.glowColor} 0%, transparent 70%)`,
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export default MoodBackground;
