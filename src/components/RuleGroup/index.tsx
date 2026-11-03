import type { TargetedEvent } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import classNames from 'classnames';
import { metrikaReachGoal } from '../../services/metrika';
import { block } from '../../helpers/bem';
import { getRuleGroupTitle, getRuleTitle } from './utils';
import type { RuleGroupProps } from './types';
import './index.css';

const b = block('rule-group');

export function RuleGroup({ rules, language, typograf, onToggle }: RuleGroupProps) {
    const [expanded, setExpanded] = useState(false);
    const groupName = rules[0].group;
    const toggleExpanded = useCallback(() => {
        setExpanded(current => !current);
        metrikaReachGoal('settings-click-group-rule');
    }, []);
    const changeRule = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        onToggle(event.currentTarget.name, event.currentTarget.checked);
    }, [onToggle]);

    return <fieldset class={b({ visible: expanded })}>
        <legend class={classNames(b('legend'), 'button')} onClick={toggleExpanded}>{getRuleGroupTitle(groupName, language)}</legend>
        <div class={b('group-rules')} style={{ display: expanded ? 'block' : 'none' }}>
            {rules.map(rule => <div class={b('rule')} title={rule.name} key={rule.name}>
                <input type="checkbox" class={b('rule-checkbox')} id={`setting-${rule.name}`} name={rule.name} checked={typograf.isEnabledRule(rule.name)} onChange={changeRule} />
                <label for={`setting-${rule.name}`}><span dangerouslySetInnerHTML={{ __html: getRuleTitle(rule, language) }} />{rule.locale !== 'common' && <span class={b('rule-lang')}>{rule.locale}</span>}</label>
            </div>)}
        </div>
    </fieldset>;
}
