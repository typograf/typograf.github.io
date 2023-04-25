import './highlightEntity.css';

export function highlightEntity(text: string) {
    [
        [/(\u00A0|&nbsp;|&#160;)/g, '\u00A0', 'NO-BREAK SPACE'],
        [/(\u202F|&#8239;)/g, '\u202F', 'NARROW NO-BREAK SPACE'],
        [/(\u2011|&#8209;)/g, '\u2011', 'NON-BREAKING HYPHEN']
    ].forEach(item => {
        const [regExp, char, title] = item;
        text = text.replace(regExp, `<span class="entity-highlight" title="${title}">${char}</span>`);
    });

    return text;
}
