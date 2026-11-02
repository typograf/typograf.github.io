// @vitest-environment jsdom
import { beforeEach, expect, test, vi } from 'vitest';
import { act } from 'preact/test-utils';
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import Typograf from 'typograf';

vi.mock('./services/metrika', () => ({
    startMetrika: vi.fn(),
    metrikaReachGoal: vi.fn(),
}));

beforeEach(() => {
    vi.resetModules();
    window.Typograf = Typograf;
    window.localStorage.clear();
    window.location.hash = '';
    document.body.innerHTML = '<div id="app"></div><footer><span id="extension"></span><span id="language-selector"></span></footer>';
});

test('mounts Preact roots and changes language without losing text', async () => {
    await act(async () => { await import('./index'); });
    const input = document.querySelector<HTMLTextAreaElement>('.input__text')!;
    expect(input).toBeTruthy();
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
        document.querySelector<HTMLElement>('.language-selector')!.click();
    });

    expect(document.querySelector('.header__menu-item_tab_editor')?.textContent).toBe('Editor');
    expect(document.querySelector<HTMLTextAreaElement>('.input__text')?.value).toBe('Привет "мир"');
    expect(document.querySelector('#extension .extension')?.textContent).toBe('Extension for');
});

test('selects the Firefox extension link in the browser', async () => {
    Object.defineProperty(window, 'InstallTrigger', { configurable: true, value: {} });
    try {
        await act(async () => { await import('./index'); });
        const link = document.querySelector<HTMLAnchorElement>('#extension .extension__link');
        expect(link?.getAttribute('href')).toBe('https://addons.mozilla.org/ru/firefox/addon/typografy/');
        expect(link?.textContent).toBe('Mozilla Firefox');
    } finally {
        Reflect.deleteProperty(window, 'InstallTrigger');
    }
});

test('hydrates prerendered editor markup instead of replacing it', async () => {
    const { initI18n } = await import('./i18n/init');
    initI18n();
    const { App } = await import('./components/App/App');
    const { LanguageSelector } = await import('./components/LanguageSelector/LanguageSelector');
    const { Extension } = await import('./components/Extension/Extension');
    const root = document.getElementById('app')!;
    root.innerHTML = renderToString(h(App, { language: 'ru' }));
    const languageRoot = document.getElementById('language-selector')!;
    languageRoot.innerHTML = renderToString(h(LanguageSelector, { language: 'ru', onChange: () => {} }));
    const extensionRoot = document.getElementById('extension')!;
    extensionRoot.innerHTML = renderToString(h(Extension, {}));
    const extensionLink = extensionRoot.querySelector('.extension__link');
    const header = root.querySelector('.header');

    await act(async () => { await import('./index'); });
    expect(root.querySelector('.header')).toBe(header);
    expect(root.querySelectorAll('.header').length).toBe(1);
    expect(extensionRoot.querySelector('.extension__link')).toBe(extensionLink);

    const input = root.querySelector<HTMLTextAreaElement>('.input__text')!;
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(root.querySelector<HTMLTextAreaElement>('.result__text')?.value).toBe('Привет «мир»');
    await act(async () => languageRoot.querySelector<HTMLElement>('.language-selector')!.click());
    expect(root.querySelector('.header__menu-item_tab_editor')?.textContent).toBe('Editor');
    expect(root.querySelector<HTMLTextAreaElement>('.input__text')?.value).toBe('Привет "мир"');
});

test('uses stored text and language when the prerendered defaults differ', async () => {
    const { initI18n } = await import('./i18n/init');
    initI18n();
    const { App } = await import('./components/App/App');
    const root = document.getElementById('app')!;
    root.innerHTML = renderToString(h(App, { language: 'ru' }));

    vi.resetModules();
    window.localStorage.setItem('text', JSON.stringify('Сохранённый текст'));
    window.localStorage.setItem('settings.langUI', JSON.stringify('en-US'));
    await act(async () => { await import('./index'); });

    expect(root.querySelector<HTMLTextAreaElement>('.input__text')?.value).toBe('Сохранённый текст');
    expect(root.querySelector('.header__menu-item_tab_editor')?.textContent).toBe('Editor');
});
