import type { TargetedEvent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import { trackMetrikaAction } from '../../services/metrika';
import { RuleGroup } from '../RuleGroup';
import { filterRuleGroups, getVisibleRules, normalizeRuleSearch } from './utils';
import { Checkbox } from '../ui/Checkbox';
import type { RuleSettingsProps } from './types';
import './index.css';

const b = block('rule-settings');

export function RuleSettings({ groups, language, typograf, onChange }: RuleSettingsProps) {
    const [query, setQuery] = useState('');
    const normalizedQuery = normalizeRuleSearch(query);
    const filteredGroups = useMemo(() => filterRuleGroups(groups, language, normalizedQuery), [groups, language, normalizedQuery]);
    const visibleRules = useMemo(() => getVisibleRules(filteredGroups.map(({ matchingRules }) => matchingRules)), [filteredGroups]);
    const checkedCount = visibleRules.filter(rule => typograf.isEnabledRule(rule.name)).length;
    const allChecked = visibleRules.length > 0 && checkedCount === visibleRules.length;
    const allIndeterminate = checkedCount > 0 && !allChecked;
    const setAllRulesRef = useCallback((element: HTMLInputElement | null) => {
        if (element) element.indeterminate = allIndeterminate;
    }, [allIndeterminate]);

    const changeQuery = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        setQuery(event.currentTarget.value);
    }, []);

    const toggleRule = useCallback((name: string, checked: boolean) => {
        if (checked) typograf.enableRule(name);
        else typograf.disableRule(name);
        onChange();
        trackMetrikaAction('settings-click-rule');
    }, [onChange, typograf]);

    const selectAll = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        const checked = event.currentTarget.checked;
        for (const rule of visibleRules) {
            if (checked) typograf.enableRule(rule.name);
            else typograf.disableRule(rule.name);
        }
        onChange();
        trackMetrikaAction('settings-select-all-rules');
    }, [onChange, typograf, visibleRules]);

    return <div class={b()}>
        <div class={b('rules-title')}>{i18n('rules')}</div>
        <input type="search" class={b('search')} value={query} onInput={changeQuery} placeholder={i18n('search-rules')} aria-label={i18n('search-rules')} />
        <div class={b('top')}>
            <Checkbox class={b('all-rules')} id="rule-settings__all-rules" checked={allChecked} disabled={visibleRules.length === 0} ref={setAllRulesRef} onChange={selectAll} />
            <label for="rule-settings__all-rules">{i18n('select-all')}</label>
        </div>
        <div class={b('rules')}>
            {filteredGroups.map(({ group, matchingRules }) => <RuleGroup key={group[0].group} rules={group} matchingRules={matchingRules} searchQuery={normalizedQuery} language={language} typograf={typograf} onToggle={toggleRule} />)}
            {normalizedQuery && filteredGroups.length === 0 && <p class={b('no-results')} role="status">{i18n('no-rules-found')}</p>}
        </div>
    </div>;
}
