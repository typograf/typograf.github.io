import { useState } from 'preact/hooks';
import type { TypografRuleInternal } from 'typograf';
import TypografBase from 'typograf';
import type { I18NLanguage } from '../../i18n/i18n';
import { metrikaReachGoal } from '../../services/metrika';
import { getRuleGroupTitle, getRuleTitle } from './prefsUtils';

interface RuleGroupProps {
    rules: TypografRuleInternal[];
    language: I18NLanguage;
    typograf: TypografBase;
    onToggle: (name: string, checked: boolean) => void;
}

export function RuleGroup({ rules, language, typograf, onToggle }: RuleGroupProps) {
    const [expanded, setExpanded] = useState(false);
    const groupName = rules[0].group;
    return <fieldset class={`prefs__fieldset ${expanded ? 'prefs__fieldset_visible' : ''}`}>
        <legend class="prefs__legend button" onClick={() => {
            setExpanded(current => !current);
            metrikaReachGoal('settings-click-group-rule');
        }}>{getRuleGroupTitle(groupName, language)}</legend>
        <div class="prefs__group-rules" style={{ display: expanded ? 'block' : 'none' }}>
            {rules.map(rule => <div class="prefs__rule" title={rule.name} key={rule.name}>
                <input type="checkbox" class="prefs__rule-checkbox" id={`setting-${rule.name}`} checked={typograf.isEnabledRule(rule.name)} onChange={event => onToggle(rule.name, event.currentTarget.checked)} />
                <label for={`setting-${rule.name}`}><span dangerouslySetInnerHTML={{ __html: getRuleTitle(rule, language) }} />{rule.locale !== 'common' && <span class="prefs__rule-lang">{rule.locale}</span>}</label>
            </div>)}
        </div>
    </fieldset>;
}
