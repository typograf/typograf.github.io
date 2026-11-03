// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import Typograf from 'typograf';
import { Header } from './index';

test('keeps the tab ripple visible for 700 ms', async () => {
    window.Typograf = Typograf;
    const { initI18n } = await import('../../i18n/init');
    vi.useFakeTimers();
    const root = document.createElement('div');
    initI18n();
    try {
        act(() => render(<Header tab="editor" onSelect={() => {}} theme="system" onThemeChange={() => {}} />, root));
        const tab = root.querySelector<HTMLElement>('.header__menu-item_tab_prefs')!;
        act(() => tab.click());

        expect(tab.querySelector<HTMLElement>('.ripple')?.style.animationDuration).toBe('700ms');
        act(() => { vi.advanceTimersByTime(600); });
        expect(tab.querySelector('.ripple')).toBeTruthy();
        act(() => { vi.advanceTimersByTime(100); });
        expect(tab.querySelector('.ripple')).toBeNull();
    } finally {
        act(() => render(null, root));
        vi.useRealTimers();
    }
});
