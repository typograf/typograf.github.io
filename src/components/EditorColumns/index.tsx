import { block } from '../../helpers/bem';
import type { EditorColumnsProps } from './types';
import './index.css';

const b = block('editor-columns');

export function EditorColumns({ left, right }: EditorColumnsProps) {
    return <div class={b()}>
        <div class={b('left')}>{left}</div>
        <div class={b('right')}>{right}</div>
    </div>;
}
