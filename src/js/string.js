module.exports = {
    escapeHTML: function(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },
    truncate: function(text, len) {
        if(text) {
            return text.length > len ? text.substr(0, len) : text;
        }

        return '';
    }
};
