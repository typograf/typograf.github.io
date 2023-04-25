import { escapeHTML } from '../../helpers/string';
import { diffChars } from 'diff';

import './diff.css';

function getDiffTitle(sym: string) {
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

export function makeDiff(before: string, after: string): string {
    return diffChars(before, after).map(part => {
        const
            val = escapeHTML(part.value),
            title = getDiffTitle(part.value);

        let html: string;

        if (part.added) {
            html = `<ins class="diff" title="${title}">${val}</ins>`;
        } else if (part.removed) {
            html = `<del class="diff" title="${title}">${val}</del>`;
        } else {
            html = val;
        }

        return html;
    }).join('');
}
