export interface CopyButtonProps {
    getText: () => string;
    onFeedback: (text: string, type: 'ok' | 'error') => void;
}
