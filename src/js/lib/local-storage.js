module.exports = {
    getItem: function(key) {
        var result;

        if (window.localStorage) {
            try {
                result = localStorage.getItem(key);
            } catch (e) {
                console.log(e);
            }
        }

        return result;
    },
    setItem: function(key, value) {
        if (window.localStorage) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.log(e);
            }
        }

        return this;
    }
};
