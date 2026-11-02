import { useMemo } from 'preact/hooks';
import TypografBase from 'typograf';
import { i18n, I18NLanguage } from '../../i18n/i18n';
import { metrikaReachGoal } from '../../services/metrika';
import { EntitySettings } from './EntitySettings';
import { RuleSettings } from './RuleSettings';
import { getRuleGroups, getRuleOverrides, getVisibleRules } from './prefsUtils';
import type { PrefsData } from './prefsTypes';
import '../Button/Button';
import './Prefs.css';

interface PrefsProps {
    opened: boolean;
    language: I18NLanguage;
    typograf: TypografBase;
    value: PrefsData;
    onChange: (value: PrefsData) => void;
}

export function Prefs({ opened, language, typograf, value, onChange }: PrefsProps) {
    const groups = useMemo(() => getRuleGroups(language), [language]);

    function save(nextValue: Omit<PrefsData, 'rules'>) {
        onChange({ ...nextValue, rules: getRuleOverrides(typograf) });
    }

    function reset() {
        for (const rule of getVisibleRules(groups)) {
            if (rule.enabled) typograf.enableRule(rule.name);
            else typograf.disableRule(rule.name);
        }
        save({ locale: value.locale, mode: 'default', onlyInvisible: true });
        metrikaReachGoal('settings-default');
    }

    return <div class={`prefs ${opened ? 'prefs_opened' : ''}`} data-nosnippet>
        <div class="prefs__items">
            <div class="prefs__item prefs__item_first"><div class="prefs__title">{i18n('prefs')}</div></div>
            <EntitySettings mode={value.mode} onlyInvisible={value.onlyInvisible} onChange={changes => save({ ...value, ...changes })} />
            <RuleSettings groups={groups} language={language} typograf={typograf} onChange={() => save(value)} />
        </div>
        <div class="prefs__actions"><button type="button" class="prefs__default button" onClick={reset}>{i18n('default')}</button></div>
    </div>;
}
