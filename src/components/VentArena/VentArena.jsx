import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalLLM } from '../../hooks/useLocalLLM';

const HIT_SOUNDS = ["BOING!", "POW!", "WHACK!", "BAM!"];

const VentArena = () => {
    const [hits, setHits] = useState(0);
    const [particles, setParticles] = useState([]);
    const [isCoolingDown, setIsCoolingDown] = useState(false);

    const addParticle = (x, y) => {
        const id = Date.now();
        const text = HIT_SOUNDS[Math.floor(Math.random() * HIT_SOUNDS.length)];
        setParticles(prev => [...prev, { id, x, y, text }]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, 1000);
    };

    const handleHit = (e) => {
        if (isCoolingDown) return;

        // Get click position relative to viewport or container
        const x = e.clientX;
        const y = e.clientY;

        setHits(prev => prev + 1);
        addParticle(x, y);

        // Vibrate device if supported
        if (navigator.vibrate) navigator.vibrate(50);
    };

    return (
        <div className="vent-arena" style={{
            height: '100vh',
            background: '#2a1b2a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            touchAction: 'none' // Prevent scrolling while punching
        }}>

            {/* Background Ambience */}
            <div style={{ position: 'absolute', top: 20, color: 'rgba(255,255,255,0.5)' }}>
                <h2>🥊 Vent Arena</h2>
                <p>Tap the dummy to let it out!</p>
            </div>

            <div style={{ position: 'absolute', top: 80, right: 20, color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                {hits}
            </div>

            {/* The Dummy */}
            <motion.div
                whileTap={{ scale: 0.8, rotate: [0, -10, 10, 0] }}
                onClick={handleHit}
                style={{
                    width: 250,
                    height: 350,
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <svg viewBox="0 0 200 300" width="100%" height="100%" style={{ dropShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                    {/* Body */}
                    <motion.path
                        d="M50 100 Q100 80 150 100 L160 250 Q100 280 40 250 Z"
                        fill="#FF6B6B"
                        stroke="#FF0000"
                        strokeWidth="5"
                    />
                    {/* Head */}
                    <motion.circle
                        cx="100" cy="60" r="40"
                        fill="#FFD93D"
                        stroke="#FFC107"
                        strokeWidth="4"
                    />
                    {/* Eyes (X) */}
                    <path d="M85 50 L95 60 M95 50 L85 60" stroke="#333" strokeWidth="3" />
                    <path d="M105 50 L115 60 M115 50 L105 60" stroke="#333" strokeWidth="3" />
                    {/* Mouth (Wavy) */}
                    <path d="M85 75 Q100 65 115 75" stroke="#333" strokeWidth="3" fill="none" />
                </svg>
            </motion.div>

            {/* Particles */}
            <AnimatePresence>
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 1, scale: 0.5, x: p.x, y: p.y }}
                        animate={{ opacity: 0, scale: 1.5, y: p.y - 100 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            pointerEvents: 'none',
                            color: '#FFF',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            textShadow: '0 2px 5px #ff0000'
                        }}
                    >
                        {p.text}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Cool Down Button */}
            {hits > 5 && (
                <motion.button
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setIsCoolingDown(true);
                        // In real app, launch breathing exercise
                        alert("Deep breath... In... Out...");
                        setHits(0);
                        setIsCoolingDown(false);
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 50,
                        padding: '1rem 2rem',
                        borderRadius: '50px',
                        border: 'none',
                        background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 25px rgba(0, 242, 254, 0.3)',
                        cursor: 'pointer'
                    }}
                >
                    Start Cool Down 🧘
                </motion.button>
            )}

        </div>
    );
};

export default VentArena;
