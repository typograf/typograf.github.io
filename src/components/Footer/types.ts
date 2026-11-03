import type { I18NLanguage } from '../../i18n/i18n';

export interface FooterProps {
    language: I18NLanguage;
    onLanguageChange: (language: I18NLanguage) => void;
}
