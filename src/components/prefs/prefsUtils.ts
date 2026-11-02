import TypografBase, { TypografRuleInternal } from 'typograf';
import { escapeHTML } from '../../helpers/string';
import { prepareLocale } from '../../helpers/prepareLocale';
import { Typograf, getTypografGroupIndex, getTypografGroupTitle } from '../../helpers/typograf';
import { i18n, I18NLanguage } from '../../i18n/i18n';
import type { PrefsData } from './prefsTypes';

const previewTypograf = new Typograf({ locale: ['ru', 'en-US'], disableRule: '*', enableRule: ['common/nbsp/*', 'ru/nbsp/*'] });
const entitiesTypograf = new Typograf({ locale: ['ru', 'en-US'], disableRule: '*', enableRule: ['common/nbsp/*', 'common/punctuation/quote'] });

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

export function getRuleTitle(rule: TypografRuleInternal, language: I18NLanguage) {
    const title = Typograf.titles[rule.name];
    return previewTypograf.execute(escapeHTML(title?.[language] || title?.common || ''), { locale: prepareLocale(language) });
}

export function getRuleGroupTitle(groupName: string, language: I18NLanguage) {
    return previewTypograf.execute(getTypografGroupTitle(groupName, language) || '', { locale: prepareLocale(language) });
}

export function getEntityExample(mode: PrefsData['mode'], onlyInvisible: boolean) {
    const raw = entitiesTypograf.execute(i18n('html-entities-example'), {
        htmlEntity: { type: mode, onlyInvisible },
    });
    return escapeHTML(raw).replace(/(&amp;#?[\da-z_-]+;|\\u[\da-f]{4})/gi, '<span style="color: green;">$1</span>');
}

export function getRuleOverrides(typograf: TypografBase) {
    const enabled: string[] = [];
    const disabled: string[] = [];
    for (const rule of Typograf.getRules()) {
        (typograf.isEnabledRule(rule.name) ? enabled : disabled).push(rule.name);
    }
    return { enabled, disabled };
}
