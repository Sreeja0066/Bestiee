import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import dataService from '../services/dataService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Log any auth errors returned in the URL hash (e.g. #error=unauthorized_client)
        if (window.location.hash) {
            try {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                if (hashParams.has('error') || hashParams.has('error_description')) {
                    console.error('⚠️ Supabase Auth Redirect Error:', {
                        error: hashParams.get('error'),
                        description: hashParams.get('error_description')
                    });
                }
            } catch (hashErr) {
                console.error('Error parsing URL hash:', hashErr);
            }
        }

        // Check existing session on mount
        authService.getSession().then(async (session) => {
            try {
                if (session?.user) {
                    setUser(session.user);
                    try {
                        const p = await authService.getProfile(session.user.id);
                        setProfile(p);
                    } catch (pErr) {
                        console.error('Error fetching profile on mount:', pErr);
                    }
                    try {
                        // Sync settings from cloud
                        await dataService.syncSettings(session.user.id);
                    } catch (sErr) {
                        console.error('Error syncing settings on mount:', sErr);
                    }
                }
            } catch (err) {
                console.error('Error checking session on mount:', err);
            } finally {
                setLoading(false);
            }
        });

        // Listen for auth state changes (login/logout)
        const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
            try {
                if (session?.user) {
                    setUser(session.user);
                    try {
                        const p = await authService.getProfile(session.user.id);
                        setProfile(p);
                    } catch (pErr) {
                        console.error('Error fetching profile on auth change:', pErr);
                    }
                    try {
                        await dataService.syncSettings(session.user.id);
                    } catch (sErr) {
                        console.error('Error syncing settings on auth change:', sErr);
                    }
                } else {
                    setUser(null);
                    setProfile(null);
                }
            } catch (err) {
                console.error('Error handling auth state change:', err);
            } finally {
                setLoading(false);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    const signOut = async () => {
        await authService.signOut();
        setUser(null);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) {
            const p = await authService.getProfile(user.id);
            setProfile(p);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

export default AuthContext;
