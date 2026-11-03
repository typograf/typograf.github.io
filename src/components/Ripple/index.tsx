import { block } from '../../helpers/bem';
import type { RippleProps } from './types';
import './index.css';

const b = block('ripple');

export function Ripple({ waves }: RippleProps) {
    return <>{waves.map(wave => <span
        key={wave.id}
        class={b()}
        aria-hidden="true"
        style={{ left: `${wave.x}px`, top: `${wave.y}px`, width: `${wave.size}px`, height: `${wave.size}px`, animationDuration: `${wave.durationMs}ms` }}
    />)}</>;
}
