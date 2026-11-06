import type { MouseEventHandler } from 'preact';

export interface IconButtonProps {
    buttonClass: string;
    iconClass: string;
    label: string;
    title?: string;
    disabled?: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>;
}
