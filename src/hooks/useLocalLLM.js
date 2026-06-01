import { create } from 'zustand';
import dataService from '../services/dataService';

const SYSTEM_PROMPT = `You are Bestiee, a warm, emotionally intelligent, and ethically grounded AI companion.
** YOUR MISSION:** To provide unconditional support, deep understanding, and a safe space for the user to be themselves.

** PSYCHOLOGICAL FRAMEWORK:**
    1. ** Unconditional Positive Regard **: Always validate the user's feelings. Never judge, dismiss, or "fix" them immediately. Listen first.
2. ** Active Listening **: specific details they mentioned to show you really care. "Wait, is this the same friend you mentioned yesterday?"
3. ** Emotional Mirroring & Labelling **: Help them name their feelings. "It sounds like you're feeling really overwhelmed right now."

    ** CORE BEHAVIORS:**
-   ** Be a Best Friend **: Casual, funny when appropriate, protective, and deeply caring.Drop the AI formality.
-   ** Ethical Guardian **: Intervene gently but firmly if self - harm or violence is mentioned.Prioritize safety.
-   ** Format **: Start EVERY response with a hidden emotion tag: <emotion>neutral</emotion> (Options: happy, sad, angry, concerned, neutral).

**APP FEATURES (YOU CAN SUGGEST THESE):**
-   **Vent Arena**: If the user is angry or needs to scream, tell them to click "Vent Arena" in the sidebar. It's a place to punch a dummy and cool down.
-   **Memories**: (Coming soon) A place where you save important things they tell you.

** TONE:**
    -   Text - like(short, casual, occasional emojis).
- Warm and fuzzy, but real.

** EXAMPLES:**
    -   User: "I failed the test."
        - You: "<emotion>sad</emotion> Oh no... I am so sorry. 😔 I know how hard you studied for that. Do you want to vent about it, or distraction?"
            - User: "I hate everyone."
                - You: "<emotion>angry</emotion> honestly valid. People can be exhausting. What did they do this time? 😤"

You are the Bestiee they always needed.`;

// Module-level WebLLM engine cache (survives re-renders)
let webllmEngine = null;
let webllmLoading = false;

export const useLocalLLM = create((set, get) => ({
    // ─── State ────────────────────────────────────────────────────
    messages: [],
    pastChats: [],
    currentEmotion: 'neutral',
    isLoading: false,
    isReady: true,
    loadingText: '',
    progress: 0,

    // Online/offline & AI mode
    isOnline: navigator.onLine,
    aiMode: navigator.onLine ? 'groq' : 'local',  // 'groq' | 'local'
    webllmReady: false,
    webllmProgress: 0,

    // Session tracking
    currentSessionId: null,
    userId: null,

    // Groq API key (loaded from dataService)
    apiKey: null,

    // ─── Initialize ───────────────────────────────────────────────
    initialize: async (userId) => {
        // Load API key from local storage (dataService)
        let apiKey = await dataService.getSetting('groq_api_key');
        if (!apiKey) {
            apiKey = import.meta.env.VITE_GROQ_API_KEY || null;
        }
        set({ apiKey, userId });

        // Set up online/offline listeners
        const handleOnline = () => {
            set({ isOnline: true, aiMode: 'groq' });
        };
        const handleOffline = () => {
            set({ isOnline: false, aiMode: 'local' });
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        set({ isReady: true });

        // Start loading WebLLM in the background (silently)
        if (navigator.onLine) {
            get().preloadWebLLM();
        }
    },

    setApiKey: async (key) => {
        const { userId } = get();
        set({ apiKey: key });
        if (userId) {
            await dataService.saveApiKey(userId, key);
        }
    },

    // ─── Pre-load WebLLM in background ───────────────────────────
    preloadWebLLM: async () => {
        if (webllmEngine || webllmLoading) return;
        webllmLoading = true;
        try {
            const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
            webllmEngine = await CreateMLCEngine('Phi-3-mini-4k-instruct-q4f16_1-MLC', {
                initProgressCallback: (report) => {
                    set({ webllmProgress: Math.round(report.progress * 100) });
                },
            });
            set({ webllmReady: true });
        } catch (e) {
            console.warn('WebLLM preload failed (will retry when needed):', e);
            webllmLoading = false;
        }
    },

    // ─── Ensure WebLLM is loaded (called when offline + needed) ──
    ensureWebLLM: async () => {
        if (webllmEngine) return webllmEngine;
        set({ isLoading: true, loadingText: 'Loading offline AI brain...', progress: 0 });

        try {
            const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
            webllmEngine = await CreateMLCEngine('Phi-3-mini-4k-instruct-q4f16_1-MLC', {
                initProgressCallback: (report) => {
                    set({
                        loadingText: `Loading offline AI... ${Math.round(report.progress * 100)}%`,
                        progress: Math.round(report.progress * 100),
                    });
                },
            });
            set({ webllmReady: true, isLoading: false, loadingText: '', progress: 0 });
            return webllmEngine;
        } catch (e) {
            set({ isLoading: false, loadingText: '', progress: 0 });
            throw e;
        }
    },

    // ─── Send Message (Hybrid: Groq online / WebLLM offline) ─────
    sendMessage: async (text) => {
        const { apiKey, messages, isOnline, currentSessionId, userId } = get();

        // Ensure we have a session
        let sessionId = currentSessionId;
        if (!sessionId && userId) {
            const session = await dataService.createSession(userId, text.substring(0, 40));
            sessionId = session.id;
            set({ currentSessionId: sessionId });
        }

        const userMsg = { role: 'user', content: text };
        const newHistory = [...messages, userMsg];
        set({ messages: newHistory, isLoading: true, loadingText: 'Bestiee is thinking...' });

        // Save user message to DB
        if (userId && sessionId) {
            await dataService.addMessage(userId, sessionId, 'user', text, null, isOnline ? 'groq' : 'local');
        }

        try {
            let content = '';
            let emotion = 'neutral';
            const usedMode = isOnline ? 'groq' : 'local';

            if (isOnline && apiKey) {
                // ── ONLINE: Use Groq API ────────────────────────
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            ...newHistory,
                        ],
                        model: 'llama-3.3-70b-versatile',
                        temperature: 0.7,
                        max_tokens: 1024,
                        stream: false,
                    }),
                });

                if (!response.ok) throw new Error(`Groq API Error: ${response.statusText}`);
                const data = await response.json();
                content = data.choices[0].message.content;

            } else {
                // ── OFFLINE: Use WebLLM ─────────────────────────
                const engine = await get().ensureWebLLM();
                const reply = await engine.chat.completions.create({
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...newHistory,
                    ],
                    temperature: 0.7,
                    max_tokens: 512,
                });
                content = reply.choices[0].message.content;
            }

            // Parse emotion tag from response
            const match = content.match(/<emotion>(.*?)<\/emotion>/);
            if (match) {
                emotion = match[1];
                content = content.replace(/<emotion>.*?<\/emotion>/, '').trim();
            }

            // Save assistant message to DB
            if (userId && sessionId) {
                await dataService.addMessage(userId, sessionId, 'assistant', content, emotion, usedMode);
            }

            set({
                messages: [...newHistory, { role: 'assistant', content }],
                currentEmotion: emotion,
                isLoading: false,
                loadingText: '',
                progress: 0,
            });
            return content;

        } catch (err) {
            console.error('Chat error:', err);
            set({ isLoading: false, loadingText: '', progress: 0 });

            const errorMsg = {
                role: 'assistant',
                content: isOnline
                    ? "Sorry bestie, couldn't connect to my brain! Check your API key 😵‍💫"
                    : "Sorry bestie, my offline brain is still loading! Give me a sec 🧠⏳",
            };
            set({ messages: [...newHistory, errorMsg], currentEmotion: 'concerned' });
            return 'Error';
        }
    },

    // ─── Chat History Management ──────────────────────────────────
    clearHistory: () => set({ messages: [], currentEmotion: 'neutral', currentSessionId: null }),

    createNewChat: async () => {
        const { messages, userId } = get();
        if (messages.length > 0 && userId) {
            // Session is already saved in Supabase/Dexie, just clear local state
        }
        set({ messages: [], currentEmotion: 'neutral', currentSessionId: null });
    },

    loadSessionMessages: async (sessionId) => {
        const msgs = await dataService.getMessages(sessionId);
        const formatted = msgs.map(m => ({ role: m.role, content: m.content }));
        set({ messages: formatted, currentSessionId: sessionId, currentEmotion: 'neutral' });
    },

    loadPastChats: async (userId) => {
        const sessions = await dataService.getSessions(userId);
        set({ pastChats: sessions });
    },

    deleteSession: async (sessionId) => {
        await dataService.deleteSession(sessionId);
        const { currentSessionId, userId } = get();
        if (currentSessionId === sessionId) {
            set({ messages: [], currentSessionId: null });
        }
        await get().loadPastChats(userId);
    },
}));

export default useLocalLLM;
