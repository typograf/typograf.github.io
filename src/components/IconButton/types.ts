import type { MouseEventHandler } from 'preact';

export interface IconButtonProps {
    buttonClass: string;
    iconClass: string;
    label: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
}
