export default {
    escapeHTML(text) {
        return (text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },
    isHTML(text) {
        return (text || '').search(/(<\/?[a-z]|<!|&[lg]t;)/i) !== -1;
    },
    stripTags(text) {
        return (text || '').replace(/<\/?[^>]+(>|$)/g, '');
    },
    truncate(text, len) {
        if (text) {
            return text.length > len ? text.substr(0, len) : text;
        }

        return '';
    }
};
