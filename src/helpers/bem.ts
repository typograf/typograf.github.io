export type BemMods = Record<string, string | number | boolean | null | undefined>;

export function block(name: string) {
    return function(elem?: string | BemMods, mods?: BemMods) {
        if (!elem) {
            return name;
        }

        let className = name;

        if (typeof elem === 'string') {
            className = name + '__' + elem;

            if (mods) {
                className = buildMods(className, mods);
            }

            return className;
        }

        if (elem) {
            className = buildMods(className, elem);
        }

        return className;
    }
}

function buildMods(className: string, mods: BemMods) {
    let result = className;

    Object.keys(mods).forEach((modName) => {
        const modValue = mods[modName];
        if (modValue === false || modValue === null || modValue === undefined || modValue === '') {
            return;
        }

        result += ' ' + className + '_';

        if (mods[modName] === true) {
            result += modName;
        } else {
            result += modName + '_' + modValue;
        }
    });

    return result;
}