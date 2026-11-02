// @vitest-environment jsdom
import { beforeEach, expect, test, vi } from 'vitest';
import { act } from 'preact/test-utils';
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
    document.body.innerHTML = '<div id="app"></div><footer><span id="language-selector"></span></footer>';
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
});
