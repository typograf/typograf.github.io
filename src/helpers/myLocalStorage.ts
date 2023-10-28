export const myLocalStorage = {
    getItem<T = unknown>(key: string, defaultValue: T) {
        let result: T | null = null;

        if (window.localStorage) {
            try {
                const item = window.localStorage.getItem(key);
                if (typeof item === 'string') {
                    result = JSON.parse(item);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            console.warn('LocalStorage is unsupported.');
        }

        return result === null ? defaultValue : result;
    },
    setItem<T = unknown>(key: string, value: T) {
        if (window.localStorage) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.log(e);
            }
        } else {
            console.warn('LocalStorage is unsupported.');
        }
    }
};
