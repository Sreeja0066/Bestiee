import { supabase } from '../lib/supabase';
import { db } from '../lib/db';

const dataService = {
    // ──────────────────────────────────────────────
    // SESSIONS
    // ──────────────────────────────────────────────

    async createSession(userId, title = 'New Chat') {
        const session = {
            id: crypto.randomUUID(),
            user_id: userId,
            title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            message_count: 0,
        };

        // Write to Dexie immediately (works offline)
        await db.sessions.put(session);

        // Try to write to Supabase (only if online)
        if (navigator.onLine) {
            const { error } = await supabase.from('sessions').insert(session);
            if (error) {
                await db.syncQueue.add({ table_name: 'sessions', operation: 'insert', data: session, created_at: new Date().toISOString() });
            }
        } else {
            await db.syncQueue.add({ table_name: 'sessions', operation: 'insert', data: session, created_at: new Date().toISOString() });
        }

        return session;
    },

    async getSessions(userId) {
        // Always read from Dexie first (instant)
        const local = await db.sessions
            .where('user_id').equals(userId)
            .reverse()
            .sortBy('updated_at');

        // If online, refresh from Supabase in background
        if (navigator.onLine) {
            supabase
                .from('sessions')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
                .then(async ({ data }) => {
                    if (data) await db.sessions.bulkPut(data);
                });
        }

        return local;
    },

    async updateSession(sessionId, updates) {
        await db.sessions.update(sessionId, { ...updates, updated_at: new Date().toISOString() });
        if (navigator.onLine) {
            await supabase.from('sessions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sessionId);
        }
    },

    async deleteSession(sessionId) {
        await db.sessions.delete(sessionId);
        await db.messages.where('session_id').equals(sessionId).delete();
        if (navigator.onLine) {
            await supabase.from('sessions').delete().eq('id', sessionId);
        }
    },

    // ──────────────────────────────────────────────
    // MESSAGES
    // ──────────────────────────────────────────────

    async addMessage(userId, sessionId, role, content, emotion = null, aiMode = 'groq') {
        const message = {
            id: crypto.randomUUID(),
            session_id: sessionId,
            user_id: userId,
            role,
            content,
            emotion,
            ai_mode: aiMode,
            timestamp: new Date().toISOString(),
        };

        // Write to Dexie immediately
        await db.messages.add({ ...message, local_id: undefined });

        // Update session metadata
        await db.sessions.where('id').equals(sessionId).modify(s => {
            s.updated_at = new Date().toISOString();
            s.message_count = (s.message_count || 0) + 1;
        });

        // Write to Supabase
        if (navigator.onLine) {
            const { error } = await supabase.from('messages').insert({
                id: message.id,
                session_id: sessionId,
                user_id: userId,
                role,
                content,
                emotion,
                ai_mode: aiMode,
                created_at: message.timestamp,
            });
            if (error) {
                await db.syncQueue.add({ table_name: 'messages', operation: 'insert', data: message, created_at: new Date().toISOString() });
            }
            // Also update session in Supabase
            await supabase.from('sessions')
                .update({ updated_at: new Date().toISOString(), message_count: supabase.rpc('increment') })
                .eq('id', sessionId);
        } else {
            await db.syncQueue.add({ table_name: 'messages', operation: 'insert', data: message, created_at: new Date().toISOString() });
        }

        return message;
    },

    async getMessages(sessionId) {
        // Read from Dexie (instant)
        const local = await db.messages
            .where('session_id').equals(sessionId)
            .sortBy('timestamp');

        // Refresh from Supabase in background if online
        if (navigator.onLine) {
            supabase
                .from('messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true })
                .then(async ({ data }) => {
                    if (data) {
                        const mapped = data.map(m => ({ ...m, timestamp: m.created_at }));
                        await db.messages.bulkPut(mapped);
                    }
                });
        }

        return local;
    },

    // ──────────────────────────────────────────────
    // SETTINGS
    // ──────────────────────────────────────────────

    async getSetting(key) {
        const row = await db.settings.get(key);
        return row?.value ?? null;
    },

    async setSetting(key, value) {
        await db.settings.put({ key, value });
    },

    async syncSettings(userId) {
        if (!navigator.onLine) return;
        const { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
        if (data) {
            if (data.groq_api_key) await db.settings.put({ key: 'groq_api_key', value: data.groq_api_key });
            if (data.theme) await db.settings.put({ key: 'theme', value: data.theme });
        }
    },

    async saveApiKey(userId, apiKey) {
        await db.settings.put({ key: 'groq_api_key', value: apiKey });
        if (navigator.onLine) {
            await supabase.from('user_settings').upsert({ user_id: userId, groq_api_key: apiKey, updated_at: new Date().toISOString() });
        }
    },

    // ──────────────────────────────────────────────
    // SYNC QUEUE — flush offline writes to Supabase
    // ──────────────────────────────────────────────

    async flushSyncQueue() {
        if (!navigator.onLine) return;
        const queue = await db.syncQueue.orderBy('created_at').toArray();
        for (const item of queue) {
            try {
                if (item.table_name === 'messages') {
                    const { data: item_data } = item;
                    await supabase.from('messages').insert({
                        id: item_data.id,
                        session_id: item_data.session_id,
                        user_id: item_data.user_id,
                        role: item_data.role,
                        content: item_data.content,
                        emotion: item_data.emotion,
                        ai_mode: item_data.ai_mode,
                        created_at: item_data.timestamp,
                    });
                } else if (item.table_name === 'sessions') {
                    await supabase.from('sessions').upsert(item.data);
                }
                await db.syncQueue.delete(item.id);
            } catch (e) {
                console.warn('Sync failed for item:', item.id, e);
            }
        }
    },
};

// Auto-flush sync queue when internet comes back
window.addEventListener('online', () => {
    dataService.flushSyncQueue();
});

export default dataService;
