import type { JSX } from 'preact';
import './ActionIcon.css';

interface ActionIconProps {
    buttonClass: string;
    iconClass: string;
    label: string;
    onClick: JSX.MouseEventHandler<HTMLButtonElement>;
}

export function ActionIcon({ buttonClass, iconClass, label, onClick }: ActionIconProps) {
    return <button type="button" class={`${buttonClass} button`} onClick={onClick}>
        <span class={iconClass} aria-hidden="true" />{label}
    </button>;
}
