/**
 * Emotion Engine — maps detected moods to animation configurations.
 * Each mood has particles, messages, gradient palettes, and animation params.
 */

export const MOOD_CONFIGS = {
    happy: {
        particles: ['✨', '🎉', '🌟', '💖', '🥳', '🎊', '⭐', '💫', '🦋', '🌈'],
        messages: [
            "Yay!! So happy for you! 🎉",
            "You're glowing bestie! ✨",
            "This energy is EVERYTHING! 💖",
            "Love this vibe for you! 🌟",
            "You deserve all the happiness! 🥳"
        ],
        toastTitle: "✨ You're Shining!",
        toastSubtitle: "Keep this energy going, bestie!",
        gradients: [
            'radial-gradient(circle at 20% 80%, rgba(255, 182, 193, 0.25) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(255, 105, 180, 0.1) 0%, transparent 60%)',
        ],
        particleColors: ['#FF69B4', '#FFD700', '#FF6B9D', '#FFA500', '#FF1493'],
        glowColor: 'rgba(255, 105, 180, 0.15)',
        animationSpeed: 'fast',
        particleCount: 25,
    },

    sad: {
        particles: ['💙', '🤗', '💜', '🌸', '🕊️', '🫂', '💪', '☀️', '🌻', '💛'],
        messages: [
            "Hey, I'm right here with you 💙",
            "It's okay to feel this way, bestie 🤗",
            "You're stronger than you think 💪",
            "Sending you the biggest hug 🫂",
            "Tomorrow is a new day, love 🌅"
        ],
        toastTitle: "💙 I'm Here For You",
        toastSubtitle: "You don't have to go through this alone",
        gradients: [
            'radial-gradient(circle at 30% 70%, rgba(135, 206, 235, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 30%, rgba(147, 112, 219, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 90%, rgba(100, 149, 237, 0.12) 0%, transparent 55%)',
        ],
        particleColors: ['#87CEEB', '#9370DB', '#B0C4DE', '#ADD8E6', '#E6E6FA'],
        glowColor: 'rgba(135, 206, 235, 0.12)',
        animationSpeed: 'slow',
        particleCount: 15,
    },

    angry: {
        particles: ['🔥', '💢', '⚡', '💥', '😤', '🌪️', '🥊', '💣', '🗯️', '⛈️'],
        messages: [
            "I feel you, that's SO unfair 😤",
            "Honestly? I'm mad FOR you 💢",
            "Wanna hit something? Vent Arena's open 🥊",
            "Your anger is valid, bestie 🔥",
            "Let it out, I'm listening ⚡"
        ],
        toastTitle: "😤 I'm Right There With You!",
        toastSubtitle: "Wanna punch something? Let's go to Vent Arena!",
        gradients: [
            'radial-gradient(circle at 25% 75%, rgba(255, 69, 0, 0.18) 0%, transparent 50%)',
            'radial-gradient(circle at 75% 25%, rgba(220, 20, 60, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.08) 0%, transparent 55%)',
        ],
        particleColors: ['#FF4500', '#DC143C', '#FF6347', '#FF0000', '#FF8C00'],
        glowColor: 'rgba(255, 69, 0, 0.12)',
        animationSpeed: 'fast',
        particleCount: 20,
        suggestVentRoom: true,
    },

    concerned: {
        particles: ['💜', '🫂', '🕊️', '🌿', '✨', '💫', '🌙', '🫧', '🧸', '☁️'],
        messages: [
            "I'm worried about you, bestie 💜",
            "You're safe here, always 🕊️",
            "Take a deep breath with me 🌿",
            "I'm not going anywhere 🫂",
            "It's okay to not be okay 🌙"
        ],
        toastTitle: "💜 I'm Here, Always",
        toastSubtitle: "Take your time. No rush, no pressure.",
        gradients: [
            'radial-gradient(circle at 40% 60%, rgba(147, 112, 219, 0.18) 0%, transparent 50%)',
            'radial-gradient(circle at 60% 40%, rgba(186, 85, 211, 0.12) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(138, 43, 226, 0.08) 0%, transparent 55%)',
        ],
        particleColors: ['#9370DB', '#BA55D3', '#DDA0DD', '#D8BFD8', '#E6E6FA'],
        glowColor: 'rgba(147, 112, 219, 0.12)',
        animationSpeed: 'slow',
        particleCount: 12,
    },

    neutral: {
        particles: ['✨', '🌸', '💫', '🎀', '☁️', '🫧', '🌙', '⭐'],
        messages: [],
        toastTitle: '',
        toastSubtitle: '',
        gradients: [
            'radial-gradient(circle at 30% 70%, rgba(255, 182, 193, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 30%, rgba(255, 192, 203, 0.08) 0%, transparent 50%)',
        ],
        particleColors: ['#FFB6C1', '#FFC0CB', '#FFD1DC', '#F8C8DC', '#F4C2C2'],
        glowColor: 'rgba(255, 182, 193, 0.08)',
        animationSpeed: 'normal',
        particleCount: 8,
    },
};

/**
 * Generate random particle data for animation
 */
export function generateParticles(mood, count) {
    const config = MOOD_CONFIGS[mood] || MOOD_CONFIGS.neutral;
    const particles = [];
    const actualCount = count || config.particleCount;

    for (let i = 0; i < actualCount; i++) {
        particles.push({
            id: `p-${Date.now()}-${i}`,
            emoji: config.particles[Math.floor(Math.random() * config.particles.length)],
            x: Math.random() * 100,          // percentage
            y: Math.random() * 100,
            size: 14 + Math.random() * 22,    // 14-36px
            duration: 4 + Math.random() * 8,  // 4-12s
            delay: Math.random() * 5,         // 0-5s delay
            opacity: 0.3 + Math.random() * 0.5,
            drift: -30 + Math.random() * 60,  // horizontal drift
        });
    }
    return particles;
}

/**
 * Get a random encouragement message for the mood
 */
export function getRandomMessage(mood) {
    const config = MOOD_CONFIGS[mood] || MOOD_CONFIGS.neutral;
    if (config.messages.length === 0) return null;
    return config.messages[Math.floor(Math.random() * config.messages.length)];
}

/**
 * Congratulation messages for achievements / happy moments
 */
export const CONGRATS_MESSAGES = [
    "🎉 CONGRATULATIONS! You did it!",
    "🏆 So proud of you, bestie!",
    "✨ You're absolutely crushing it!",
    "🎊 This calls for a celebration!",
    "💪 Knew you could do it, always!"
];

/**
 * Encouragement messages for sad moments
 */
export const ENCOURAGEMENT_MESSAGES = [
    "💙 You're braver than you believe",
    "🌅 After every storm comes sunshine",
    "🫂 I believe in you, always",
    "💪 You've survived 100% of your worst days",
    "🌈 Better days are coming, I promise"
];

/**
 * Solidarity messages for angry moments
 */
export const SOLIDARITY_MESSAGES = [
    "😤 I'm angry WITH you, not at you",
    "🔥 Your feelings are VALID",
    "⚡ Let's channel this energy",
    "💢 That's genuinely messed up",
    "🥊 Wanna go to Vent Arena together?"
];
