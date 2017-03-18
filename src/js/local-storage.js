module.exports = {
    getItem: function(key) {
        var result;

        if(window.localStorage) {
            try {
                result = localStorage.getItem(key);
            } catch(e) {}
        }

        return result;
    },
    setItem: function(key, value) {
        if(window.localStorage) {
            try {
                localStorage.setItem(key, value);
            } catch(e) {}
        }

        return this;
    }
};
