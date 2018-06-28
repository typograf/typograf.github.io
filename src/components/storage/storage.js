const state = {};

export default {
    get(key) {
        let result;

        if (window.localStorage) {
            try {
                result = localStorage.getItem('settings.' + key);
            } catch (e) {
                console.log(e);
            }
        } else {
            result = state[key];
        }

        return result;
    },
    set(key, value) {
        state[key] = value;
        
        if (window.localStorage) {
            try {
                localStorage.setItem('settings.' + key, value);
            } catch (e) {
                console.log(e);
            }
        }

        return this;
    }
};
