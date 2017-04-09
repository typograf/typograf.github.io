module.exports = {
    escapeHTML: function(text) {
        return (text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },
    isHTML: function(text) {
        return (text || '').search(/(<\/?[a-z]|<!|&[lg]t;)/i) !== -1;
    },
    stripTags: function(text) {
        return (text || '').replace(/<\/?[^>]+(>|$)/g, '');
    },
    truncate: function(text, len) {
        if(text) {
            return text.length > len ? text.substr(0, len) : text;
        }

        return '';
    }
};
