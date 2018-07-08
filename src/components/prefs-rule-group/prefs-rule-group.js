import PrefsRule from '../prefs-rule/prefs-rule';

export default function PrefsRuleGroup(props) {
    return <fieldset class="prefs-rule-group">
        <legend class="prefs-rule-group__legend button">{props.title}</legend>
        <div class="prefs-rule-group__list">
            {props.rules.map(
                rule => <PrefsRule name={rule.name} key={rule.name} checked={rule.checked} title={rule.title} onChange={props.onRuleChange} />
            )}
        </div>
    </fieldset>;
}
