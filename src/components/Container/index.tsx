import { block } from '../../helpers/bem';
import type { ContainerProps } from './types';
import './index.css';

const b = block('container');

export function Container({ children }: ContainerProps) {
    return <div class={b()}>{children}</div>;
}
