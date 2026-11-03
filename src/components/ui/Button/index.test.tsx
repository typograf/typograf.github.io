// @vitest-environment jsdom
import { expect, test } from 'vitest';
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
