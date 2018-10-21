import $ from 'jquery';

let browser = 'chrome';

if (navigator.userAgent.search('YaBrowser') > -1) {
    browser = 'yabro';
}

if (typeof InstallTrigger !== 'undefined') {
    browser = 'firefox';
}

if (navigator.userAgent.search(' OPR/') > -1) {
    browser = 'opera';
}

$('.extension_' + browser).show();
