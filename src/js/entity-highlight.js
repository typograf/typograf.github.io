module.exports = function(text) {
    [
        [/(\u00A0|&nbsp;|&#160;)/g, '\u00A0', 'NO-BREAK SPACE'],
        [/(\u202F|&#8239;)/g, '\u202F', 'NARROW NO-BREAK SPACE'],
        [/(\u2011|&#8209;)/g, '\u2011', 'NON-BREAKING HYPHEN']
    ].forEach(function(el) {
        text = text.replace(el[0], '<span class="entity-nb" title="' + el[2] + '">' + el[1] + '</span>');
    });

    return text;
};
