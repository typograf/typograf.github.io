import type { TypografRuleInternal } from 'typograf';
import TypografBase from 'typograf';
import { i18n, I18NLanguage } from '../../i18n/i18n';
import { metrikaReachGoal } from '../../services/metrika';
import { RuleGroup } from './ruleGroup';
import { getVisibleRules } from './prefsUtils';

interface RuleSettingsProps {
    groups: TypografRuleInternal[][];
    language: I18NLanguage;
    typograf: TypografBase;
    onChange: () => void;
}

export function RuleSettings({ groups, language, typograf, onChange }: RuleSettingsProps) {
    const visibleRules = getVisibleRules(groups);
    const checkedCount = visibleRules.filter(rule => typograf.isEnabledRule(rule.name)).length;
    const allChecked = checkedCount === visibleRules.length;
    const allIndeterminate = checkedCount > 0 && !allChecked;

    function toggleRule(name: string, checked: boolean) {
        if (checked) typograf.enableRule(name);
        else typograf.disableRule(name);
        onChange();
        metrikaReachGoal('settings-click-rule');
    }

    function selectAll(checked: boolean) {
        for (const rule of visibleRules) {
            if (checked) typograf.enableRule(rule.name);
            else typograf.disableRule(rule.name);
        }
        onChange();
        metrikaReachGoal('settings-select-all-rules');
    }

    return <div class="prefs__item prefs__item_last">
        <div class="prefs__rules-title">{i18n('rules')}</div>
        <div class="prefs__top">
            <input type="checkbox" class="prefs__all-rules" id="prefs__all-rules" checked={allChecked} ref={element => { if (element) element.indeterminate = allIndeterminate; }} onChange={event => selectAll(event.currentTarget.checked)} /> <label for="prefs__all-rules">{i18n('select-all')}</label>
        </div>
        <div class="prefs__rules">
            {groups.map(group => <RuleGroup key={group[0].group} rules={group} language={language} typograf={typograf} onToggle={toggleRule} />)}
        </div>
    </div>;
}
