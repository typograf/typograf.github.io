import type { Tab } from '../App/types';
import type { ThemePreference } from '../../lib/Config';

export interface HeaderProps {
    tab: Tab;
    onSelect: (tab: Tab) => void;
    theme: ThemePreference;
    onThemeChange: (theme: ThemePreference) => void;
}
