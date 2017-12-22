export default {
    getHashParams() {
        const
            hash = window.location.hash.replace(/^#!/, ''),
            params = {};

        hash.split('&').forEach(function(item) {
            const el = item.split('=');
            if (el.length > 1 && el[1] !== undefined) {
                try {
                    params[el[0]] = window.decodeURIComponent(el[1]);
                } catch (e) {
                    params[el[0]] = el[1];
                }
            }

        });

        return params;
    },
    getHashParam(param) {
        return this.getHashParams()[param];
    }
};
