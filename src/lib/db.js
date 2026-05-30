import Dexie from 'dexie';

export const db = new Dexie('bestiee-db');

db.version(1).stores({
    // Chat sessions list
    sessions: 'id, user_id, updated_at, created_at',

    // Individual messages
    messages: '++local_id, id, session_id, user_id, timestamp, role',

    // App settings (api key, theme, etc.)
    settings: 'key',

    // Writes that happened offline, to be synced when online
    syncQueue: '++id, table_name, operation, created_at',
});

export default db;
