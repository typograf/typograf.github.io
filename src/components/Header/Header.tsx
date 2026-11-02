import { i18n } from '../../i18n/i18n';
import './Header.css';

interface HeaderProps {
    tab: 'editor' | 'prefs';
    onSelect: (tab: 'editor' | 'prefs') => void;
}

export function Header({ tab, onSelect }: HeaderProps) {
    return <header class="header">
        <div class="header__title">{i18n('typograf')}</div>
        <ul class="header__menu">
            <li class={`header__menu-item header__menu-item_tab_editor ${tab === 'editor' ? 'header__menu-item_selected' : ''}`} onClick={() => onSelect('editor')}>{i18n('editor')}</li>
            <li class={`header__menu-item header__menu-item_tab_prefs ${tab === 'prefs' ? 'header__menu-item_selected' : ''}`} onClick={() => onSelect('prefs')}>{i18n('prefs')}</li>
        </ul>
        <div class="header__snow" />
    </header>;
}
