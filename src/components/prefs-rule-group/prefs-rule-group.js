import i18n from '../i18n';
import PrefsRule from '../prefs-rule/prefs-rule';
import Typograf from '../typograf/typograf';

export default function PrefsRuleGroup(props) {
    const langUI = i18n.getLang();

    return <fieldset class="prefs-rule-group">
        <legend class="prefs-rule-group__legend button">{props.title}</legend>
        <div class="prefs-rule-group__list">
            {props.list.map(function(rule) {
                const title = Typograf.titles[rule.name],

                if (!title || !(title[langUI] || title.common)) {
                    console.warn(`Not found title for name "${name}".`);
                }

                const title = typografPrefs.execute(
                    str.escapeHTML(title[langUI] || title.common),
                    {locale: prepareLocale(langUI)}
                );

                return <PrefsRule key={rule.id} id={rule.id} checked={rule.checked} name={rule.name} title={title} onChange={this.onRuleChange} />;
            }, this)}
        </div>
    </fieldset>;
}
