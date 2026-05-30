import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import dataService from '../services/dataService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check existing session on mount
        authService.getSession().then(async (session) => {
            if (session?.user) {
                setUser(session.user);
                const p = await authService.getProfile(session.user.id);
                setProfile(p);
                // Sync settings from cloud
                await dataService.syncSettings(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth state changes (login/logout)
        const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                const p = await authService.getProfile(session.user.id);
                setProfile(p);
                await dataService.syncSettings(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
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
