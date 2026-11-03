import { useCallback } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import type { HeaderProps } from './types';
import './index.css';

const b = block('header');

export function Header({ tab, onSelect }: HeaderProps) {
    const selectEditor = useCallback(() => onSelect('editor'), [onSelect]);
    const selectPrefs = useCallback(() => onSelect('prefs'), [onSelect]);

    return <header class={b()}>
        <div class={b('title')}>{i18n('typograf')}</div>
        <ul class={b('menu')}>
            <li class={b('menu-item', { tab: 'editor', selected: tab === 'editor' })} onClick={selectEditor}>{i18n('editor')}</li>
            <li class={b('menu-item', { tab: 'prefs', selected: tab === 'prefs' })} onClick={selectPrefs}>{i18n('prefs')}</li>
        </ul>
        <div class={b('snow')} />
    </header>;
}
