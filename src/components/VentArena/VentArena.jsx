import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Heart, Zap, RotateCcw, ArrowLeft } from 'lucide-react';

const HIT_SOUNDS = ["BOING!", "POW!", "WHACK!", "BAM!", "CRUNCH!", "WHAM!"];
const ENCOURAGEMENTS = [
    "Let it all out!",
    "You're doing great, bestie.",
    "Feel that tension leaving?",
    "I'm right here with you.",
    "Breathe through the frustration.",
    "Smash those bad vibes!"
];

const VentArena = ({ onOpenSidebar }) => {
    const [hits, setHits] = useState(0);
    const [particles, setParticles] = useState([]);
    const [isBreathing, setIsBreathing] = useState(false);
    const [breathingText, setBreathingText] = useState("Ready?");
    const [dummyEmotion, setDummyEmotion] = useState('shocked'); // 'shocked' | 'dizzy' | 'pain'
    const arenaRef = useRef(null);

    const addParticle = (x, y) => {
        const id = Date.now();
        const text = HIT_SOUNDS[Math.floor(Math.random() * HIT_SOUNDS.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        
        setParticles(prev => [...prev, { 
            id, x, y, text, 
            tx: Math.cos(angle) * distance, 
            ty: Math.sin(angle) * distance 
        }]);
        
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, 800);
    };

    const handleHit = (e) => {
        if (isBreathing) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        setHits(prev => prev + 1);
        addParticle(x, y);
        
        // Change dummy expression briefly
        setDummyEmotion('pain');
        setTimeout(() => setDummyEmotion('shocked'), 200);

        if (navigator.vibrate) navigator.vibrate(80);
    };

    const startBreathing = () => {
        setIsBreathing(true);
        let cycle = 0;
        const textStates = ["Breathe in...", "Hold...", "Breathe out...", "Rest..."];
        
        setBreathingText(textStates[0]);
        
        const interval = setInterval(() => {
            cycle = (cycle + 1) % 4;
            setBreathingText(textStates[cycle]);
            if (cycle === 0 && Math.random() > 0.8) {
                // End after some cycles or let user stop
            }
        }, 4000);

        return () => clearInterval(interval);
    };

    return (
        <div className="vent-arena-premium" ref={arenaRef} style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: isBreathing ? 'radial-gradient(circle, #e0f2fe 0%, #fef6fb 100%)' : 'transparent',
            transition: 'background 2s ease'
        }}>
            
            {/* Header UI */}
            <div style={{ 
                position: 'absolute', 
                top: '30px', 
                textAlign: 'center',
                zIndex: 10
            }}>
                <motion.h2 
                    animate={{ scale: isBreathing ? 0.9 : 1 }}
                    style={{ 
                        margin: 0, 
                        fontSize: '2rem', 
                        fontWeight: 900, 
                        background: 'var(--brand-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {isBreathing ? "Healing Space" : "Vent Arena"}
                </motion.h2>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {isBreathing ? "Synchronize your breath with the circle" : "Don't hold it in. Let it out on the dummy!"}
                </p>
            </div>

            {/* Hit Counter Overlay */}
            {!isBreathing && (
                <motion.div 
                    key={hits}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    style={{
                        position: 'absolute',
                        fontSize: '15rem',
                        fontWeight: 900,
                        color: 'var(--text-primary)',
                        userSelect: 'none',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                >
                    {hits}
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {!isBreathing ? (
                    /* The Punching Bag / Dummy */
                    <motion.div
                        key="dummy-container"
                        exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                        style={{ position: 'relative', zIndex: 5 }}
                    >
                        <motion.div
                            whileTap={{ 
                                scale: 0.85, 
                                rotate: [0, -15, 15, -10, 10, 0],
                                transition: { duration: 0.2 }
                            }}
                            onClick={handleHit}
                            style={{
                                width: '280px',
                                height: '400px',
                                cursor: 'pointer',
                                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))'
                            }}
                        >
                            <svg viewBox="0 0 200 300" width="100%" height="100%">
                                {/* Shadow */}
                                <ellipse cx="100" cy="285" rx="60" ry="10" fill="rgba(0,0,0,0.1)" />
                                
                                {/* Body */}
                                <motion.path
                                    d="M50 110 Q100 80 150 110 L165 260 Q100 290 35 260 Z"
                                    fill={dummyEmotion === 'pain' ? '#ff8787' : '#FF6B6B'}
                                    stroke="#fa5252"
                                    strokeWidth="6"
                                />
                                
                                {/* Head */}
                                <motion.circle
                                    cx="100" cy="65" r="45"
                                    fill={dummyEmotion === 'pain' ? '#fff3bf' : '#FFD93D'}
                                    stroke="#fab005"
                                    strokeWidth="5"
                                />

                                {/* Face Logic */}
                                <g transform="translate(100, 65)">
                                    {dummyEmotion === 'shocked' && (
                                        <>
                                            <circle cx="-15" cy="-5" r="5" fill="#333" />
                                            <circle cx="15" cy="-5" r="5" fill="#333" />
                                            <circle cx="0" cy="15" r="8" fill="none" stroke="#333" strokeWidth="3" />
                                        </>
                                    )}
                                    {dummyEmotion === 'pain' && (
                                        <>
                                            <path d="M-20 -10 L-10 0 M-10 -10 L-20 0" stroke="#333" strokeWidth="4" />
                                            <path d="M20 -10 L10 0 M10 -10 L20 0" stroke="#333" strokeWidth="4" />
                                            <path d="M-15 20 Q0 10 15 20" fill="none" stroke="#333" strokeWidth="4" />
                                        </>
                                    )}
                                </g>

                                {/* Bandage detail to make it look like a training dummy */}
                                <rect x="70" y="150" width="60" height="15" fill="white" opacity="0.4" rx="2" transform="rotate(-15 100 157)"/>
                                <rect x="75" y="180" width="50" height="15" fill="white" opacity="0.4" rx="2" transform="rotate(10 100 187)"/>
                            </svg>
                        </motion.div>

                        {/* Encouraging Floating Text */}
                        <AnimatePresence>
                            {hits > 0 && hits % 5 === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: -40 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        position: 'absolute',
                                        top: '-60px',
                                        width: '100%',
                                        textAlign: 'center',
                                        color: 'var(--accent-deep)',
                                        fontWeight: 800,
                                        fontSize: '1.2rem',
                                        textShadow: '0 2px 10px white'
                                    }}
                                >
                                    {ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* Breathing Guide */
                    <motion.div
                        key="breathing-guide"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="breathing-container"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}
                    >
                        <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Outer Pulse */}
                            <motion.div
                                animate={{ 
                                    scale: breathingText === "Breathe in..." ? 1.5 : breathingText === "Breathe out..." ? 1 : 1,
                                    opacity: [0.2, 0.5, 0.2]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    background: 'var(--accent-glow)',
                                    border: '2px solid var(--accent)'
                                }}
                            />
                            {/* Inner Circle */}
                            <motion.div
                                animate={{ 
                                    scale: breathingText === "Breathe in..." ? 1.2 : breathingText === "Breathe out..." ? 0.6 : 1,
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                    width: '180px',
                                    height: '180px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 10px 30px var(--accent-glow)'
                                }}
                            >
                                <Heart fill="white" size={48} />
                            </motion.div>
                        </div>
                        
                        <motion.h3 
                            key={breathingText}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-deep)', margin: 0 }}
                        >
                            {breathingText}
                        </motion.h3>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Particles */}
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ opacity: 1, scale: 0.5, x: p.x, y: p.y }}
                    animate={{ 
                        opacity: 0, 
                        scale: 2, 
                        x: p.x + p.tx, 
                        y: p.y + p.ty 
                    }}
                    style={{
                        position: 'fixed',
                        left: 0, top: 0,
                        pointerEvents: 'none',
                        color: 'var(--accent-deep)',
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        textShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        zIndex: 100
                    }}
                >
                    {p.text}
                </motion.div>
            ))}

            {/* Bottom Controls */}
            <div style={{ 
                position: 'absolute', 
                bottom: '40px', 
                display: 'flex', 
                gap: '20px',
                zIndex: 20
            }}>
                {hits > 0 && !isBreathing && (
                    <motion.button
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setHits(0);
                            startBreathing();
                        }}
                        style={{
                            padding: '16px 32px',
                            borderRadius: '20px',
                            border: 'none',
                            background: 'white',
                            color: 'var(--accent-deep)',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Wind size={20} /> I'm calm now
                    </motion.button>
                )}

                {isBreathing && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setIsBreathing(false);
                            setHits(0);
                        }}
                        style={{
                            padding: '16px 32px',
                            borderRadius: '20px',
                            border: 'none',
                            background: 'var(--accent-gradient)',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px var(--accent-glow)'
                        }}
                    >
                        <RotateCcw size={20} /> Restart Session
                    </motion.button>
                )}
            </div>

            {/* Back to Chat floating button */}
            <motion.button
                whileHover={{ x: -10 }}
                onClick={() => onOpenSidebar?.() || window.history.back()}
                style={{
                    position: 'absolute',
                    top: '30px',
                    left: '30px',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border-primary)',
                    padding: '12px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 30
                }}
            >
                <ArrowLeft size={18} /> Menu
            </motion.button>

        </div>
    );
};

export default VentArena;
