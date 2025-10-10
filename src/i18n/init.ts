import { setI18nLang, addI18nKeysets, i18nUpdatePage, I18NLanguage } from './i18n';
import { keysets } from './keysets';
import { config } from '../components/app/config';
import { addTypografKeysets } from './typograf';
import { addTypografRules } from '../rules';

export function initI18n() {
    setI18nLang(config.language as I18NLanguage);

    addI18nKeysets(keysets);
    addTypografKeysets();
    addTypografRules();

    i18nUpdatePage();
}
