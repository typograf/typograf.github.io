import { TypografHtmlEntity } from 'typograf';
import { myLocalStorage } from '../../helpers/myLocalStorage';

const defaultRules = { disabled: [], enabled: []};

export type ConfigRules = {
    disabled: string[];
    enabled: string[];
};

export class Config {
    private languageInner = '';
    private localeInner = '';
    private rulesInner: ConfigRules = defaultRules;
    private modeInner: TypografHtmlEntity['type'];
    private onlyInvisibleInner = false;

    constructor() {
        this.languageInner = myLocalStorage.getItem('settings.langUI', 'ru');
        if (this.languageInner === 'en') {
            this.languageInner = 'en-US';
        }

        this.localeInner = myLocalStorage.getItem('settings.locale', 'ru');

        const rules = myLocalStorage.getItem<ConfigRules>('settings.rules', defaultRules);
        if (rules && Array.isArray(rules.disabled) && Array.isArray(rules.enabled)) {
            this.rulesInner = rules;
        }

        this.modeInner = myLocalStorage.getItem<TypografHtmlEntity['type']>('settings.mode', 'default');
        this.onlyInvisibleInner = myLocalStorage.getItem('settings.onlyInvisible', false);
    }

    get locale() {
        return this.localeInner;
    }

    set locale(value: string) {
        this.localeInner = value;
        myLocalStorage.setItem('settings.locale', value);
    }

    get mode() {
        return this.modeInner;
    }

    set mode(value: TypografHtmlEntity['type']) {
        this.modeInner = value;
        myLocalStorage.setItem<TypografHtmlEntity['type']>('settings.mode', value);
    }

    get onlyInvisible() {
        return this.onlyInvisibleInner;
    }

    set onlyInvisible(value: boolean) {
        this.onlyInvisibleInner = value;
        myLocalStorage.setItem('settings.onlyInvisible', value);
    }

    get language() {
        return this.languageInner;
    }

    set language(value: string) {
        this.languageInner = value;
        myLocalStorage.setItem('settings.langUI', value);
    }

    get rules() {
        return this.rulesInner;
    }

    set rules(value: ConfigRules) {
        this.rulesInner = value;
        myLocalStorage.setItem('settings.rules', value);
    }
}

export const config = new Config();
