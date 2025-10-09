import { Typograf } from '../helpers/typograf';
import { eyoRule, eyoKey } from './eyo';

export function addTypografRules() {
    Typograf.addRule(eyoRule);
}

export function addTypografI18nKeys() {
    Typograf.titles[eyoRule.name] = eyoKey;
}
