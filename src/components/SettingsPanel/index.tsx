import { useCallback, useMemo } from 'preact/hooks';
import { memo } from 'preact/compat';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import { trackMetrikaAction } from '../../services/metrika';
import { Button } from '../ui/Button';
import { HtmlEntitySettings } from '../HtmlEntitySettings';
import { RuleSettings } from '../RuleSettings';
import { getRuleGroups, getRuleOverrides, getVisibleRules } from '../RuleSettings/utils';
import type { SettingsData, SettingsPanelProps } from './types';
import './index.css';

const b = block('settings-panel');

export const SettingsPanel = memo(function SettingsPanel({ opened, language, typograf, value, onChange }: SettingsPanelProps) {
    const groups = useMemo(() => getRuleGroups(language), [language]);

    const save = useCallback((nextValue: Omit<SettingsData, 'rules'>) => {
        onChange({ ...nextValue, rules: getRuleOverrides(typograf) });
    }, [onChange, typograf]);

    const reset = useCallback(() => {
        for (const rule of getVisibleRules(groups)) {
            if (rule.enabled) typograf.enableRule(rule.name);
            else typograf.disableRule(rule.name);
        }
        save({ locale: value.locale, mode: 'default', onlyInvisible: true });
        trackMetrikaAction('settings-default');
    }, [groups, save, typograf, value.locale]);
    const changeEntities = useCallback((changes: Pick<SettingsData, 'mode' | 'onlyInvisible'>) => {
        save({ ...value, ...changes });
    }, [save, value]);
    const changeRules = useCallback(() => save(value), [save, value]);

    return <div class={b({ opened })} data-nosnippet>
        <div class={b('items')}>
            <div class={b('item', { first: true })}><div class={b('title')}>{i18n('prefs')}</div></div>
            <HtmlEntitySettings mode={value.mode} onlyInvisible={value.onlyInvisible} onChange={changeEntities} />
            <RuleSettings groups={groups} language={language} typograf={typograf} onChange={changeRules} />
        </div>
        <div class={b('actions')}><Button type="button" class={b('default')} onClick={reset}>{i18n('default')}</Button></div>
    </div>;
});
