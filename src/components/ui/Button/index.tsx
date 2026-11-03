import type { TargetedMouseEvent } from 'preact';
import { useCallback } from 'preact/hooks';
import classNames from 'classnames';
import { block } from '../../../helpers/bem';
import { Ripple } from '../../Ripple';
import { useRipple } from '../../Ripple/hooks/useRipple';
import type { ButtonProps } from './types';
import './index.css';

const b = block('button');

export function Button({ class: className, children, onClick, ...props }: ButtonProps) {
    const { waves, startRipple } = useRipple();
    const handleClick = useCallback((event: TargetedMouseEvent<HTMLButtonElement>) => {
        startRipple(event);
        onClick?.(event);
    }, [onClick, startRipple]);

    return <button {...props} class={classNames(className, b())} onClick={handleClick}>
        {children}<Ripple waves={waves} />
    </button>;
}
