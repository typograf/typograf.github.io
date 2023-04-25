import { metrikaHit } from './services/metrika';
import { setI18nLang, addI18nKeysets, i18nUpdatePage, I18NLanguage, I18nKeysets, I18NKeys } from './i18n/i18n';
import { keysets } from './i18n/keysets';
import { withInstallApp } from './helpers/withInstallApp';
import { App } from './components/app/app';
import { config } from './components/app/config';
import { Typograf } from './helpers/typograf';

metrikaHit();

setI18nLang(config.language as I18NLanguage);
addI18nKeysets(keysets);

const rulesKeysets: I18nKeysets = {};

Object.keys(Typograf.titles).forEach(key => {
    let title = Typograf.titles[key];
    if (title.common) {
        title = {
            'en-US': title.common,
            ru: title.common,
        };
    }

    rulesKeysets[key] = title as I18NKeys;
});

addI18nKeysets(rulesKeysets);

const groupKeysets: I18nKeysets = {};
Typograf.groups.forEach(item => {
    groupKeysets[item.name] = item.title as I18NKeys;
});

addI18nKeysets(groupKeysets as I18nKeysets);

i18nUpdatePage();

withInstallApp();

new App();

