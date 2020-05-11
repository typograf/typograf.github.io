import $ from 'jquery';

import './extension.less';

let browser = 'chrome';
const ua = navigator.userAgent;

if (ua.search('YaBrowser') > -1) {
    browser = 'yabro';
}

if (typeof InstallTrigger !== 'undefined') {
    browser = 'firefox';
}

if (ua.search(' OPR/') > -1) {
    browser = 'opera';
}

$(`.extension_${browser}`).show();
