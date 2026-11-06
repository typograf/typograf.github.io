import { useLayoutEffect, useState } from 'preact/hooks';
import { block } from '../../../helpers/bem';
import type { TooltipMessage, TooltipProps } from './types';
import './index.css';

const b = block('tooltip');
const fadeDuration = 200;

export function Tooltip({ message, onClose, timeout = 3000, anchored }: TooltipProps) {
    const [fadingMessage, setFadingMessage] = useState<TooltipMessage | null>(null);
    const visible = message !== fadingMessage;

    useLayoutEffect(() => {
        if (!message) {
            setFadingMessage(null);
            return;
        }
        const timer = visible
            ? window.setTimeout(() => setFadingMessage(message), timeout)
            : window.setTimeout(onClose, fadeDuration);
        return () => window.clearTimeout(timer);
    }, [message, onClose, timeout, visible]);

    return message ? <div class={b({ visible, type: message.type, anchored })} role="status">
        {message.text}
        {message.excerpt && <span class={b('excerpt')}>{message.excerpt}</span>}
    </div> : null;
}
