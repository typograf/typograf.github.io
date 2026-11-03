import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import { Typograf } from '../../helpers/typograf';
import { BrowserExtensionLink } from '../BrowserExtensionLink';
import { InterfaceLanguageToggle } from '../InterfaceLanguageToggle';
import type { FooterProps } from './types';
import './index.css';

const b = block('footer');

export function Footer({ language, onLanguageChange }: FooterProps) {
    return <footer class={b()}>
        <div class={b('left')}>
            <div class={b('line')}>
                <div class={b('item')}>
                    <BrowserExtensionLink />
                </div>
                <div class={b('item', { icon: true })}>
                    <span class={b('tg-icon')} /><a rel="noopener" href="https://t.me/webtypograf">@webtypograf</a>
                </div>
            </div>
            <div class={b('line')}>
                <div class={b('item')}>
                    <a href="https://checkdevice.online/?from=typograf.github.io" target="_blank">{i18n('Check')}</a> <span>{i18n('device-online')}</span>
                </div>
            </div>
        </div>
        <div class={b('right')}>
            <div class={b('item')}>
                <span>{i18n('powered-by')}</span> <a rel="noopener" href="https://github.com/typograf/typograf/releases/" target="_blank">Typograf <span class={b('version')}>{Typograf.version}</span></a>
            </div>
            <div class={b('item')}>
                <InterfaceLanguageToggle language={language} onChange={onLanguageChange} />
            </div>
        </div>
    </footer>;
}
