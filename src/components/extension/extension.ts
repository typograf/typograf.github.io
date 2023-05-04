import { isFirefox, isOpera, isYaBrowser } from '../../helpers/browser';

function getExtensionBrowser() {
    if (isOpera()) {
        return 'opera';
    }

    if (isFirefox()) {
        return 'firefox';
    }

    if (isYaBrowser()) {
        return 'yabro';
    }

    return 'chrome';
}

const browser = getExtensionBrowser() || 'chrome';
const data = {
    'yabro': {
        url: 'https://addons.opera.com/ru/extensions/details/red-typography/',
        name: 'Яндекс.Браузера'
    },
    'firefox': {
        url: 'https://addons.mozilla.org/ru/firefox/addon/typografy/',
        name: 'Mozilla Firefox'
    },
    'opera': {
        url: 'https://addons.opera.com/ru/extensions/details/red-typography/',
        name: 'Opera'
    },
    'chrome': {
        url: 'https://chrome.google.com/webstore/detail/red-typography/dgmmkhdeghobfcedlnmgbncknnfjhnmo',
        name: 'Google Chrome'
    }
}[browser];

const extensionElement = document.querySelector<HTMLLinkElement>('.extension__link');
if (extensionElement) {
    extensionElement.href = data.url;
    extensionElement.innerText = data.name;
    extensionElement.dataset.textId = browser;
}
