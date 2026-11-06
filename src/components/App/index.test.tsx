// @vitest-environment jsdom
import { beforeEach, expect, test, vi } from 'vitest';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import Typograf from 'typograf';
import { params } from 'lyam';
import { saveFile } from '../../helpers/saveFile';

vi.mock('lyam', () => ({
    hit: vi.fn(),
    notBounce: vi.fn(),
    params: vi.fn(),
}));
vi.mock('../../helpers/saveFile', () => ({ saveFile: vi.fn(() => true) }));

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    window.Typograf = Typograf;
    window.localStorage.clear();
    window.location.hash = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-tab');
    document.body.innerHTML = '<div id="app"></div><main id="about-content"><article class="about-article">О сервисе</article></main>';
});

test('changes the theme from the header and saves the choice', async () => {
    const root = await mountApp();
    const select = root.querySelector<HTMLSelectElement>('.header__theme-select')!;
    expect(select.value).toBe('system');

    await act(async () => {
        select.value = 'dark';
        select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('settings.theme')).toBe('"dark"');

    await act(async () => {
        select.value = 'light';
        select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(document.documentElement.dataset.theme).toBe('light');
});

test('restores a saved theme and follows system changes', async () => {
    window.localStorage.setItem('settings.theme', '"dark"');
    const root = await mountApp();
    const select = root.querySelector<HTMLSelectElement>('.header__theme-select')!;
    expect(select.value).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    let notify = () => {};
    const media = {
        matches: true,
        addEventListener: vi.fn((_event: string, listener: () => void) => { notify = listener; }),
        removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => media });
    try {
        await act(async () => {
            select.value = 'system';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });
        expect(document.documentElement.dataset.theme).toBe('dark');
        media.matches = false;
        await act(async () => notify());
        expect(document.documentElement.dataset.theme).toBe('light');
        expect(window.localStorage.getItem('settings.theme')).toBe('"system"');
        await act(async () => render(null, root));
        expect(media.removeEventListener).toHaveBeenCalled();
    } finally {
        Reflect.deleteProperty(window, 'matchMedia');
    }
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

test('reformats text when the eyo script finishes loading', async () => {
    Reflect.deleteProperty(window, 'safeEyo');
    const script = document.createElement('script');
    script.src = '/dist/eyo.js';
    document.head.append(script);
    try {
        const root = await mountApp();
        const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
        await act(async () => {
            input.value = 'Ежик шел';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        expect(root.querySelector<HTMLTextAreaElement>('.result-panel__text')?.value).toBe('Ежик шел');

        window.safeEyo = { restore: text => text.replace('Ежик шел', 'Ёжик шёл') };
        await act(async () => { script.dispatchEvent(new Event('load')); });
        expect(root.querySelector<HTMLTextAreaElement>('.result-panel__text')?.value).toBe('Ёжик шёл');
    } finally {
        script.remove();
        Reflect.deleteProperty(window, 'safeEyo');
    }
});

test('opens settings from the URL hash', async () => {
    window.location.hash = '#!prefs';
    const root = await mountApp();

    expect(root.querySelector('.settings-panel')?.classList.contains('settings-panel_opened')).toBe(true);
});

test('opens the About tab from its URL and returns to the editor', async () => {
    window.location.hash = '#!about';
    const root = await mountApp();

    expect(root.querySelector('.header__menu-item_tab_about')?.textContent).toBe('О сервисе');
    expect(root.querySelector('.header__menu-item_tab_about')?.classList.contains('header__menu-item_selected')).toBe(true);
    expect(document.documentElement.dataset.tab).toBe('about');
    expect(document.querySelector('#about-content .about-article')?.textContent).toBe('О сервисе');
    expect(document.body.style.overflowY).toBe('visible');

    await act(async () => root.querySelector<HTMLElement>('.header__menu-item_tab_editor')!.click());
    expect(window.location.hash).toBe('');
    expect(document.documentElement.dataset.tab).toBe('editor');
    expect(root.querySelector('.header__menu-item_tab_editor')?.classList.contains('header__menu-item_selected')).toBe(true);
    expect(root.querySelector('.header__menu-item_tab_editor .ripple')).toBeTruthy();
});

test('keeps the editor text while visiting About and handles browser hash navigation', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = 'Текст для проверки';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        root.querySelector<HTMLElement>('.header__menu-item_tab_about')!.click();
    });
    expect(window.location.hash).toBe('#!about');
    expect(document.documentElement.dataset.tab).toBe('about');

    await act(async () => {
        window.history.replaceState(null, '', '#!prefs');
        window.dispatchEvent(new Event('hashchange'));
    });
    expect(document.documentElement.dataset.tab).toBe('prefs');
    expect(document.body.style.overflowY).toBe('hidden');

    await act(async () => root.querySelector<HTMLElement>('.header__menu-item_tab_editor')!.click());
    expect(root.querySelector<HTMLTextAreaElement>('.source-text-input__text')?.value).toBe('Текст для проверки');
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

test('persists locale and rule changes and sends them as visit parameters', async () => {
    const root = await mountApp();
    const locale = root.querySelector<HTMLSelectElement>('.typograf-locale-select__set-locale')!;
    await act(async () => {
        locale.value = 'en-US';
        locale.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(window.localStorage.getItem('settings.locale')).toContain('en-US');
    expect(params).toHaveBeenCalledWith('28700106', { actions: { 'select-locale': 'en-US' } });

    const rule = root.querySelector<HTMLInputElement>('.rule-group__rule-checkbox')!;
    const before = rule.checked;
    await act(async () => rule.click());
    expect(rule.checked).toBe(!before);
    expect(window.localStorage.getItem('settings.rules')).toContain('enabled');
    expect(params).toHaveBeenCalledWith('28700106', { actions: { 'settings-click-rule': 1 } });
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

test('expands and collapses a rule group while keeping its rules available', async () => {
    const root = await mountApp();
    const group = root.querySelector<HTMLElement>('.rule-group')!;
    const legend = group.querySelector<HTMLElement>('.rule-group__legend')!;
    const content = group.querySelector<HTMLElement>('.rule-group__group-rules')!;
    const count = content.querySelectorAll('.rule-group__rule-checkbox').length;

    expect(legend.getAttribute('aria-expanded')).toBe('false');
    expect(content.getAttribute('aria-hidden')).toBe('true');
    await act(async () => legend.click());
    expect(group.classList.contains('rule-group_visible')).toBe(true);
    expect(legend.getAttribute('aria-expanded')).toBe('true');
    expect(legend.querySelector('.ripple')).toBeTruthy();
    expect(content.getAttribute('aria-hidden')).toBe('false');
    await act(async () => legend.click());
    expect(legend.getAttribute('aria-expanded')).toBe('false');
    expect(content.querySelectorAll('.rule-group__rule-checkbox')).toHaveLength(count);
});

test('shows the enabled and total rules in each group title', async () => {
    const root = await mountApp();
    for (const item of root.querySelectorAll<HTMLElement>('.rule-group')) {
        const itemRules = [...item.querySelectorAll<HTMLInputElement>('.rule-group__rule-checkbox')];
        const enabled = itemRules.filter(rule => rule.checked).length;
        const itemCounter = item.querySelector<HTMLElement>('.rule-group__count');
        expect(itemCounter?.textContent).toBe(`${enabled}/${itemRules.length}`);
        expect(itemCounter?.classList.contains('rule-group__count_empty')).toBe(enabled === 0);
        expect(itemCounter?.classList.contains('rule-group__count_complete')).toBe(enabled === itemRules.length);
    }
    const group = root.querySelector<HTMLElement>('.rule-group')!;
    const rules = [...group.querySelectorAll<HTMLInputElement>('.rule-group__rule-checkbox')];
    const counter = group.querySelector<HTMLElement>('.rule-group__count');
    const selected = () => rules.filter(rule => rule.checked).length;

    expect(counter?.textContent).toBe(`${selected()}/${rules.length}`);
    await act(async () => rules[0].click());
    expect(counter?.textContent).toBe(`${selected()}/${rules.length}`);
    expect(counter?.classList.contains('rule-group__count_complete')).toBe(selected() === rules.length);

    await act(async () => root.querySelector<HTMLInputElement>('.rule-settings__all-rules')!.click());
    expect(counter?.textContent).toBe(`${rules.length}/${rules.length}`);
    expect(counter?.classList.contains('rule-group__count_complete')).toBe(true);

    await act(async () => root.querySelector<HTMLButtonElement>('.settings-panel__default')!.click());
    expect(counter?.textContent).toBe(`${selected()}/${rules.length}`);
});

test('filters rules by their displayed name and opens matching groups', async () => {
    const root = await mountApp();
    const search = root.querySelector<HTMLInputElement>('.rule-settings__search')!;
    expect(search).toBeTruthy();
    const target = [...root.querySelectorAll<HTMLElement>('.rule-group__rule')]
        .find(rule => rule.textContent?.toLowerCase().includes('буквы'))!;
    const originalCount = target.closest('.rule-group')!.querySelector('.rule-group__count')!.textContent;
    const initialGroups = root.querySelectorAll('.rule-group').length;

    await act(async () => {
        search.value = '  БУКВЫ  ';
        search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const matches = [...root.querySelectorAll<HTMLElement>('.rule-group__rule')];
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every(rule => rule.textContent?.toLowerCase().includes('буквы'))).toBe(true);
    expect(root.querySelectorAll('.rule-group').length).toBeLessThan(initialGroups);
    expect(root.querySelector('.rule-group__legend')?.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector('.rule-group__count')?.textContent).toBe(originalCount);

    await act(async () => {
        search.value = 'правило-которого-нет';
        search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(root.querySelectorAll('.rule-group')).toHaveLength(0);
    expect(root.querySelector('.rule-settings__no-results')?.textContent).toBe('Правила не найдены');
    expect(root.querySelector<HTMLInputElement>('.rule-settings__all-rules')?.disabled).toBe(true);

    await act(async () => {
        search.value = '';
        search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(root.querySelectorAll('.rule-group')).toHaveLength(initialGroups);
});

test('select all changes only the rules matched by the search', async () => {
    const root = await mountApp();
    const allBefore = new Map([...root.querySelectorAll<HTMLInputElement>('.rule-group__rule-checkbox')]
        .map(rule => [rule.name, rule.checked]));
    const search = root.querySelector<HTMLInputElement>('.rule-settings__search')!;
    expect(search).toBeTruthy();
    await act(async () => {
        search.value = 'буквы';
        search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const matched = new Set([...root.querySelectorAll<HTMLInputElement>('.rule-group__rule-checkbox')]
        .map(rule => rule.name));
    expect(matched.size).toBeGreaterThan(0);
    const selectAll = root.querySelector<HTMLInputElement>('.rule-settings__all-rules')!;
    await act(async () => selectAll.click());
    const checked = selectAll.checked;

    await act(async () => {
        search.value = '';
        search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    for (const rule of root.querySelectorAll<HTMLInputElement>('.rule-group__rule-checkbox')) {
        expect(rule.checked).toBe(matched.has(rule.name) ? checked : allBefore.get(rule.name));
    }
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
