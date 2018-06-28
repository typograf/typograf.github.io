import './entity-highlight.less';

export default function entityHighlight(text) {
    [
        [/(\u00A0|&nbsp;|&#160;)/g, '\u00A0', 'NO-BREAK SPACE'],
        [/(\u202F|&#8239;)/g, '\u202F', 'NARROW NO-BREAK SPACE'],
        [/(\u2011|&#8209;)/g, '\u2011', 'NON-BREAKING HYPHEN']
    ].forEach(function(item) {
        const {re, sym, title} = item;
        text = text.replace(re, `<span class="entity-highlight" title="${title}">${sym}</span>`);
    });

    return text;
}
