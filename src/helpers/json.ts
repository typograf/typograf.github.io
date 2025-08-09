export function isJSON(value: string) {
    if (value.search(/[{}[\]]/) === -1) {
        return false;
    }

    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }    
}

export function typografyJSON(value: string, callback: (value: string) => string): string {
    try {
        const parsedJSON = JSON.parse(value);
        return JSON.stringify(parsedJSON, (_: string, value: unknown) => {
            return typeof value === 'string' ? callback(value) : value;
        }, 2);
    } catch {
        return value;
    }
}