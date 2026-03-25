import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useLocalLLM = create(persist((set, get) => ({
    // State
    apiKey: import.meta.env.VITE_GROQ_API_KEY || null,
    messages: [],
    pastChats: [],
    currentEmotion: 'neutral',
    isLoading: false,
    isReady: true,

    // Actions
    setApiKey: (key) => set({ apiKey: key }),

    initialize: async () => {
        // If key exists in Env, ensure it's set
        const envKey = import.meta.env.VITE_GROQ_API_KEY;
        if (envKey && envKey !== get().apiKey) {
            set({ apiKey: envKey });
        }
        set({ isReady: true });
    },

    sendMessage: async (text) => {
        const { apiKey, messages } = get();

        if (!apiKey) {
            return "Please enter an API Key to chat! 🔑";
        }

        const userMsg = { role: "user", content: text };
        const newHistory = [...messages, userMsg];

        set({ messages: newHistory, isLoading: true });

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey} `,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        ...newHistory
                    ],
                    model: "llama-3.3-70b-versatile", // Updated to latest supported model
                    temperature: 0.7,
                    max_tokens: 1024,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText} `);
            }

            const data = await response.json();
            let content = data.choices[0].message.content;
            let emotion = 'neutral';

            // Parse emotion tag
            const match = content.match(/<emotion>(.*?)<\/emotion>/);
            if (match) {
                emotion = match[1];
                content = content.replace(/<emotion>.*?<\/emotion>/, '').trim();
            }

            set({
                messages: [...newHistory, { role: "assistant", content }],
                currentEmotion: emotion,
                isLoading: false
            });
            return content;

        } catch (err) {
            console.error("Chat error:", err);
            set({ isLoading: false });

            const errorMsg = { role: "assistant", content: "Sorry bestie, I couldn't connect. Check your internet or API key! 😵‍💫" };
            set({ messages: [...newHistory, errorMsg], currentEmotion: 'concerned' });
            return "Error";
        }
    },

    clearHistory: () => set({ messages: [], currentEmotion: 'neutral' }),

    createNewChat: () => {
        const { messages, pastChats } = get();
        if (messages.length > 0) {
            set({
                pastChats: [{
                    id: Date.now(),
                    date: new Date().toISOString(),
                    messages: [...messages],
                    preview: messages[0]?.role === 'user' ? messages[0].content.substring(0, 30) + '...' : 'New Chat'
                }, ...(pastChats || [])],
                messages: [],
                currentEmotion: 'neutral'
            });
        }
    },

    loadChat: (chatId) => {
        const { messages, pastChats } = get();
        let newPastChats = [...(pastChats || [])];

        // Save current chat if it has messages
        if (messages.length > 0) {
            newPastChats = [{
                id: Date.now(),
                date: new Date().toISOString(),
                messages: [...messages],
                preview: messages[0]?.role === 'user' ? messages[0].content.substring(0, 30) + '...' : 'New Chat'
            }, ...newPastChats];
        }

        const chatToLoad = newPastChats.find(c => c.id === chatId);
        if (chatToLoad) {
            set({
                messages: chatToLoad.messages,
                pastChats: newPastChats.filter(c => c.id !== chatId),
                currentEmotion: 'neutral'
            });
        }
    },

    deleteChat: (chatId) => {
        const { pastChats } = get();
        set({
            pastChats: (pastChats || []).filter(c => c.id !== chatId)
        });
    },

    logout: () => set({ apiKey: null, messages: [], pastChats: [] })

}), {
    name: 'bestiee-storage',
    partialize: (state) => ({
        messages: state.messages,
        pastChats: state.pastChats,
        currentEmotion: state.currentEmotion,
        apiKey: state.apiKey
    }),
}));
