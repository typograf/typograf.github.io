// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { Tooltip, TooltipMessage } from './Tooltip';

afterEach(() => vi.useRealTimers());

test('shows a status message and closes it after the timeout', () => {
    vi.useFakeTimers();
    const root = document.createElement('div');
    document.body.appendChild(root);

    function Example() {
        const [message, setMessage] = useState<TooltipMessage | null>({ text: 'Скопировано', type: 'ok' });
        return <Tooltip message={message} onClose={() => setMessage(null)} />;
    }

    act(() => render(<Example />, root));
    expect(root.querySelector('[role="status"]')?.textContent).toBe('Скопировано');
    act(() => { vi.advanceTimersByTime(3000); });
    expect(root.querySelector('[role="status"]')).toBeNull();
    act(() => render(null, root));
    root.remove();
});
