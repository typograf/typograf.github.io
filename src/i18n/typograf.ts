import { Typograf } from '../helpers/typograf';
import { addTypografI18nKeys } from '../rules';
import { addI18nKeysets, I18nKeysets, I18NKeys } from './i18n';

export function addTypografKeysets() {
    const rulesKeysets: I18nKeysets = {};

    addTypografI18nKeys();

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
}
