import classNames from 'classnames';
import { block } from '../../../helpers/bem';
import type { CheckboxProps } from './types';
import '../choice-input.css';
import './index.css';

const b = block('checkbox');

export function Checkbox({ class: className, ...props }: CheckboxProps) {
    return <input {...props} type="checkbox" class={classNames(b(), className)} />;
}
