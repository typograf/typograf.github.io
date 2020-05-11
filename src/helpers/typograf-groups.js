import Typograf from 'typograf/dist/typograf.all';

Typograf.groupsByName = {};

Typograf.groups.forEach(function(group, i) {
    group.index = i;
    Typograf.groupsByName[group.name] = group;
});

Typograf.getGroupTitle = function(name, lang) {
    return Typograf.groupsByName[name].title[lang];
};

Typograf.getGroupIndex = function(groupName) {
    return Typograf.groupsByName[groupName].index;
};
