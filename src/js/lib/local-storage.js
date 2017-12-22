export default {
    getItem(key) {
        let result;

        if (window.localStorage) {
            try {
                result = localStorage.getItem(key);
            } catch (e) {
                console.log(e);
            }
        }

        return result;
    },
    setItem(key, value) {
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
