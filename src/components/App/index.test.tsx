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
    const { App } = await import('./index');
    const root = document.getElementById('app')!;
    await act(async () => render(h(App, { language: 'ru' }), root));
    return root;
}

test('renders the editor and typographs entered text', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;

    expect(input).toBeTruthy();
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(root.querySelector<HTMLTextAreaElement>('.result-panel__text')?.value).toBe('Привет «мир»');
    expect(window.localStorage.getItem('text')).toContain('Привет');
});

test('opens settings from the URL hash', async () => {
    window.location.hash = '#!prefs';
    const root = await mountApp();

    expect(root.querySelector('.settings-panel')?.classList.contains('settings-panel_opened')).toBe(true);
});

test('syncs settings with hash changes and restores page scrolling after unmount', async () => {
    const root = await mountApp();
    expect(document.body.style.overflowY).toBe('visible');

    await act(async () => {
        window.history.replaceState(null, '', '#!prefs');
        window.dispatchEvent(new Event('hashchange'));
    });
    expect(root.querySelector('.settings-panel')?.classList.contains('settings-panel_opened')).toBe(true);
    expect(document.body.style.overflowY).toBe('hidden');

    await act(async () => render(null, root));
    expect(document.body.style.overflowY).toBe('');
});

test('switches result views and returns from settings to the editor', async () => {
    const root = await mountApp();
    expect(root.querySelector('.result-panel__text')).toBeTruthy();
    expect(root.querySelector('.result-panel__html')).toBeNull();
    expect(root.querySelector('.result-panel__diff')).toBeNull();
    await act(async () => {
        root.querySelector<HTMLInputElement>('.result-panel__as-diff')!.click();
        root.querySelector<HTMLElement>('.header__menu-item_tab_prefs')!.click();
    });

    expect(root.querySelector('.result-panel__diff')).toBeTruthy();
    expect(root.querySelector('.result-panel__text')).toBeNull();
    expect(root.querySelector('.result-panel__html')).toBeNull();
    expect(window.location.hash).toBe('#!prefs');
    expect(root.querySelector('.settings-panel')?.classList.contains('settings-panel_opened')).toBe(true);

    await act(async () => root.querySelector<HTMLElement>('.header__menu-item_tab_editor')!.click());
    expect(root.querySelector('.settings-panel')?.classList.contains('settings-panel_opened')).toBe(false);
});

test('persists locale and rule changes', async () => {
    const root = await mountApp();
    const locale = root.querySelector<HTMLSelectElement>('.typograf-locale-select__set-locale')!;
    await act(async () => {
        locale.value = 'en-US';
        locale.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(window.localStorage.getItem('settings.locale')).toContain('en-US');

    const rule = root.querySelector<HTMLInputElement>('.rule-group__rule-checkbox')!;
    const before = rule.checked;
    await act(async () => rule.click());
    expect(rule.checked).toBe(!before);
    expect(window.localStorage.getItem('settings.rules')).toContain('enabled');
});

test('keeps entity settings and preview in sync, then resets them', async () => {
    const root = await mountApp();
    const mode = root.querySelector<HTMLSelectElement>('.html-entity-settings__set-mode')!;
    await act(async () => {
        mode.value = 'name';
        mode.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(mode.value).toBe('name');
    expect(root.querySelector<HTMLElement>('.html-entity-settings__invisible-symbols-container')?.style.display).toBe('inline-block');
    expect(root.querySelector('.html-entity-settings__html-entities-example')?.textContent).toContain('&');

    await act(async () => root.querySelector<HTMLElement>('.html-entity-settings__only-invisible')!.click());
    expect(window.localStorage.getItem('settings.onlyInvisible')).toBe('true');
    await act(async () => root.querySelector<HTMLElement>('.settings-panel__default')!.click());
    expect(mode.value).toBe('default');
    expect(root.querySelector<HTMLInputElement>('.html-entity-settings__only-invisible')?.checked).toBe(true);
});

test('selects all rules and restores their defaults', async () => {
    const root = await mountApp();
    const rules = () => [...root.querySelectorAll<HTMLInputElement>('.rule-group__rule-checkbox')];
    const initial = rules().map(rule => rule.checked);
    const selectAll = root.querySelector<HTMLInputElement>('.rule-settings__all-rules')!;
    await act(async () => selectAll.click());
    expect(rules().every(rule => rule.checked === selectAll.checked)).toBe(true);
    await act(async () => rules()[0].click());
    expect(selectAll.indeterminate).toBe(true);
    await act(async () => root.querySelector<HTMLElement>('.settings-panel__default')!.click());
    expect(rules().map(rule => rule.checked)).toEqual(initial);
});

test('loads saved text unless a hash supplies another text', async () => {
    window.localStorage.setItem('text', JSON.stringify('Сохранённый текст'));
    window.location.hash = '#!text=Новый%20текст';
    const root = await mountApp();
    expect(root.querySelector<HTMLTextAreaElement>('.source-text-input__text')?.value).toBe('Новый текст');
});

test('keeps HTML preview markup without executable attributes', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = '<b>Привет</b><img src=x onerror=alert(1)>';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        root.querySelector<HTMLInputElement>('.result-panel__as-html')!.click();
    });

    const preview = root.querySelector<HTMLElement>('.result-panel__html')!;
    expect(preview.querySelector('b')?.textContent).toBe('Привет');
    expect(preview.querySelector('img')?.hasAttribute('onerror')).toBe(false);
});

test('keeps manual edits in the text result while switching views', async () => {
    const root = await mountApp();
    const result = root.querySelector<HTMLTextAreaElement>('.result-panel__text')!;
    expect(result.readOnly).toBe(false);
    result.value = 'Мой вариант';
    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-html')!.click());
    expect(result.isConnected).toBe(false);
    expect(root.querySelector('.result-panel__html')).toBeTruthy();
    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-text')!.click());
    expect(root.querySelector<HTMLTextAreaElement>('.result-panel__text')?.value).toBe('Мой вариант');
});

test('shows the latest formatted text after editing while HTML view is selected', async () => {
    const root = await mountApp();
    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-html')!.click());
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-text')!.click());
    expect(root.querySelector<HTMLTextAreaElement>('.result-panel__text')?.value).toBe('Привет «мир»');
});

test('typographs string values in JSON', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = JSON.stringify({ message: 'Привет "мир"' });
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const result = root.querySelector<HTMLTextAreaElement>('.result-panel__text')!.value;
    expect(JSON.parse(result).message).toBe('Привет «мир»');
});

test('delays showing a result for long input', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    vi.useFakeTimers();
    try {
        await act(async () => {
            input.value = 'а'.repeat(10001);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        expect(root.querySelector<HTMLTextAreaElement>('.result-panel__text')?.value).toBe('');
        await act(async () => { vi.advanceTimersByTime(250); });
        expect(root.querySelector<HTMLTextAreaElement>('.result-panel__text')!.value.length).toBeGreaterThan(10000);
    } finally {
        vi.useRealTimers();
    }
});

test('saves the latest long result before the delayed display updates', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
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

test('renders action icons and shares the current result when supported', async () => {
    const canShare = vi.fn(() => true);
    const share = vi.fn(async () => undefined);
    Object.defineProperty(window.navigator, 'canShare', { configurable: true, value: canShare });
    Object.defineProperty(window.navigator, 'share', { configurable: true, value: share });
    try {
        const root = await mountApp();
        expect(root.querySelector('.copy-button .copy-button__icon')).toBeTruthy();
        expect(root.querySelector('.save-file-button .save-file-button__icon')).toBeTruthy();
        const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
        await act(async () => {
            input.value = 'Привет "мир"';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await act(async () => root.querySelector<HTMLButtonElement>('.share-button')!.click());
        expect(share).toHaveBeenCalledWith({ text: 'Привет «мир»', title: 'Typograf' });
    } finally {
        Reflect.deleteProperty(window.navigator, 'canShare');
        Reflect.deleteProperty(window.navigator, 'share');
    }
});
