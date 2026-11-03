import type { I18NLanguage } from '../../i18n/i18n';

export interface InterfaceLanguageToggleProps {
    language: I18NLanguage;
    onChange: (language: I18NLanguage) => void;
}
