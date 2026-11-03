import { escapeHTML } from '../../helpers/string';
import { Typograf } from '../../helpers/typograf';
import { i18n } from '../../i18n/i18n';
import type { EntityMode } from './types';

const entitiesTypograf = new Typograf({ locale: ['ru', 'en-US'], disableRule: '*', enableRule: ['common/nbsp/*', 'common/punctuation/quote'] });

export function getEntityExample(mode: EntityMode, onlyInvisible: boolean) {
    const raw = entitiesTypograf.execute(i18n('html-entities-example'), {
        htmlEntity: { type: mode, onlyInvisible },
    });
    return escapeHTML(raw).replace(/(&amp;#?[\da-z_-]+;|\\u[\da-f]{4})/gi, '<span style="color: green;">$1</span>');
}
