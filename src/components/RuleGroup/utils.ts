import type { TypografRuleInternal } from 'typograf';
import { escapeHTML } from '../../helpers/string';
import { prepareLocale } from '../../helpers/prepareLocale';
import { Typograf, getTypografGroupTitle } from '../../helpers/typograf';
import type { I18NLanguage } from '../../i18n/i18n';

const previewTypograf = new Typograf({ locale: ['ru', 'en-US'], disableRule: '*', enableRule: ['common/nbsp/*', 'ru/nbsp/*'] });

export function getRuleTitle(rule: TypografRuleInternal, language: I18NLanguage) {
    const title = Typograf.titles[rule.name];
    return previewTypograf.execute(escapeHTML(title?.[language] || title?.common || ''), { locale: prepareLocale(language) });
}

export function getRuleGroupTitle(groupName: string, language: I18NLanguage) {
    return previewTypograf.execute(getTypografGroupTitle(groupName, language) || '', { locale: prepareLocale(language) });
}
