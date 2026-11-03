import type { TargetedEvent } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import { metrikaReachGoal } from '../../services/metrika';
import { RuleGroup } from '../RuleGroup';
import { getVisibleRules } from './utils';
import type { RuleSettingsProps } from './types';
import './index.css';

const b = block('rule-settings');

export function RuleSettings({ groups, language, typograf, onChange }: RuleSettingsProps) {
    const visibleRules = useMemo(() => getVisibleRules(groups), [groups]);
    const checkedCount = visibleRules.filter(rule => typograf.isEnabledRule(rule.name)).length;
    const allChecked = checkedCount === visibleRules.length;
    const allIndeterminate = checkedCount > 0 && !allChecked;
    const setAllRulesRef = useCallback((element: HTMLInputElement | null) => {
        if (element) element.indeterminate = allIndeterminate;
    }, [allIndeterminate]);

    const toggleRule = useCallback((name: string, checked: boolean) => {
        if (checked) typograf.enableRule(name);
        else typograf.disableRule(name);
        onChange();
        metrikaReachGoal('settings-click-rule');
    }, [onChange, typograf]);

    const selectAll = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        const checked = event.currentTarget.checked;
        for (const rule of visibleRules) {
            if (checked) typograf.enableRule(rule.name);
            else typograf.disableRule(rule.name);
        }
        onChange();
        metrikaReachGoal('settings-select-all-rules');
    }, [onChange, typograf, visibleRules]);

    return <div class={b()}>
        <div class={b('rules-title')}>{i18n('rules')}</div>
        <div class={b('top')}>
            <input type="checkbox" class={b('all-rules')} id="rule-settings__all-rules" checked={allChecked} ref={setAllRulesRef} onChange={selectAll} /> <label for="rule-settings__all-rules">{i18n('select-all')}</label>
        </div>
        <div class={b('rules')}>
            {groups.map(group => <RuleGroup key={group[0].group} rules={group} language={language} typograf={typograf} onToggle={toggleRule} />)}
        </div>
    </div>;
}
