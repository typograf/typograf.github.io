export function escapeHTML(text) {
    return (text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function isHTML(text) {
    return (text || '').search(/(<\/?[a-z]|<!|&[lg]t;)/i) !== -1;
}

export function stripTags(text) {
    return (text || '').replace(/<\/?[^>]+(>|$)/g, '');
}

export function truncate(text, len) {
    if (text) {
        return text.length > len ? text.substr(0, len) : text;
    }

    return '';
}
