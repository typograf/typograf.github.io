/** @jsx h */

import i18n from '../i18n';
import {h} from 'preact';

import './browser-extension.less';

const ua = navigator.userAgent;
let browser = 'chrome';
if (ua.search('YaBrowser') > -1) {
    browser = 'yabro';
}

if (ua.search(' OPR/') > -1) {
    browser = 'opera';
}

if (typeof InstallTrigger !== 'undefined') {
    browser = 'firefox';
}

const data = {
    firefox: {
        href: 'https://addons.mozilla.org/ru/firefox/addon/typografy/',
        name: 'Mozilla Firefox'
    },
    chrome: {
        href: 'https://chrome.google.com/webstore/detail/red-typography/dgmmkhdeghobfcedlnmgbncknnfjhnmo',
        name: 'Google Chrome'
    },
    opera: {
        href: 'https://addons.opera.com/ru/extensions/details/red-typography/',
        name: 'Opera'
    },
    yabro: {
        href: 'https://addons.opera.com/ru/extensions/details/red-typography/',
        name: i18n('yabro'),
        id: 'yabro'
    }
}[browser];

export default function BrowserExtension() {
    return <div class="browser-extension">
        <span class="browser-extension__title" data-text-id="browser-extension">{i18n('browser-extension')}</span>&nbsp;
        <a target="_blank" href={data.href} data-text-id={data.id}>{data.name}</a>
    </div>;
};
