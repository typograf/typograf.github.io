const state = {};

const defaultState = {};

export default {
    setDefault(key, value) {
        defaultState[key] = value;
    },

    getDefault(key) {
        return defaultState[key];
    },

    hasDefault(key) {
        return defaultState[key] !== null && defaultState[type] !== undefined;
    },

    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    get(key) {
        let result;

        if (window.localStorage) {
            try {
                result = localStorage.getItem('settings.' + key);

                if (result) {
                    result = JSON.parse(result);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            result = state[key];
        }

        if (result === null || result === undefined) {
            if (this.hasDefault(key)) {
                result = this.getDefault(key);
                this.set(key, result);
            }
        }

        return result === undefined ? null : result;
    },

    set(key, value) {
        const strValue = JSON.stringify(value);
        state[key] = strValue;
        
        if (window.localStorage) {
            try {
                localStorage.setItem('settings.' + key, strValue);
            } catch (e) {
                console.log(e);
            }
        }

        return this;
    }
};
