export interface TooltipMessage {
    text: string;
    type: 'ok' | 'error';
}

export interface TooltipProps {
    message: TooltipMessage | null;
    onClose: () => void;
    timeout?: number;
}
