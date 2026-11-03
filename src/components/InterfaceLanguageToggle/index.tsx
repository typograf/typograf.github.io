import { useCallback } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import type { InterfaceLanguageToggleProps } from './types';
import './index.css';

const b = block('interface-language-toggle');

export function InterfaceLanguageToggle({ language, onChange }: InterfaceLanguageToggleProps) {
    const nextLanguage = language === 'ru' ? 'en-US' : 'ru';
    const changeLanguage = useCallback(() => onChange(nextLanguage), [onChange, nextLanguage]);

    return <span class={b()} onClick={changeLanguage}>{i18n(language)}</span>;
}
