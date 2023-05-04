import TypografBase from 'typograf';

declare global {
    interface Window {
        Typograf: typeof TypografBase;
    }
}

export const Typograf = window.Typograf;

interface GroupsByName {
    index: number;
    name: string;
    title: Record<string, string>;
}

const groupsByName: Record<string, GroupsByName> = {};

Typograf.groups.forEach((group, i) => {
    groupsByName[group.name] = {
        index: i,
        ...group,
    };
});

export function getTypografGroupTitle(name: string, lang: string) {
    const group = groupsByName[name];

    return group && group.title[lang];
}

export function getTypografGroupIndex(groupName: string) {
    const group = groupsByName[groupName];

    return group && group.index;
}
