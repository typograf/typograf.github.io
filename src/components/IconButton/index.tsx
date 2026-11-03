import classNames from 'classnames';
import { block } from '../../helpers/bem';
import { Button } from '../ui/Button';
import type { IconButtonProps } from './types';
import './index.css';

const b = block('icon-button');

export function IconButton({ buttonClass, iconClass, label, onClick }: IconButtonProps) {
    return <Button type="button" class={classNames(b(), buttonClass)} onClick={onClick}>
        <span class={classNames(b('icon'), iconClass)} aria-hidden="true" />{label}
    </Button>;
}
