import { useEffect, useState } from 'preact/hooks';
import { isFirefox, isOpera, isYaBrowser } from '../../helpers/browser';
import { i18n } from '../../i18n/i18n';

type ExtensionBrowser = 'chrome' | 'firefox' | 'opera' | 'yabro';

const extensionUrls: Record<ExtensionBrowser, string> = {
    chrome: 'https://chrome.google.com/webstore/detail/red-typography/dgmmkhdeghobfcedlnmgbncknnfjhnmo',
    firefox: 'https://addons.mozilla.org/ru/firefox/addon/typografy/',
    opera: 'https://addons.opera.com/ru/extensions/details/red-typography/',
    yabro: 'https://addons.opera.com/ru/extensions/details/red-typography/',
};

function getExtensionBrowser(): ExtensionBrowser {
    if (isOpera()) return 'opera';
    if (isFirefox()) return 'firefox';
    if (isYaBrowser()) return 'yabro';
    return 'chrome';
}

export function Extension() {
    const [browser, setBrowser] = useState<ExtensionBrowser>('chrome');

    useEffect(() => setBrowser(getExtensionBrowser()), []);

    return <>
        <span class="extension">{i18n('extension')}</span>{' '}
        <a rel="noopener" class="extension__link" href={extensionUrls[browser]} target="_blank">{i18n(browser)}</a>
    </>;
}
