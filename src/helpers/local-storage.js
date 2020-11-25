const myLocalStorage = {
    getItem(key, defaultValue) {
        let result;

        if (window.localStorage) {
            try {
                result = JSON.parse(window.localStorage.getItem(key));
            } catch (e) {
                console.log(e);
            }
        } else {
            console.warn('LocalStorage is unsupported.');
        }

        return typeof result === 'undefined' ? defaultValue : result;
    },
    setItem(key, value) {
        if (window.localStorage) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.log(e);
            }
        } else {
            console.warn('LocalStorage is unsupported.');
        }

        return this;
    }
};


export default myLocalStorage;
