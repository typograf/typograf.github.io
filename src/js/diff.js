import str from './lib/string';
import { diffChars } from 'diff';

export default {
    getDiffTitle(sym) {
        let title = '';
        if (sym === '\u00A0') {
            title = 'NO-BREAK SPACE';
        } else if (sym === '\u202F') {
            title = 'NARROW NO-BREAK SPACE';
        } else if (sym === '\u2011') {
            title = 'NON-BREAKING HYPHEN';
        }

        return title;
    },
    make(before, after) {
        return diffChars(before, after).map((part) => {
            const
                val = str.escapeHTML(part.value),
                title = this.getDiffTitle(part.value);

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
};
