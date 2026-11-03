// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { Button } from './index';

test('keeps button attributes and click behavior with the base class', () => {
    const root = document.createElement('div');
    let clicks = 0;

    act(() => render(<Button type="button" class="settings-panel__default" onClick={() => { clicks++; }}>Сбросить</Button>, root));
    const button = root.querySelector('button');
    expect(button?.className).toBe('settings-panel__default button');
    expect(button?.type).toBe('button');
    expect(button?.textContent).toBe('Сбросить');
    act(() => button?.click());
    expect(clicks).toBe(1);
    act(() => render(null, root));
});

test('starts a ripple at the click position and clears it after the animation', () => {
    vi.useFakeTimers();
    const root = document.createElement('div');
    try {
        act(() => render(<Button type="button">Нажать</Button>, root));
        const button = root.querySelector('button')!;
        button.getBoundingClientRect = () => ({ left: 10, top: 20, width: 100, height: 40, right: 110, bottom: 60, x: 10, y: 20, toJSON: () => {} });

        act(() => { button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1, clientX: 35, clientY: 30 })); });
        const wave = button.querySelector<HTMLElement>('.ripple');
        expect(wave?.style.left).toBe('25px');
        expect(wave?.style.top).toBe('10px');
        expect(wave?.style.animationDuration).toBe('550ms');

        act(() => { vi.advanceTimersByTime(600); });
        expect(button.querySelector('.ripple')).toBeNull();
    } finally {
        act(() => render(null, root));
        vi.useRealTimers();
    }
});
