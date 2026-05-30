import { supabase } from '../lib/supabase';

export const authService = {
    // ─── Sign in with Google OAuth ───────────────────────────────
    async signInWithGoogle() {
        // Use the exact deployed URL — must match Supabase redirect URLs config
        const redirectTo = import.meta.env.PROD
            ? 'https://Sreeja0066.github.io/Bestiee/'
            : window.location.origin + '/';

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo },
        });
        if (error) throw error;
    },

    // ─── Sign in with Email + Password ───────────────────────────
    async signInWithEmail(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    // ─── Register with Email + Password ──────────────────────────
    async signUpWithEmail(email, password, displayName) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: displayName },
            },
        });
        if (error) throw error;
        return data;
    },

    // ─── Sign Out ─────────────────────────────────────────────────
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // ─── Get current session ─────────────────────────────────────
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // ─── Get current user ─────────────────────────────────────────
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // ─── Listen to auth state changes ────────────────────────────
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    },

    // ─── Save user consent for training data ─────────────────────
    async saveConsent(userId, consentTraining) {
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                consent_training: consentTraining,
                consent_given_at: new Date().toISOString(),
            });
        if (error) console.error('Consent save error:', error);
    },

    // ─── Get user profile ─────────────────────────────────────────
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error && error.code !== 'PGRST116') console.error('Profile fetch error:', error);
        return data;
    },
};

export default authService;
