export interface TooltipMessage {
    text: string;
    type: 'ok' | 'error';
    excerpt?: string;
}

export interface TooltipProps {
    message: TooltipMessage | null;
    onClose: () => void;
    timeout?: number;
    anchored?: boolean;
}
