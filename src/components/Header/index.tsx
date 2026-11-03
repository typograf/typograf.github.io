import type { TargetedEvent, TargetedMouseEvent } from 'preact';
import { useCallback } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import type { HeaderProps } from './types';
import type { ThemePreference } from '../../lib/Config';
import { Ripple } from '../Ripple';
import { useRipple } from '../Ripple/hooks/useRipple';
import './index.css';

const b = block('header');
const TAB_RIPPLE_DURATION_MS = 700;

export function Header({ tab, onSelect, theme, onThemeChange }: HeaderProps) {
    const { waves: editorWaves, startRipple: rippleEditor } = useRipple(TAB_RIPPLE_DURATION_MS);
    const { waves: prefsWaves, startRipple: ripplePrefs } = useRipple(TAB_RIPPLE_DURATION_MS);
    const { waves: aboutWaves, startRipple: rippleAbout } = useRipple(TAB_RIPPLE_DURATION_MS);
    const selectEditor = useCallback((event: TargetedMouseEvent<HTMLLIElement>) => {
        rippleEditor(event);
        onSelect('editor');
    }, [onSelect, rippleEditor]);
    const selectPrefs = useCallback((event: TargetedMouseEvent<HTMLLIElement>) => {
        ripplePrefs(event);
        onSelect('prefs');
    }, [onSelect, ripplePrefs]);
    const selectAbout = useCallback((event: TargetedMouseEvent<HTMLLIElement>) => {
        rippleAbout(event);
        onSelect('about');
    }, [onSelect, rippleAbout]);
    const selectTheme = useCallback((event: TargetedEvent<HTMLSelectElement>) => {
        onThemeChange(event.currentTarget.value as ThemePreference);
    }, [onThemeChange]);

    return <header class={b()}>
        <div class={b('title')}><span class={b('title-text')}>{i18n('typograf')}</span></div>
        <select class={b('theme-select')} aria-label={i18n('theme')} title={i18n('theme')} value={theme} onChange={selectTheme}>
            <option value="system">{i18n('theme-system')}</option>
            <option value="light">{i18n('theme-light')}</option>
            <option value="dark">{i18n('theme-dark')}</option>
        </select>
        <ul class={b('menu')}>
            <li class={b('menu-item', { tab: 'editor', selected: tab === 'editor' })} onClick={selectEditor}>{i18n('editor')}<Ripple waves={editorWaves} /></li>
            <li class={b('menu-item', { tab: 'prefs', selected: tab === 'prefs' })} onClick={selectPrefs}>{i18n('prefs')}<Ripple waves={prefsWaves} /></li>
            <li class={b('menu-item', { tab: 'about', selected: tab === 'about' })} onClick={selectAbout}>{i18n('about')}<Ripple waves={aboutWaves} /></li>
        </ul>
        <div class={b('snow')} />
    </header>;
}
