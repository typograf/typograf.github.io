import str from './string';

export default function(id) {
    function prepareParam(value) {
        return window.encodeURIComponent(str.truncate(value || '', 512));
    }

    const
        pageUrl = prepareParam(window.location.href),
        pageRef = prepareParam(document.referrer);

    new Image().src = 'https://mc.yandex.ru/watch/' +
        id +
        '?page-url=' + pageUrl +
        '&page-ref=' + pageRef;
}
