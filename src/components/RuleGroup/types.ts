import type TypografBase from 'typograf';
import type { TypografRuleInternal } from 'typograf';
import type { I18NLanguage } from '../../i18n/i18n';

export interface RuleGroupProps {
    rules: TypografRuleInternal[];
    language: I18NLanguage;
    typograf: TypografBase;
    onToggle: (name: string, checked: boolean) => void;
}
