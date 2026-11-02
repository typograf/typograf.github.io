// @vitest-environment jsdom
import { beforeEach, expect, test, vi } from 'vitest';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import Typograf from 'typograf';
import { saveFile } from '../../helpers/saveFile';

vi.mock('../../services/metrika', () => ({
    startMetrika: vi.fn(),
    metrikaReachGoal: vi.fn(),
}));
vi.mock('../../helpers/saveFile', () => ({ saveFile: vi.fn(() => true) }));

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    window.Typograf = Typograf;
    window.localStorage.clear();
    window.location.hash = '';
    document.body.innerHTML = '<div id="app"></div>';
});

async function mountApp() {
    const { initI18n } = await import('../../i18n/init');
    initI18n();
    const { App } = await import('./app');
    const root = document.getElementById('app')!;
    await act(async () => render(h(App, { language: 'ru' }), root));
    return root;
}

test('renders the editor and typographs entered text', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.input__text')!;

    expect(input).toBeTruthy();
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(root.querySelector<HTMLTextAreaElement>('.result__text')?.value).toBe('Привет «мир»');
    expect(window.localStorage.getItem('text')).toContain('Привет');
});

test('opens settings from the URL hash', async () => {
    window.location.hash = '#!prefs';
    const root = await mountApp();

    expect(root.querySelector('.prefs')?.classList.contains('prefs_opened')).toBe(true);
});

test('switches result views and returns from settings to the editor', async () => {
    const root = await mountApp();
    await act(async () => {
        root.querySelector<HTMLInputElement>('.result__as-diff')!.click();
        root.querySelector<HTMLElement>('.header__menu-item_tab_prefs')!.click();
    });

    expect(root.querySelector<HTMLElement>('.result__diff')?.style.display).toBe('block');
    expect(window.location.hash).toBe('#!prefs');
    expect(root.querySelector('.prefs')?.classList.contains('prefs_opened')).toBe(true);

    await act(async () => root.querySelector<HTMLElement>('.header__menu-item_tab_editor')!.click());
    expect(root.querySelector('.prefs')?.classList.contains('prefs_opened')).toBe(false);
});

test('persists locale and rule changes', async () => {
    const root = await mountApp();
    const locale = root.querySelector<HTMLSelectElement>('.prefs__set-locale')!;
    await act(async () => {
        locale.value = 'en-US';
        locale.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(window.localStorage.getItem('settings.locale')).toContain('en-US');

    const rule = root.querySelector<HTMLInputElement>('.prefs__rule-checkbox')!;
    const before = rule.checked;
    await act(async () => rule.click());
    expect(rule.checked).toBe(!before);
    expect(window.localStorage.getItem('settings.rules')).toContain('enabled');
});

test('loads saved text unless a hash supplies another text', async () => {
    window.localStorage.setItem('text', JSON.stringify('Сохранённый текст'));
    window.location.hash = '#!text=Новый%20текст';
    const root = await mountApp();
    expect(root.querySelector<HTMLTextAreaElement>('.input__text')?.value).toBe('Новый текст');
});

test('keeps HTML preview markup without executable attributes', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.input__text')!;
    await act(async () => {
        input.value = '<b>Привет</b><img src=x onerror=alert(1)>';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        root.querySelector<HTMLInputElement>('.result__as-html')!.click();
    });

    const preview = root.querySelector<HTMLElement>('.result__html')!;
    expect(preview.querySelector('b')?.textContent).toBe('Привет');
    expect(preview.querySelector('img')?.hasAttribute('onerror')).toBe(false);
});

test('keeps manual edits in the text result while switching views', async () => {
    const root = await mountApp();
    const result = root.querySelector<HTMLTextAreaElement>('.result__text')!;
    expect(result.readOnly).toBe(false);
    result.value = 'Мой вариант';
    await act(async () => {
        root.querySelector<HTMLInputElement>('.result__as-html')!.click();
        root.querySelector<HTMLInputElement>('.result__as-text')!.click();
    });
    expect(result.value).toBe('Мой вариант');
});

test('typographs string values in JSON', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.input__text')!;
    await act(async () => {
        input.value = JSON.stringify({ message: 'Привет "мир"' });
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const result = root.querySelector<HTMLTextAreaElement>('.result__text')!.value;
    expect(JSON.parse(result).message).toBe('Привет «мир»');
});

test('delays showing a result for long input', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.input__text')!;
    vi.useFakeTimers();
    try {
        await act(async () => {
            input.value = 'а'.repeat(10001);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        expect(root.querySelector<HTMLTextAreaElement>('.result__text')?.value).toBe('');
        await act(async () => { vi.advanceTimersByTime(250); });
        expect(root.querySelector<HTMLTextAreaElement>('.result__text')!.value.length).toBeGreaterThan(10000);
    } finally {
        vi.useRealTimers();
    }
});

test('saves the latest long result before the delayed display updates', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.input__text')!;
    vi.useFakeTimers();
    try {
        await act(async () => {
            input.value = 'а'.repeat(10001);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await act(async () => root.querySelector<HTMLButtonElement>('.save-file-button')!.click());
        expect(vi.mocked(saveFile).mock.calls[0][0].length).toBe(10001);
    } finally {
        vi.useRealTimers();
    }
});
