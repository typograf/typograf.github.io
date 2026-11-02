import { i18n, I18NLanguage } from '../../i18n/i18n';
import './languageSelector.css';

interface LanguageSelectorProps {
    language: I18NLanguage;
    onChange: (language: I18NLanguage) => void;
}

export function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
    const nextLanguage = language === 'ru' ? 'en-US' : 'ru';
    return <span class="language-selector" onClick={() => onChange(nextLanguage)}>{i18n(language)}</span>;
}
