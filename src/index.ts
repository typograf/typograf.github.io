import { metrikaHit } from './services/metrika';
import { setI18nLang, addI18nKeysets, i18nUpdatePage, I18NLanguage } from './i18n/i18n';
import { keysets } from './i18n/keysets';
import { withInstallApp } from './helpers/withInstallApp';
import { App } from './components/app/app';
import { config } from './components/app/config';
import { addTypografKeysets } from './i18n/typograf';
import { addTypografRules } from './rules';

metrikaHit();

setI18nLang(config.language as I18NLanguage);
addI18nKeysets(keysets);
addTypografKeysets();
addTypografRules();

i18nUpdatePage();

withInstallApp();

new App();

