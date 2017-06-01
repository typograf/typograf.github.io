var $ = require('../../node_modules/jquery/dist/jquery');

$.fn.checked = function(checked) {
    var el = this[0];
    if(arguments.length) {
        if(typeof checked === 'undefined') {
            el.indeterminate = true;
        } else {
            el.indeterminate = false;
            el.checked = checked;
        }
        return this;
    } else {
        return el.checked;
    }
};
