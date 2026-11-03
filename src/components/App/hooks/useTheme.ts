import { useCallback, useEffect, useState } from 'preact/hooks';
import { config } from '../../../lib/Config';
import type { ThemePreference } from '../types';

export function useTheme() {
    const [theme, setTheme] = useState<ThemePreference>(() => config.theme);

    useEffect(() => {
        const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        const applyTheme = () => {
            const effectiveTheme = theme === 'system' ? (media?.matches ? 'dark' : 'light') : theme;
            document.documentElement.dataset.theme = effectiveTheme;
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', effectiveTheme === 'dark' ? '#1d5e70' : '#00acc7');
        };

        applyTheme();
        if (theme === 'system') {
            media?.addEventListener('change', applyTheme);
            return () => media?.removeEventListener('change', applyTheme);
        }
    }, [theme]);

    const changeTheme = useCallback((nextTheme: ThemePreference) => {
        config.theme = nextTheme;
        setTheme(nextTheme);
    }, []);

    return { theme, changeTheme };
}
