var str = require('./lib/string');

module.exports = {
    getDiffTitle: function(sym) {
        var title = '';
        if (sym === '\u00A0') {
            title = 'NO-BREAK SPACE';
        } else if (sym === '\u202F') {
            title = 'NARROW NO-BREAK SPACE';
        } else if (sym === '\u2011') {
            title = 'NON-BREAKING HYPHEN';
        }

        return title;
    },
    make: function(before, after) {
        var diff = window.JsDiff.diffChars(before, after),
            html = '';

        diff.forEach(function(part){
            var val = str.escapeHTML(part.value),
                title = this.getDiffTitle(part.value);

            if (part.added) {
                html += '<ins class="diff" title="' + title + '">' + val + '</ins>';
            } else if (part.removed) {
                html += '<del class="diff" title="' + title + '">' + val + '</del>';
            } else {
                html += val;
            }
        }, this);

        return html;
    }
};
