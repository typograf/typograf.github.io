import type TypografBase from 'typograf';
import type { TypografHtmlEntity } from 'typograf';
import type { I18NLanguage } from '../../i18n/i18n';
import type { ConfigRules } from '../../lib/Config';

export interface SettingsData {
    locale: string;
    mode: TypografHtmlEntity['type'];
    onlyInvisible: boolean;
    rules: ConfigRules;
}

export interface SettingsPanelProps {
    opened: boolean;
    language: I18NLanguage;
    typograf: TypografBase;
    value: SettingsData;
    onChange: (value: SettingsData) => void;
}
