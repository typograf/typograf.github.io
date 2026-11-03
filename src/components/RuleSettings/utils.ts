import TypografBase, { TypografRuleInternal } from 'typograf';
import { Typograf, getTypografGroupIndex } from '../../helpers/typograf';
import { I18NLanguage } from '../../i18n/i18n';

export function getRuleGroups(language: I18NLanguage) {
    const rules = Typograf.getRules().filter(rule => !rule.live);
    rules.sort((a, b) => (getTypografGroupIndex(a.group) || 0) - (getTypografGroupIndex(b.group) || 0));
    const groups: TypografRuleInternal[][] = [];
    for (const rule of rules) {
        const last = groups[groups.length - 1];
        if (!last || last[0].group !== rule.group) groups.push([rule]);
        else last.push(rule);
    }
    for (const group of groups) {
        group.sort((a, b) => {
            const aTitle = Typograf.titles[a.name];
            const bTitle = Typograf.titles[b.name];
            return (aTitle?.[language] || aTitle?.common || '').localeCompare(bTitle?.[language] || bTitle?.common || '');
        });
    }
    return groups;
}

export function getVisibleRules(groups: TypografRuleInternal[][]) {
    return ([] as TypografRuleInternal[]).concat(...groups);
}

export function getRuleOverrides(typograf: TypografBase) {
    const enabled: string[] = [];
    const disabled: string[] = [];
    for (const rule of Typograf.getRules()) {
        (typograf.isEnabledRule(rule.name) ? enabled : disabled).push(rule.name);
    }
    return { enabled, disabled };
}
