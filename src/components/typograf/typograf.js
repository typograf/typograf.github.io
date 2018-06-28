import Typograf from 'typograf/dist/typograf.all';

export function prepareLocale(locale) {
    return locale === 'en' || locale === 'en-US' ? [ 'en-US' ] : [locale, 'en-US'];
}

export default Typograf;

Typograf.groupsByName = {};

Typograf.groups.forEach(function(group, i) {
    group.index = i;
    Typograf.groupsByName[group.name] = group;
});

Typograf.getGroupIndex = function(groupName) {
    return Typograf.groupsByName[groupName].index;
};

Typograf.getGroupTitle = function(name, lang) {
    return Typograf.groupsByName[name].title[lang];
};
