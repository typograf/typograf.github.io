import classNames from 'classnames';
import { block } from '../../../helpers/bem';
import type { ButtonProps } from './types';
import './index.css';

const b = block('button');

export function Button({ class: className, ...props }: ButtonProps) {
    return <button {...props} class={classNames(className, b())} />;
}
