// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { createRef, render } from 'preact';
import { act } from 'preact/test-utils';
import { Textarea } from './index';

test('forwards textarea attributes, input events, and ref', () => {
    const root = document.createElement('div');
    const ref = createRef<HTMLTextAreaElement>();
    let value = '';

    act(() => render(<Textarea ref={ref} class="source-text-input__text" value="Исходный текст" onInput={event => { value = event.currentTarget.value; }} />, root));
    const textarea = root.querySelector('textarea');
    expect(textarea?.className).toBe('textarea source-text-input__text');
    expect(textarea?.value).toBe('Исходный текст');
    expect(ref.current).toBe(textarea);
    if (textarea) {
        textarea.value = 'Новый текст';
        act(() => { textarea.dispatchEvent(new Event('input', { bubbles: true })); });
    }
    expect(value).toBe('Новый текст');
    act(() => render(null, root));
});
