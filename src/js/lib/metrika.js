var str = require('./string');

function prepareParam(value) {
    return window.encodeURIComponent(str.truncate(value || '', 512));
}

module.exports = function(id) {
    var pageUrl = prepareParam(window.location.href);
    var pageRef = prepareParam(document.referrer);

    new Image().src = 'https://mc.yandex.ru/watch/' +
        id +
        '?page-url=' + pageUrl +
        '&page-ref=' + pageRef;
};
