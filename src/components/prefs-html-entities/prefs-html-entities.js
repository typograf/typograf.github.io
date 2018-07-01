/** @jsx h */

import { h } from 'preact';
import i18n from '../i18n';
import str from '../helper/string';

import './prefs-html-entities.less';

const typografEntities = new Typograf({
    disableRule: '*',
    enableRule: ['common/nbsp/*', 'common/punctuation/quote'],
    locale: ['ru', 'en-US']
});

export default function PrefsHtmlEntities(props) {
    let html = typografEntities.execute(i18n('html-entities-example'), {
        htmlEntity: {
            type,
            onlyInvisible
        }
    });

    html = str.escapeHTML(html).replace(/(&amp;#?[\da-z_-]+;)/gi, '<span style="color: green;">$1</span>');
    
    return <div class="prefs-html-entities">
        <span>{i18n('html-entities')}</span>:<br/>
        <select class="prefs-html-entities__set-mode" onChange={props.onModeChange} title={i18n('html-entities')} value={props.mode}>
            <option value="">UTF-8</option>
            <option value="name">{i18n('names')}</option>
            <option value="digit">{i18n('digits')}</option>
        </select><span class="prefs-html-entities__invisible-symbols-container">
            <label><input type="checkbox" class="prefs-html-entities__only-invisible" checked={props.onlyVisible} onChange={props.onOnlyVisible} /> {i18n('invisible-symbols')}</label>
        </span><br/>
        <div class="prefs-html-entities__example-container">{i18n('example')}:
            <span class="prefs-html-entities__example" dangerouslySetInnerHTML={{ __html: html }}></span>
        </div>
    </div>;
}
