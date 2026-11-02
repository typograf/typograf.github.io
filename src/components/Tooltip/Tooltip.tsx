import { useEffect } from 'preact/hooks';
import './Tooltip.css';

export interface TooltipMessage {
    text: string;
    type: 'ok' | 'error';
}

interface TooltipProps {
    message: TooltipMessage | null;
    onClose: () => void;
    timeout?: number;
}

export function Tooltip({ message, onClose, timeout = 3000 }: TooltipProps) {
    useEffect(() => {
        if (!message) return;
        const timer = window.setTimeout(onClose, timeout);
        return () => window.clearTimeout(timer);
    }, [message, onClose, timeout]);

    return message ? <div class={`tooltip tooltip_visible tooltip_type_${message.type}`} role="status">{message.text}</div> : null;
}
