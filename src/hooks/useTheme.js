import { create } from 'zustand';

const useThemeStore = create((set) => ({
    theme: localStorage.getItem('bestiee-theme') || 'light',
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('bestiee-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
    }),
    initTheme: () => {
        const saved = localStorage.getItem('bestiee-theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        set({ theme: saved });
    }
}));

export default useThemeStore;
