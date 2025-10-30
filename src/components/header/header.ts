import { disablePageScroll, enablePageScroll } from '../../helpers/dom';
import { isPrefsHash } from '../../helpers/hash';

import './header.css';

interface HeaderParams {
    onClick: (tab: 'editor' | 'prefs') => void;
}

export class Header {
    private dom = document.querySelector('.header') as HTMLDivElement;
    private editor = document.querySelector('.header__menu-item_tab_editor') as HTMLDivElement;
    private prefs = document.querySelector('.header__menu-item_tab_prefs') as HTMLDivElement;
    private snow: HTMLDivElement;

    constructor(private params: HeaderParams) {
        this.editor.addEventListener('click', this.handleTabEditor);
        this.prefs.addEventListener('click', this.handleTabPrefs);

        if (isPrefsHash()) {
            setTimeout(() => {
                this.handleTabPrefs();
            }, 0);
        }

        this.snow = document.createElement('div');
        this.snow.className = 'header__snow';

        this.dom.appendChild(this.snow);
    }

    private handleTabEditor = () => {
        this.params.onClick('editor');

        this.editor.classList.add('header__menu-item_selected');
        this.prefs.classList.remove('header__menu-item_selected');

        enablePageScroll();
    }

    private handleTabPrefs = () => {
        this.params.onClick('prefs');

        this.prefs.classList.add('header__menu-item_selected');
        this.editor.classList.remove('header__menu-item_selected');

        disablePageScroll();
    }
}