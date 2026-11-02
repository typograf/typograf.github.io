import { useMemo, useState } from 'preact/hooks';
import TypografBase, { TypografHtmlEntity, TypografRuleInternal } from 'typograf';
import { i18n, I18NLanguage } from '../../i18n/i18n';
import { escapeHTML } from '../../helpers/string';
import { prepareLocale } from '../../helpers/prepareLocale';
import { Typograf, getTypografGroupIndex, getTypografGroupTitle } from '../../helpers/typograf';
import { metrikaReachGoal } from '../../services/metrika';
import { emojiFlags } from '../../i18n/emojiFlags';
import { ConfigRules } from '../app/config';
import '../button/button';
import './prefs.css';

const previewTypograf = new Typograf({ locale: ['ru', 'en-US'], disableRule: '*', enableRule: ['common/nbsp/*', 'ru/nbsp/*'] });
const entitiesTypograf = new Typograf({ locale: ['ru', 'en-US'], disableRule: '*', enableRule: ['common/nbsp/*', 'common/punctuation/quote'] });

export interface PrefsData {
    locale: string;
    mode: TypografHtmlEntity['type'];
    onlyInvisible: boolean;
    rules: ConfigRules;
}

interface PrefsProps {
    opened: boolean;
    language: I18NLanguage;
    typograf: TypografBase;
    value: PrefsData;
    onChange: (value: PrefsData) => void;
}

function getGroups(language: I18NLanguage) {
    const rules = Typograf.getRules().filter(rule => !rule.live);
    rules.sort((a, b) => (getTypografGroupIndex(a.group) || 0) - (getTypografGroupIndex(b.group) || 0));
    const groups: TypografRuleInternal[][] = [];
    for (const rule of rules) {
        const last = groups[groups.length - 1];
        if (!last || last[0].group !== rule.group) {
            groups.push([rule]);
        } else {
            last.push(rule);
        }
    }
    for (const group of groups) {
        group.sort((a, b) => {
            const aTitle = Typograf.titles[a.name];
            const bTitle = Typograf.titles[b.name];
            return (aTitle?.[language] || aTitle?.common || '').localeCompare(bTitle?.[language] || bTitle?.common || '');
        });
    }
    return groups;
}

function getRuleTitle(rule: TypografRuleInternal, language: I18NLanguage) {
    const title = Typograf.titles[rule.name];
    return previewTypograf.execute(escapeHTML(title?.[language] || title?.common || ''), { locale: prepareLocale(language) });
}

function getExample(mode: PrefsData['mode'], onlyInvisible: boolean) {
    const raw = entitiesTypograf.execute(i18n('html-entities-example'), {
        htmlEntity: { type: mode, onlyInvisible },
    });
    return escapeHTML(raw).replace(/(&amp;#?[\da-z_-]+;|\\u[\da-f]{4})/gi, '<span style="color: green;">$1</span>');
}

export function Prefs({ opened, language, typograf, value, onChange }: PrefsProps) {
    const [, rerender] = useState(0);
    const [expanded, setExpanded] = useState<string[]>([]);
    const groups = useMemo(() => getGroups(language), [language]);
    const visibleRules = ([] as TypografRuleInternal[]).concat(...groups);
    const checkedCount = visibleRules.filter(rule => typograf.isEnabledRule(rule.name)).length;
    const allChecked = checkedCount === visibleRules.length;
    const allIndeterminate = checkedCount > 0 && !allChecked;

    function save(nextValue: Omit<PrefsData, 'rules'>) {
        const enabled: string[] = [];
        const disabled: string[] = [];
        for (const rule of Typograf.getRules()) {
            (typograf.isEnabledRule(rule.name) ? enabled : disabled).push(rule.name);
        }
        onChange({ ...nextValue, rules: { enabled, disabled } });
        rerender(current => current + 1);
    }

    function toggleRule(name: string, checked: boolean) {
        if (checked) typograf.enableRule(name);
        else typograf.disableRule(name);
        save(value);
        metrikaReachGoal('settings-click-rule');
    }

    function selectAll(checked: boolean) {
        for (const rule of visibleRules) {
            if (checked) typograf.enableRule(rule.name);
            else typograf.disableRule(rule.name);
        }
        save(value);
        metrikaReachGoal('settings-select-all-rules');
    }

    function reset() {
        for (const rule of visibleRules) {
            if (rule.enabled) typograf.enableRule(rule.name);
            else typograf.disableRule(rule.name);
        }
        save({ locale: value.locale, mode: 'default', onlyInvisible: true });
        metrikaReachGoal('settings-default');
    }

    return <div class={`prefs ${opened ? 'prefs_opened' : ''}`} data-nosnippet>
        <div class="prefs__items">
            <div class="prefs__item prefs__item_first"><div class="prefs__title">{i18n('prefs')}</div></div>
            <div class="prefs__mode prefs__item">
                <div class="prefs__html-entities">
                    <span>{i18n('html-entities')}</span>:<br />
                    <select class="prefs__set-mode" title={i18n('html-entities')} value={value.mode || 'default'} onChange={event => {
                        save({ ...value, mode: event.currentTarget.value as PrefsData['mode'] });
                        metrikaReachGoal('settings-select-html-entity');
                    }}>
                        <option value="default">UTF-8</option>
                        <option value="name">{i18n('names')}</option>
                        <option value="digit">{i18n('digits')}</option>
                        <option value="js">JS</option>
                    </select>
                    <span class="prefs__invisible-symbols-container" style={{ display: ['digit', 'name', 'js'].indexOf(value.mode || '') >= 0 ? 'inline-block' : 'none' }}>
                        <input type="checkbox" class="prefs__only-invisible" id="invisible-symbols" checked={value.onlyInvisible} onChange={event => {
                            save({ ...value, onlyInvisible: event.currentTarget.checked });
                            metrikaReachGoal('settings-select-html-entity');
                        }} /> <label for="invisible-symbols">{i18n('invisible-symbols')}</label>
                    </span><br />
                    <div class="prefs__html-entities-example-container"><span>{i18n('example')}</span>: <span class="prefs__html-entities-example" dangerouslySetInnerHTML={{ __html: getExample(value.mode, value.onlyInvisible) }} /></div>
                </div>
            </div>
            <div class="prefs__item prefs__item_last">
                <div class="prefs__rules-title">{i18n('rules')}</div>
                <div class="prefs__top">
                    <input type="checkbox" class="prefs__all-rules" id="prefs__all-rules" checked={allChecked} ref={element => { if (element) element.indeterminate = allIndeterminate; }} onChange={event => selectAll(event.currentTarget.checked)} /> <label for="prefs__all-rules">{i18n('select-all')}</label>
                </div>
                <div class="prefs__rules">
                    {groups.map(group => {
                        const groupName = group[0].group;
                        const isExpanded = expanded.indexOf(groupName) >= 0;
                        const groupTitle = previewTypograf.execute(getTypografGroupTitle(groupName, language) || '', { locale: prepareLocale(language) });
                        return <fieldset class={`prefs__fieldset ${isExpanded ? 'prefs__fieldset_visible' : ''}`} key={groupName}>
                            <legend class="prefs__legend button" onClick={() => {
                                setExpanded(current => isExpanded ? current.filter(name => name !== groupName) : [...current, groupName]);
                                metrikaReachGoal('settings-click-group-rule');
                            }}>{groupTitle}</legend>
                            <div class="prefs__group-rules" style={{ display: isExpanded ? 'block' : 'none' }}>
                                {group.map(rule => <div class="prefs__rule" title={rule.name} key={rule.name}>
                                    <input type="checkbox" class="prefs__rule-checkbox" id={`setting-${rule.name}`} checked={typograf.isEnabledRule(rule.name)} onChange={event => toggleRule(rule.name, event.currentTarget.checked)} />
                                    <label for={`setting-${rule.name}`}><span dangerouslySetInnerHTML={{ __html: getRuleTitle(rule, language) }} />{rule.locale !== 'common' && <span class="prefs__rule-lang">{rule.locale}</span>}</label>
                                </div>)}
                            </div>
                        </fieldset>;
                    })}
                </div>
            </div>
        </div>
        <div class="prefs__actions"><button type="button" class="prefs__default button" onClick={reset}>{i18n('default')}</button></div>
    </div>;
}

export function LocaleSelect({ value, onChange }: { value: string, onChange: (locale: string) => void }) {
    const locales = Typograf.getLocales().sort((a, b) => i18n('locale-' + a).localeCompare(i18n('locale-' + b)));
    return <span class="prefs__locale"><span>{i18n('locale')}</span>: <select class="prefs__set-locale" title={i18n('locale')} value={value} onChange={event => onChange(event.currentTarget.value)}>
        {locales.map(item => {
            const quotesData = Typograf.getData(`${item}/quote`) as { left: string; right: string };
            const quotes = quotesData.left + quotesData.right.split('').reverse().join('');
            return <option value={item} key={item}>{emojiFlags[item] || ''} {i18n('locale-' + item)} {quotes}</option>;
        })}
    </select></span>;
}
