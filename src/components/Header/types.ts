import type { Tab } from '../App/types';

export interface HeaderProps {
    tab: Tab;
    onSelect: (tab: Tab) => void;
}
