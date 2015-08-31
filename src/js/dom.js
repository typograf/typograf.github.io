function $(cls) {
    return document.querySelector(cls);
}

var div = document.createElement('div'),
    hasClassList = !!div.classList;
    
$.addClass = hasClassList ? function(el, name) {
    el.classList.add(name);
} : function(el, name) { // support IE9
    var re = new RegExp('(^|\\s)' + name + '(\\s|$)', 'g');
    if(!re.test(name.className)) {
        el.className = (el.className + ' ' + name)
            .replace(/\s+/g, ' ')
            .replace(/(^ | $)/g, '');
    }
};

$.removeClass = hasClassList ? function(el, name) {
    el.classList.remove(name);
} : function(el, name) { // support IE9
    var re = new RegExp('(^|\\s)' + name + '(\\s|$)', 'g');
    el.className = el.className
        .replace(re, '$1')
        .replace(/\s+/g, ' ')
        .replace(/(^ | $)/g, '');
};

$.toggleClass = function(el, name) {
    if($.hasClass(el, name)) {
        $.removeClass(el, name);
    } else {
        $.addClass(el, name);
    }
};

$.hasClass = hasClassList ? function(el, name) {
    return el.classList.contains(name);
} : function(el, name) { // support IE9
    var re = new RegExp('(^|\\s)' + name + '(\\s|$)', 'g');
    return el.className.search(re) > -1;
};

$.on = function(elem, type, callback) {
    elem = typeof elem === 'string' ? $(elem) : elem;
    if(Array.isArray(type)) {
        type.forEach(function(el) {
            elem && elem.addEventListener(el, callback, false);
        });
    } else {
        elem && elem.addEventListener(type, callback, false);
    }
};

$.hide = function(el) {
    $(el).style.display = 'none';
};

$.show = function(el) {
    $(el).style.display = 'block';
};

$.isVisible = function(el) {
    return !!$(el).offsetHeight;
};

module.exports = $;
