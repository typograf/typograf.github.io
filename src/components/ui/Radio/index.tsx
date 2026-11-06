import classNames from 'classnames';
import { block } from '../../../helpers/bem';
import type { RadioProps } from './types';
import '../choice-input.css';
import './index.css';

const b = block('radio');

export function Radio({ class: className, ...props }: RadioProps) {
    return <input {...props} type="radio" class={classNames(b(), className)} />;
}
