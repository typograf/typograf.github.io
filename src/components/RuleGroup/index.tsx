import type { TargetedEvent, TargetedMouseEvent } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import classNames from 'classnames';
import { trackMetrikaAction } from '../../services/metrika';
import { block } from '../../helpers/bem';
import { Ripple } from '../Ripple';
import { useRipple } from '../Ripple/hooks/useRipple';
import { getRuleGroupTitle, getRuleTitle } from './utils';
import type { RuleGroupProps } from './types';
import './index.css';

const b = block('rule-group');

export function RuleGroup({ rules, matchingRules, searchQuery, language, typograf, onToggle }: RuleGroupProps) {
    const [expanded, setExpanded] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(true);
    const { waves, startRipple } = useRipple();
    const groupName = rules[0].group;
    const enabledCount = rules.filter(rule => typograf.isEnabledRule(rule.name)).length;
    const opened = searchQuery ? searchExpanded : expanded;

    useEffect(() => setSearchExpanded(true), [searchQuery]);

    const toggleExpanded = useCallback((event: TargetedMouseEvent<HTMLLegendElement>) => {
        startRipple(event);
        if (searchQuery) setSearchExpanded(current => !current);
        else setExpanded(current => !current);
        trackMetrikaAction('settings-click-group-rule');
    }, [searchQuery, startRipple]);
    const changeRule = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        onToggle(event.currentTarget.name, event.currentTarget.checked);
    }, [onToggle]);

    return <fieldset class={b({ visible: opened })}>
        <legend class={classNames(b('legend'), 'button')} aria-expanded={opened} onClick={toggleExpanded}>
            {getRuleGroupTitle(groupName, language)}<sup class={b('count', { empty: enabledCount === 0, complete: enabledCount === rules.length })}>{enabledCount}/{rules.length}</sup><Ripple waves={waves} />
        </legend>
        <div class={b('group-rules')} aria-hidden={!opened}>
            <div class={b('group-rules-inner')}>
                {matchingRules.map(rule => <div class={b('rule')} title={rule.name} key={rule.name}>
                    <input type="checkbox" class={b('rule-checkbox')} id={`setting-${rule.name}`} name={rule.name} checked={typograf.isEnabledRule(rule.name)} onChange={changeRule} />
                    <label for={`setting-${rule.name}`}><span dangerouslySetInnerHTML={{ __html: getRuleTitle(rule, language) }} />{rule.locale !== 'common' && <span class={b('rule-lang')}>{rule.locale}</span>}</label>
                </div>)}
            </div>
        </div>
    </fieldset>;
}
