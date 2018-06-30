/** @jsx h */

import {h} from 'preact';
import i18n from '../i18n';
import BrowserExtension from '../browser-extension/browser-extension';
import LangUI from '../lang-ui/lang-ui';
import Typograf from '../typograf/typograf';

import './footer.less';

export default function Footer(props) {
    return <footer class="footer">
        <div class="footer__left">
            <div class="footer__item">
                <a href="./mobile.html">{i18n('mobile-version')}</a>
            </div>
            <div class="footer__item">
                <a href="https://github.com/typograf/typograf.github.io/issues/new" target="_blank" rel="noopener">{i18n('report-error')}</a>
            </div>

            <div class="footer__item"><BrowserExtension /></div>
        </div>
        <div class="footer__right">
            <div class="footer__item">
                <span>{i18n('powered-by')}</span> <a href="https://github.com/typograf/typograf/releases/" target="_blank" rel="noopener">Typograf <span class="footer__version">{Typograf.version}</span></a>
            </div>
            <div class="footer__item">
                <LangUI onChange={props.onLangUIChange} />
            </div>
        </div>
    </footer>;
}
