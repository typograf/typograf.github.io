import classNames from 'classnames';
import { block } from '../../../helpers/bem';
import type { SelectProps } from './types';
import './index.css';

const b = block('select');

export function Select({ class: className, ...props }: SelectProps) {
    return <select {...props} class={classNames(b(), className)} />;
}
