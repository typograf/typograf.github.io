var $ = require('jquery');

$.fn.checked = function(checked) {
    if(typeof checked === 'undefined') {
        return this[0].checked;
    } else {
        this[0].checked = checked;
        return this;
    }
};
