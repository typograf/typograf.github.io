// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { Tooltip } from './index';
import type { TooltipMessage } from './types';

afterEach(() => vi.useRealTimers());

test('keeps the status mounted for a 200 ms fade after the timeout', () => {
    vi.useFakeTimers();
    const root = document.createElement('div');
    document.body.appendChild(root);

    function Example() {
        const [message, setMessage] = useState<TooltipMessage | null>({ text: 'Скопировано', type: 'ok' });
        return <Tooltip message={message} onClose={() => setMessage(null)} />;
    }

    act(() => render(<Example />, root));
    expect(root.querySelector('[role="status"]')?.textContent).toBe('Скопировано');
    expect(root.querySelector('.tooltip_visible')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(3000); });
    expect(root.querySelector('[role="status"]')?.textContent).toBe('Скопировано');
    expect(root.querySelector('.tooltip_visible')).toBeNull();
    act(() => { vi.advanceTimersByTime(199); });
    expect(root.querySelector('[role="status"]')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1); });
    expect(root.querySelector('[role="status"]')).toBeNull();
    act(() => render(null, root));
    root.remove();
});

test('cancels the previous fade when a new status message arrives', () => {
    vi.useFakeTimers();
    const root = document.createElement('div');
    const onClose = vi.fn();
    act(() => render(<Tooltip message={{ text: 'Первое', type: 'ok' }} onClose={onClose} />, root));
    act(() => { vi.advanceTimersByTime(3100); });
    act(() => render(<Tooltip message={{ text: 'Второе', type: 'ok' }} onClose={onClose} />, root));
    act(() => { vi.advanceTimersByTime(200); });

    expect(onClose).not.toHaveBeenCalled();
    expect(root.querySelector('.tooltip_visible')?.textContent).toBe('Второе');
    act(() => render(null, root));
});
