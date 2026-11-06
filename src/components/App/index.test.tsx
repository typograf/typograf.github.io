// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
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

afterEach(async () => {
    const root = document.getElementById('app');
    if (root) await act(async () => render(null, root));
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

    expect(input.value).toBe('Привет "мир"');
    expect(root.querySelector('.editor-columns__right')).toBeNull();
    const execute = root.querySelector<HTMLButtonElement>('.editor-panel__execute');
    expect(execute?.textContent).toBe('Типографировать');
    await act(async () => execute!.click());
    expect(input.value).toBe('Привет «мир»');
    expect(window.localStorage.getItem('text')).toBe(JSON.stringify(input.value));
});

test('shows the source format, caret coordinates and text length', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    const readStatus = () => Array.from(root.querySelector('.source-text-input__status')?.children ?? [],
        item => item.textContent);
    expect(readStatus()).toEqual(['Строка 1, Столбец 1', 'Символов: 0', 'Формат: Текст']);

    await act(async () => {
        input.value = '<b>😀</b>\nтекст';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(readStatus()).toEqual(['Строка 2, Столбец 6', 'Символов: 14', 'Формат: HTML']);

    await act(async () => {
        input.setSelectionRange(5, 5);
        input.dispatchEvent(new Event('selectionchange'));
    });
    expect(readStatus()).toEqual(['Строка 1, Столбец 5', 'Символов: 14', 'Формат: HTML']);

    await act(async () => {
        input.setSelectionRange(6, 6);
        input.dispatchEvent(new Event('selectionchange'));
    });
    expect(readStatus()).toEqual(['Строка 1, Столбец 6', 'Символов: 14', 'Формат: HTML']);

    await act(async () => root.querySelector<HTMLButtonElement>('.source-text-input__clear')!.click());
    expect(readStatus()).toEqual(['Строка 1, Столбец 1', 'Символов: 0', 'Формат: Текст']);
});

test('only enables typographing when the source field has text', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    const execute = root.querySelector<HTMLButtonElement>('.editor-panel__execute')!;
    expect(execute.disabled).toBe(true);

    await act(async () => {
        input.value = 'Текст';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(execute.disabled).toBe(false);

    await act(async () => root.querySelector<HTMLButtonElement>('.source-text-input__clear')!.click());
    expect(execute.disabled).toBe(true);
});

test('counts selected characters even when the caret stays in place', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    const status = root.querySelector('.source-text-input__status')!;
    await act(async () => {
        input.value = '😀\nа';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.setSelectionRange(0, 2, 'backward');
        input.dispatchEvent(new Event('selectionchange'));
    });
    expect(Array.from(status.children, item => item.textContent))
        .toEqual(['Выбрано: 1', 'Символов: 3', 'Формат: Текст']);

    await act(async () => {
        input.setSelectionRange(0, 4, 'backward');
        input.dispatchEvent(new Event('selectionchange'));
    });
    expect(status.textContent).toContain('Выбрано: 3');

    await act(async () => {
        input.setSelectionRange(0, 0);
        input.dispatchEvent(new Event('selectionchange'));
    });
    expect(Array.from(status.children, item => item.textContent))
        .toEqual(['Строка 1, Столбец 1', 'Символов: 3', 'Формат: Текст']);
});

test.each([
    ['MacIntel', { metaKey: true }, '⌘ + Enter'],
    ['Win32', { ctrlKey: true }, 'Ctrl + Enter'],
] as const)('typographs with the platform shortcut on %s', async (platform, modifier, shortcut) => {
    const platformMock = vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue(platform);
    try {
        const root = await mountApp();
        const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
        expect(root.querySelector<HTMLButtonElement>('.editor-panel__execute')?.title).toBe(`Типографировать (${shortcut})`);
        await act(async () => {
            input.value = 'Привет "мир"';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await act(async () => {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        });
        expect(input.value).toBe('Привет "мир"');

        const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...modifier });
        await act(async () => { input.dispatchEvent(event); });
        expect(event.defaultPrevented).toBe(true);
        expect(input.value).toBe('Привет «мир»');
        expect(window.localStorage.getItem('text')).toBe(JSON.stringify(input.value));

        await act(async () => {
            input.value = 'Привет  "мир"';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const selectionShortcut = () => new KeyboardEvent('keydown', {
            key: 'Enter', bubbles: true, cancelable: true, shiftKey: true, ...modifier,
        });
        const withoutSelection = selectionShortcut();
        await act(async () => { input.dispatchEvent(withoutSelection); });
        expect(withoutSelection.defaultPrevented).toBe(false);
        expect(input.value).toBe('Привет  "мир"');

        await act(async () => {
            input.setSelectionRange(8, 13);
            input.dispatchEvent(new Event('selectionchange'));
        });
        expect(root.querySelector<HTMLButtonElement>('.editor-panel__execute-selection')?.title)
            .toBe(`Типографировать выбранное (${shortcut.replace('Enter', 'Shift + Enter')})`);
        const withSelection = selectionShortcut();
        await act(async () => { input.dispatchEvent(withSelection); });
        expect(withSelection.defaultPrevented).toBe(true);
        expect(input.value).toBe('Привет  «мир»');
        expect(input.value.slice(input.selectionStart, input.selectionEnd)).toBe('«мир»');
    } finally {
        platformMock.mockRestore();
    }
});

test('uses the eyo script on demand without typographing the preview automatically', async () => {
    Reflect.deleteProperty(window, 'safeEyo');
    const script = document.createElement('script');
    script.src = '/dist/eyo.js';
    document.head.append(script);
    try {
        const root = await mountApp();
        const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
        await act(async () => root.querySelector<HTMLInputElement>('.editor-panel__preview-toggle')!.click());
        await act(async () => {
            input.value = 'Ежик шел "домой"';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        expect(root.querySelector('.result-panel__html')?.textContent).toBe('Ежик шел "домой"');

        window.safeEyo = { restore: text => text.replace('Ежик шел', 'Ёжик шёл') };
        await act(async () => { script.dispatchEvent(new Event('load')); });
        expect(root.querySelector('.result-panel__html')?.textContent).toBe('Ежик шел "домой"');
        await act(async () => root.querySelector<HTMLButtonElement>('.editor-panel__execute')!.click());
        expect(input.value).toBe('Ёжик шёл «домой»');
        expect(root.querySelector('.result-panel__html')?.textContent).toBe('Ёжик шёл «домой»');
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
    await act(async () => root.querySelector<HTMLInputElement>('.editor-panel__preview-toggle')!.click());
    expect(root.querySelector('.result-panel__html')).toBeTruthy();
    expect(root.querySelector('.result-panel__as-text')).toBeNull();
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
    await act(async () => root.querySelector<HTMLInputElement>('.editor-panel__preview-toggle')!.click());
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = '<b>Привет</b><img src=x onerror=alert(1)>';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const preview = root.querySelector<HTMLElement>('.result-panel__html')!;
    expect(preview.querySelector('b')?.textContent).toBe('Привет');
    expect(preview.querySelector('img')?.hasAttribute('onerror')).toBe(false);
});

test('remembers preview visibility between visits', async () => {
    window.localStorage.setItem('settings.preview', 'true');
    window.localStorage.setItem('text', JSON.stringify('Сохранённый текст'));
    const root = await mountApp();
    const toggle = root.querySelector<HTMLInputElement>('.editor-panel__preview-toggle')!;
    expect(toggle.checked).toBe(true);
    expect(root.querySelector('.result-panel__html')?.textContent).toBe('Сохранённый текст');

    await act(async () => toggle.click());
    expect(root.querySelector('.editor-columns__right')).toBeNull();
    expect(window.localStorage.getItem('settings.preview')).toBe('false');

    await act(async () => toggle.click());
    expect(root.querySelector('.result-panel__html')).toBeTruthy();
    expect(window.localStorage.getItem('settings.preview')).toBe('true');
});

test('shows the changes from the last typograph action after opening preview', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => root.querySelector<HTMLButtonElement>('.editor-panel__execute')!.click());
    await act(async () => root.querySelector<HTMLInputElement>('.editor-panel__preview-toggle')!.click());
    expect(root.querySelector('.result-panel__html')?.textContent).toBe(input.value);

    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-diff')!.click());
    expect(root.querySelector('.result-panel__diff del')?.textContent).toBe('"');
    expect(root.querySelector('.result-panel__diff ins')?.textContent).toBe('«');
});

test('typographs string values in JSON', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = JSON.stringify({ message: 'Привет "мир"' });
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => root.querySelector<HTMLButtonElement>('.editor-panel__execute')!.click());
    expect(JSON.parse(input.value).message).toBe('Привет «мир»');
});

test('applies new settings only on the next typograph action', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    const execute = root.querySelector<HTMLButtonElement>('.editor-panel__execute')!;
    await act(async () => root.querySelector<HTMLInputElement>('.editor-panel__preview-toggle')!.click());
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => execute.click());
    await act(async () => {
        input.value = 'Новый "текст"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        root.querySelector<HTMLElement>('.header__menu-item_tab_prefs')!.click();
    });
    const mode = root.querySelector<HTMLSelectElement>('.html-entity-settings__set-mode')!;
    await act(async () => {
        mode.value = 'name';
        mode.dispatchEvent(new Event('change', { bubbles: true }));
        root.querySelector<HTMLElement>('.header__menu-item_tab_editor')!.click();
    });
    expect(input.value).toBe('Новый "текст"');
    expect(root.querySelector('.result-panel__html')?.textContent).toBe('Новый "текст"');

    await act(async () => execute.click());
    expect(input.value).toBe('Новый &laquo;текст&raquo;');
    expect(root.querySelector('.result-panel__html')?.textContent).toBe('Новый «текст»');
});

test('updates HTML on input and shows changes only after typographing', async () => {
    const root = await mountApp();
    await act(async () => root.querySelector<HTMLInputElement>('.editor-panel__preview-toggle')!.click());
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    const execute = root.querySelector<HTMLButtonElement>('.editor-panel__execute')!;
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(root.querySelector('.result-panel__html')?.textContent).toBe('Привет "мир"');
    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-diff')!.click());
    expect(root.querySelector('.result-panel__diff')?.textContent).toBe('');
    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-html')!.click());
    await act(async () => execute.click());

    await act(async () => {
        input.value = 'Новый "текст"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(root.querySelector('.result-panel__html')?.textContent).toBe('Новый "текст"');
    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-diff')!.click());
    expect(root.querySelector('.result-panel__diff')?.textContent).toContain('Привет');
    expect(root.querySelector('.result-panel__diff ins')?.textContent).toBe('«');

    await act(async () => execute.click());
    expect(root.querySelector('.result-panel__diff')?.textContent).toContain('Новый');
    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-html')!.click());
    expect(root.querySelector('.result-panel__html')?.textContent).toBe('Новый «текст»');
});

test('saves the text currently in the editor', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => root.querySelector<HTMLButtonElement>('.save-file-button')!.click());
    expect(saveFile).toHaveBeenLastCalledWith('Привет "мир"');

    await act(async () => root.querySelector<HTMLButtonElement>('.editor-panel__execute')!.click());
    await act(async () => root.querySelector<HTMLButtonElement>('.save-file-button')!.click());
    expect(saveFile).toHaveBeenLastCalledWith('Привет «мир»');
});

test('keeps the selection when clicking actions under the editor', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = 'Привет  "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
        input.setSelectionRange(8, 13, 'backward');
    });

    const save = root.querySelector<HTMLButtonElement>('.save-file-button')!;
    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    await act(async () => { save.dispatchEvent(press); });
    expect(press.defaultPrevented).toBe(true);
    await act(async () => save.click());
    expect(saveFile).toHaveBeenLastCalledWith('Привет  "мир"');
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(8);
    expect(input.selectionEnd).toBe(13);

    await act(async () => root.querySelector<HTMLButtonElement>('.editor-panel__execute')!.click());
    expect(input.value.slice(input.selectionStart, input.selectionEnd)).toBe('«мир»');
    expect(input.selectionDirection).toBe('backward');
});

test('selects the full editor text from the button before Copy', async () => {
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    const selectAll = root.querySelector<HTMLButtonElement>('.editor-panel__select-all');
    expect(selectAll?.textContent).toBe('Выделить всё');
    expect(selectAll?.previousElementSibling).toBe(root.querySelector('.editor-panel__execute-selection'));
    expect(selectAll?.nextElementSibling?.contains(root.querySelector('.copy-button'))).toBe(true);
    expect(selectAll?.disabled).toBe(true);

    await act(async () => {
        input.value = 'Первая\nВторая';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(selectAll?.disabled).toBe(false);
    await act(async () => selectAll!.click());
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
    await vi.waitFor(() => {
        expect(root.querySelector('.source-text-input__status')?.textContent).toContain('Выбрано: 13');
        expect(root.querySelector('.editor-panel__execute-selection')).toBeTruthy();
    });
});

test('keeps the copy label stable and copies the indicated text', async () => {
    const copied: string[] = [];
    const selectedHtml = '<b>мир &amp; &lt;i&gt; 😀123456789</b><img src=x onerror=alert(1)>';
    const text = `Привет, ${selectedHtml}!`;
    Object.defineProperty(document, 'execCommand', {
        configurable: true,
        value: () => {
            copied.push(document.querySelector<HTMLTextAreaElement>('body > textarea')!.value);
            return true;
        },
    });
    try {
        const root = await mountApp();
        const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
        const copy = root.querySelector<HTMLButtonElement>('.copy-button')!;
        expect(copy.disabled).toBe(true);
        await act(async () => {
            input.value = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.setSelectionRange(8, 8 + selectedHtml.length);
            input.dispatchEvent(new Event('selectionchange'));
        });
        expect(copy.disabled).toBe(false);
        expect(copy.textContent).toBe('Скопировать');
        expect(copy.title).toBe('Скопировать выбранное');
        await act(async () => copy.click());
        const feedback = () => copy.parentElement?.querySelector('.tooltip_anchored');
        expect(feedback()?.firstChild?.textContent).toBe('Выделенный текст скопирован:');
        const excerpt = feedback()?.querySelector('.tooltip__excerpt');
        expect(excerpt?.textContent).toBe('мир & <i> 😀12345…');
        expect(excerpt?.querySelector('i, img')).toBeNull();

        await act(async () => {
            input.select();
            input.dispatchEvent(new Event('selectionchange'));
        });
        expect(copy.textContent).toBe('Скопировать');
        expect(copy.title).toBe('Скопировать всё');
        await act(async () => copy.click());
        expect(feedback()?.textContent).toBe('Весь текст скопирован');

        await act(async () => {
            input.setSelectionRange(8, 8);
            input.dispatchEvent(new Event('selectionchange'));
        });
        expect(copy.textContent).toBe('Скопировать');
        expect(copy.title).toBe('Скопировать всё');
        await act(async () => copy.click());
        expect(feedback()?.textContent).toBe('Весь текст скопирован');
        expect(copied).toEqual([selectedHtml, text, text]);

        await act(async () => root.querySelector<HTMLButtonElement>('.source-text-input__clear')!.click());
        expect(copy.disabled).toBe(true);
    } finally {
        Reflect.deleteProperty(document, 'execCommand');
    }
});

test('typographs only the selected fragment and keeps it selected', async () => {
    window.localStorage.setItem('text', JSON.stringify('До\r\n  "мир  всем"  после'));
    const root = await mountApp();
    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    const execute = root.querySelector<HTMLButtonElement>('.editor-panel__execute-selection');
    expect(execute?.classList.contains('editor-panel__execute-selection_hidden')).toBe(true);

    await act(async () => {
        input.setSelectionRange(5, 16, 'backward');
        input.dispatchEvent(new Event('selectionchange'));
    });
    expect(execute?.textContent).toBe('Типографировать выбранное');
    expect(execute?.classList.contains('editor-panel__execute-selection_hidden')).toBe(false);
    await act(async () => execute!.click());
    expect(input.value).toBe('До\n  «мир всем»  после');
    expect(input.value.slice(input.selectionStart, input.selectionEnd)).toBe('«мир всем»');
    expect(input.selectionDirection).toBe('backward');
    expect(window.localStorage.getItem('text')).toBe(JSON.stringify('До\r\n  «мир всем»  после'));

    await act(async () => {
        input.setSelectionRange(5, 5);
        input.dispatchEvent(new Event('selectionchange'));
    });
    expect(root.querySelector('.editor-panel__execute-selection')).toBe(execute);
    expect(execute?.classList.contains('editor-panel__execute-selection_hidden')).toBe(true);

    await act(async () => root.querySelector<HTMLInputElement>('.editor-panel__preview-toggle')!.click());
    await act(async () => root.querySelector<HTMLInputElement>('.result-panel__as-diff')!.click());
    expect(root.querySelector('.result-panel__diff ins')?.textContent).toBe('«');
});

test('renders action icons and shares the current editor text when supported', async () => {
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
        expect(share).toHaveBeenCalledWith({ text: 'Привет "мир"', title: 'Typograf' });
    } finally {
        Reflect.deleteProperty(window.navigator, 'canShare');
        Reflect.deleteProperty(window.navigator, 'share');
    }
});
