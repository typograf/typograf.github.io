// Yandex.Metrika
var str = require('./string'),
    prepareParam = function(value) {
        return window.encodeURIComponent(str.truncate(value || '', 512));
    };

var pageUrl = prepareParam(window.location.href),
    pageRef = prepareParam(document.referrer);

new Image().src = 'https://mc.yandex.ru/watch/28700106?page-url=' + pageUrl + '&page-ref=' + pageRef;
