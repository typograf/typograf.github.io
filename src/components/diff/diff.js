import { escapeHTML } from '../../helpers/string';
import { diffChars } from 'diff';

import './diff.less';

function getDiffTitle(sym) {
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

export function makeDiff(before, after) {
    return diffChars(before, after).map((part) => {
        const
            val = escapeHTML(part.value),
            title = getDiffTitle(part.value);

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
}
