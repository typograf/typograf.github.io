import classNames from 'classnames';
import { block } from '../../../helpers/bem';
import type { TextareaProps } from './types';
import './index.css';

const b = block('textarea');

export function Textarea({ class: className, ...props }: TextareaProps) {
    return <textarea {...props} class={classNames(b(), className)} />;
}
