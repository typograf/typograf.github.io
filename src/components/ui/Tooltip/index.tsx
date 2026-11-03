import { useEffect } from 'preact/hooks';
import { block } from '../../../helpers/bem';
import type { TooltipProps } from './types';
import './index.css';

const b = block('tooltip');

export function Tooltip({ message, onClose, timeout = 3000 }: TooltipProps) {
    useEffect(() => {
        if (!message) return;
        const timer = window.setTimeout(onClose, timeout);
        return () => window.clearTimeout(timer);
    }, [message, onClose, timeout]);

    return message ? <div class={b({ visible: true, type: message.type })} role="status">{message.text}</div> : null;
}
