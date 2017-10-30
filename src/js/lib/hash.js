module.exports = {
    getHashParams: function() {
        var hash = window.location.hash.replace(/^#!/, ''),
            buf = hash.split('&'),
            params = {};

        for (var i = 0; i < buf.length; i++) {
            var el = buf[i].split('=');
            if (el.length > 1 && el[1] !== undefined) {
                try {
                    params[el[0]] = window.decodeURIComponent(el[1]);
                } catch (e) {
                    params[el[0]] = el[1];
                }
            }
        }

        return params;
    },
    getHashParam: function(param) {
        return this.getHashParams()[param];
    }
};
