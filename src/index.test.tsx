// @vitest-environment jsdom
import { beforeEach, expect, test, vi } from 'vitest';
import { act } from 'preact/test-utils';
import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import Typograf from 'typograf';

vi.mock('./services/metrika', () => ({
    startMetrika: vi.fn(),
    trackMetrikaAction: vi.fn(),
}));

beforeEach(() => {
    vi.resetModules();
    window.Typograf = Typograf;
    window.localStorage.clear();
    window.location.hash = '';
    document.body.innerHTML = '<div id="app"></div><div id="footer"></div>';
});

test('mounts Preact roots and changes language without losing text', async () => {
    await act(async () => { await import('./index'); });
    const input = document.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    expect(input).toBeTruthy();
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
        document.querySelector<HTMLElement>('.interface-language-toggle')!.click();
    });

    expect(document.querySelector('.header__menu-item_tab_editor')?.textContent).toBe('Editor');
    expect(document.querySelector<HTMLTextAreaElement>('.source-text-input__text')?.value).toBe('Привет "мир"');
    expect(document.querySelector('#footer .browser-extension-link')?.textContent).toBe('Extension for');
});

test('selects the Firefox extension link in the browser', async () => {
    Object.defineProperty(window, 'InstallTrigger', { configurable: true, value: {} });
    try {
        await act(async () => { await import('./index'); });
        const link = document.querySelector<HTMLAnchorElement>('#footer .browser-extension-link__link');
        expect(link?.getAttribute('href')).toBe('https://addons.mozilla.org/ru/firefox/addon/typografy/');
        expect(link?.textContent).toBe('Mozilla Firefox');
    } finally {
        Reflect.deleteProperty(window, 'InstallTrigger');
    }
});

test('renders the footer links and version in the Preact root', async () => {
    await act(async () => { await import('./index'); });
    const footer = document.querySelector<HTMLElement>('#footer .footer');
    expect(footer?.querySelector('a[href="https://t.me/webtypograf"]')?.textContent).toBe('@webtypograf');
    expect(footer?.querySelector('a[href="https://checkdevice.online/?from=typograf.github.io"]')?.textContent)
        .toContain('Проверь');
    expect(footer?.querySelector('.footer__version')?.textContent).toBe(Typograf.version);
    expect(document.getElementById('extension')).toBeNull();
});

test('hydrates prerendered editor markup instead of replacing it', async () => {
    const { initI18n } = await import('./i18n/init');
    initI18n();
    const { App } = await import('./components/App');
    const { Footer } = await import('./components/Footer');
    const root = document.getElementById('app')!;
    root.innerHTML = renderToString(h(App, { language: 'ru' }));
    const footerRoot = document.getElementById('footer')!;
    footerRoot.innerHTML = renderToString(h(Footer, { language: 'ru', onLanguageChange: () => {} }));
    const footer = footerRoot.querySelector('.footer');
    const extensionLink = footerRoot.querySelector('.browser-extension-link__link');
    const header = root.querySelector('.header');

    await act(async () => { await import('./index'); });
    expect(root.querySelector('.header')).toBe(header);
    expect(root.querySelectorAll('.header').length).toBe(1);
    expect(footerRoot.querySelector('.footer')).toBe(footer);
    expect(footerRoot.querySelector('.browser-extension-link__link')).toBe(extensionLink);

    const input = root.querySelector<HTMLTextAreaElement>('.source-text-input__text')!;
    await act(async () => {
        input.value = 'Привет "мир"';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(root.querySelector<HTMLTextAreaElement>('.result-panel__text')?.value).toBe('Привет «мир»');
    await act(async () => footerRoot.querySelector<HTMLElement>('.interface-language-toggle')!.click());
    expect(root.querySelector('.header__menu-item_tab_editor')?.textContent).toBe('Editor');
    expect(root.querySelector<HTMLTextAreaElement>('.source-text-input__text')?.value).toBe('Привет "мир"');
});

test('uses stored text and language when the prerendered defaults differ', async () => {
    const { initI18n } = await import('./i18n/init');
    initI18n();
    const { App } = await import('./components/App');
    const root = document.getElementById('app')!;
    root.innerHTML = renderToString(h(App, { language: 'ru' }));

    vi.resetModules();
    window.localStorage.setItem('text', JSON.stringify('Сохранённый текст'));
    window.localStorage.setItem('settings.langUI', JSON.stringify('en-US'));
    await act(async () => { await import('./index'); });

    expect(root.querySelector<HTMLTextAreaElement>('.source-text-input__text')?.value).toBe('Сохранённый текст');
    expect(root.querySelector('.header__menu-item_tab_editor')?.textContent).toBe('Editor');
    expect(document.querySelector('#footer .interface-language-toggle')?.textContent).toBe('English');
    expect(document.querySelector('#footer .footer__right')?.textContent).toContain('Powered by');
});
