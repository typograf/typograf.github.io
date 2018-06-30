/** @jsx h */

import {h} from 'preact';
import i18n from '../i18n';
import cl from 'classnames';

import './header.less';

export default function Header(props) {
    return <header class={cl('header', {header_selected: props.selected})} onClick={props.onClick}>
        <h1 class="header__title">
            <span>{i18n('typograf')}</span><span class="header__icon"></span>
        </h1>
    </header>;
}
