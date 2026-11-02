import type { TypografHtmlEntity } from 'typograf';
import type { ConfigRules } from '../app/config';

export interface PrefsData {
    locale: string;
    mode: TypografHtmlEntity['type'];
    onlyInvisible: boolean;
    rules: ConfigRules;
}
