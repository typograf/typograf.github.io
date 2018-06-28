import str from '../lib/string';

import './diff.less';
    
function getTitle(sym) {
    let title = '';
    if (sym === '\u00A0') {
        title = 'NO-BREAK SPACE';
    } else if (sym === '\u202F') {
        title = 'NARROW NO-BREAK SPACE';
    } else if (sym === '\u2011') {
        title = 'NON-BREAKING HYPHEN';
    }

    return title;
}

export default function diffChars(before, after) {
    return window.JsDiff.diffChars(before, after).map(function(part){
        const
            val = str.escapeHTML(part.value),
            title = getTitle(part.value);

        let html;

        if (part.added) {
            html = `<ins class="diff" title="${title}">${val}</ins>`;
        } else if (part.removed) {
            html = `<del class="diff" title="${title}">${val}</del>`;
        } else {
            html = val;
        }

        return html;
    }, this).join('');
};
