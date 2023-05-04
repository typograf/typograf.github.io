export function escapeHTML(text: string) {
    return (text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function isHTML(text: string) {
    return (text || '').search(/(<\/?[a-z]|<!|&[lg]t;)/i) !== -1;
}

export function stripTags(text: string) {
    return (text || '').replace(/<\/?[^>]+(>|$)/g, '');
}

export function truncate(text: string, len: number) {
    if (!text) {
        return '';
    }

    return text.length > len ? text.substr(0, len) : text;
}
