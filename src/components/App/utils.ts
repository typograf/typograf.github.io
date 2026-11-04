import { isAboutHash, isPrefsHash } from '../../helpers/hash';
import { isJSON, typografyJSON } from '../../helpers/json';
import { prepareLocale } from '../../helpers/prepareLocale';
import { isHTML } from '../../helpers/string';
import type { Typograf } from '../../helpers/typograf';
import type { SettingsData } from '../SettingsPanel/types';
import type { Tab } from './types';

export function formatHtml(text: string, typograf: InstanceType<typeof Typograf>, settings: SettingsData) {
    const options = {
        locale: prepareLocale(settings.locale),
        htmlEntity: { type: settings.mode, onlyInvisible: settings.onlyInvisible },
    };
    if (isJSON(text)) {
        return typografyJSON(text, value => typograf.execute(value, options));
    }
    let result = typograf.execute(text, options);
    if (isHTML(result) && window.html_beautify) {
        result = window.html_beautify(result);
    }
    return result;
}

export function getTabFromHash(): Tab {
    if (isPrefsHash()) return 'prefs';
    if (isAboutHash()) return 'about';
    return 'editor';
}
