import TypografBase from 'typograf';
import { TypografHtmlEntity } from 'typograf';
import { TypografRuleInternal } from 'typograf';

import { i18n } from '../../i18n/i18n';
import { escapeHTML } from '../../helpers/string';
import { prepareLocale } from '../../helpers/prepareLocale';
import { Paranja } from '../paranja/paranja';
import { Typograf, getTypografGroupIndex, getTypografGroupTitle } from '../../helpers/typograf';
import { metrikaReachGoal } from '../../services/metrika';
import { closest, hideElement, showElement, toggleElement } from '../../helpers/dom';
import { emojiFlags } from '../../i18n/emojiFlags';

import '../button/button';

import './prefs.css';

const defaultLocales = ['ru', 'en-US'];
const typografPrefs = new Typograf({
    locale: defaultLocales,
    disableRule: '*',
    enableRule: ['common/nbsp/*', 'ru/nbsp/*'],
});

const typografEntities = new Typograf({
    locale: defaultLocales,
    disableRule: '*',
    enableRule: ['common/nbsp/*', 'common/punctuation/quote'],
});

interface PrefsOnChangeData {
    rules: { enabled: string[], disabled: string[]};
    locale: string;
    mode: TypografHtmlEntity['type'];
    onlyInvisible: boolean;
}

interface PrefsParams {
    typograf: TypografBase;
    getLanguage: () => string;
    getLocale: () => string;
    getMode: () => TypografHtmlEntity['type'];
    getOnlyInvisible: () => boolean;
    onChange(data: PrefsOnChangeData): void;
}

export class Prefs {
    private paranja: Paranja;

    private locale: string;
    private mode: TypografHtmlEntity['type'];
    private onlyInvisible: boolean;

    private dom = document.querySelector('.prefs') as HTMLDivElement;
    private domSetLocale = document.querySelector('.prefs__set-locale') as HTMLSelectElement;
    private domAllRules = document.querySelector('.prefs__all-rules') as HTMLInputElement;
    private domClose = document.querySelector('.prefs__close') as HTMLDivElement;
    private domDefault = document.querySelector('.prefs__default') as HTMLDivElement;
    private domRules = document.querySelector('.prefs__rules') as HTMLDivElement;
    private domSetMode = document.querySelector('.prefs__set-mode') as HTMLInputElement;
    private domOnlyInvisible = document.querySelector('.prefs__only-invisible') as HTMLInputElement;
    private domHtmlEntitiesExample = document.querySelector('.prefs__html-entities-example') as HTMLDivElement;
    private domInvisibleSymbolsContainer = document.querySelector('.prefs__invisible-symbols-container') as HTMLDivElement;

    constructor(private params: PrefsParams) {
        this.paranja = new Paranja({
            onClick: () => {
                this.hide();
            },
        });

        this.locale = this.params.getLocale();
        this.mode = this.params.getMode();

        this.onlyInvisible = this.params.getOnlyInvisible();

        this.createRules();

        this.createLocaleContent();

        this.updateUI();
        this.bindEvents();
    }

    show() {
        this.dom.classList.add('prefs_opened');
        this.paranja.show();

        this.synchronizeMainCheckbox();

        metrikaReachGoal('settings-open');
    }

    hide() {
        this.dom.classList.remove('prefs_opened');
        this.paranja.hide();

        metrikaReachGoal('settings-close');
    }

    toggle() {
        if (this.opened()) {
            this.hide();
        } else {
            this.show();
        }
    }

    opened() {
        return this.dom.classList.contains('prefs_opened');
    }

    private save() {
        const enabled: string[] = [];
        const disabled: string[] = [];

        Typograf.getRules().forEach(rule => {
            if (this.params.typograf.isEnabledRule(rule.name)) {
                enabled.push(rule.name);
            } else {
                disabled.push(rule.name);
            }
        });

        this.synchronizeMainCheckbox();

        this.params.onChange({
            rules: { enabled, disabled },
            onlyInvisible: this.onlyInvisible,
            mode: this.mode,
            locale: this.locale,
        });
    }

    private handleDefaultClick() {
        this.getCheckboxes().forEach(checkbox => {
            const id = checkbox.dataset.id;
            if (!id) {
                return;
            }

            Typograf.getRules().some(rule => {
                if (id === rule.name) {
                    const checked = rule.enabled;
                    checkbox.checked = checked;

                    if (checked) {
                        this.params.typograf.enableRule(id);
                    } else {
                        this.params.typograf.disableRule(id);
                    }

                    return true;
                }

                return false;
            });
        });

        this.setCheckedAllRules(undefined);

        this.mode = 'default';
        this.onlyInvisible = true;
        this.updateUI();

        this.save();

        metrikaReachGoal('settings-default');
    }

    private setCheckedAllRules(checked: boolean | undefined) {
        this.domAllRules.checked = Boolean(checked);
        this.domAllRules.indeterminate = checked === undefined;
    }

    private handleChangeLocale = () => {
        const value = this.domSetLocale.value;
        this.locale = value;

        this.save();

        metrikaReachGoal('select-locale', { changeLocale: value });
    }

    private handleModeChange = () => {
        this.mode = this.domSetMode.value as TypografHtmlEntity['type'];
        this.onlyInvisible = this.domOnlyInvisible.checked;
        this.updateInvisibleSymbols();

        this.save();

        metrikaReachGoal('settings-select-html-entity');
    }

    private updateInvisibleSymbols() {
        let html = typografEntities.execute(i18n('html-entities-example'), {
            htmlEntity: {
                type: this.mode,
                onlyInvisible: this.onlyInvisible,
            }
        });

        html = escapeHTML(html)
            .replace(/(&amp;#?[\da-z_-]+;|\\u[\da-f]{4})/gi, '<span style="color: green;">$1</span>');

        this.domHtmlEntitiesExample.innerHTML = html;

        if (this.mode === 'digit' || this.mode === 'name' || this.mode === 'js') {
            showElement(this.domInvisibleSymbolsContainer);
        } else {
            hideElement(this.domInvisibleSymbolsContainer);
        }
    }

    private sortByGroupIndex(rules: TypografRuleInternal[]) {
        rules.sort((a, b) => {
            if (!a.name || !b.name) {
                return -1;
            }

            const indexA = getTypografGroupIndex(a.group);
            const indexB = getTypografGroupIndex(b.group);

            if (indexA > indexB) {
                return 1;
            } else if (indexA === indexB) {
                return 0;
            } else {
                return -1;
            }
        });
    }

    private splitGroups(rules: TypografRuleInternal[]) {
        let currentGroupName: string;
        let currentGroup: TypografRuleInternal[];

        const groups: TypografRuleInternal[][] = [];

        rules.forEach(rule => {
            const groupName = rule.group;

            if (groupName !== currentGroupName) {
                currentGroupName = groupName;
                currentGroup = [];
                groups.push(currentGroup);
            }

            currentGroup.push(rule);
        });

        return groups;
    }

    private sortGroupsByTitle(groups: TypografRuleInternal[][], language: string) {
        groups.forEach(group => {
            group.sort((a, b) => {
                const titleA = Typograf.titles[a.name];
                const titleB = Typograf.titles[b.name];

                if (!titleA || !titleB) {
                    return 1;
                }

                return (
                    titleA[language] ||
                    titleA.common) > (titleB[language] ||
                    titleB.common
                ) ? 1 : -1;
            });
        });
    }

    private getSortedGroups(rules: TypografRuleInternal[], language: string) {
        const filteredRules: TypografRuleInternal[] = [];

        // Правила для live-режима не показываем в настройках
        rules.forEach(item => {
            if (!item.live) {
                filteredRules.push(item);
            }
        });

        this.sortByGroupIndex(filteredRules);

        const groups = this.splitGroups(filteredRules);
        this.sortGroupsByTitle(groups, language);

        return groups;
    }

    private createRules() {
        this.domRules.innerHTML = '';

        const language = this.params.getLanguage();
        const groups = this.getSortedGroups(Typograf.getRules(), language);

        groups.forEach(group => {
            const groupName = group[0].group;
            const groupTitle = typografPrefs.execute(
                getTypografGroupTitle(groupName, language),
                { locale: prepareLocale(language) }
            );

            const domFieldset = document.createElement('fieldset');
            domFieldset.className = 'prefs__fieldset';
            const domLegend = document.createElement('legend');
            domLegend.className = 'prefs__legend button';
            domLegend.innerText = groupTitle;
            domLegend.dataset.textId = groupName;
            domFieldset.appendChild(domLegend);

            this.createRulesForGroup(domFieldset, group, language);

            this.domRules.appendChild(domFieldset);
        });
    }

    private getRuleTitle(name: string, language: string) {
        const ruleTitle = Typograf.titles[name];

        if (!ruleTitle || !(ruleTitle[language] || ruleTitle.common)) {
            console.warn('Not found title for name "' + name + '".');
            return '';
        }

        const title = typografPrefs.execute(
            escapeHTML(ruleTitle[language] || ruleTitle.common),
            { locale: prepareLocale(language) }
        );

        return title;
    }

    private createRulesForGroup(container: HTMLElement, group: TypografRuleInternal[], language: string) {
        const domGroup = document.createElement('div');
        domGroup.className = 'prefs__group-rules';

        group.forEach(rule => {
            const { name, locale } = rule;

            const title = this.getRuleTitle(name, language);

            const domRule = document.createElement('div');
            domRule.className = 'prefs__rule';
            domRule.title = name;

            const id = 'setting-' + name;
            const domInput = document.createElement('input');
            domInput.type = 'checkbox';
            domInput.className = 'prefs__rule-checkbox';
            domInput.checked = this.params.typograf.isEnabledRule(name);
            domInput.id = id;
            domInput.dataset.id = name;
            domRule.appendChild(domInput);

            const domLabel = document.createElement('label');
            domLabel.htmlFor = id;
            domLabel.dataset.textId = name;
            domLabel.innerHTML = title;

            if (locale !== 'common') {
                const domSpan = document.createElement('span');
                domSpan.className = 'prefs__rule-lang';
                domSpan.innerText = locale;
                domLabel.appendChild(domSpan);
            }

            domRule.appendChild(domLabel);
            domGroup.appendChild(domRule);
        });

        container.appendChild(domGroup);
    }

    private getCheckboxes() {
        return Array.from(document.querySelectorAll<HTMLInputElement>('.prefs__rule-checkbox'));
    }

    private handleRuleClick(element: HTMLInputElement) {
        this.getCheckboxes().forEach(checkbox => {
            const checkboxId = checkbox.dataset.id;
            if (!checkboxId || element.dataset.id !== checkboxId) {
                return;
            }

            if (checkbox.checked) {
                this.params.typograf.enableRule(checkboxId);
            } else {
                this.params.typograf.disableRule(checkboxId);
            }
        });

        this.save();

        metrikaReachGoal('settings-click-rule');
    }

    private handleLegendClick(element: HTMLElement) {
        const fieldset = closest(element, 'prefs__fieldset');
        if (!fieldset) {
            return;
        }

        fieldset.classList.toggle('prefs__fieldset_visible');

        const groupRules = fieldset.querySelector<HTMLElement>('.prefs__group-rules');
        if (!groupRules) {
            return;
        }

        toggleElement(groupRules);

        metrikaReachGoal('settings-click-group-rule');
    }

    private selectAll() {
        const checked = this.domAllRules.checked;
        const checkboxes = this.getCheckboxes();

        checkboxes.forEach(checkbox => {
            const id = checkbox.dataset.id;

            if (!id) {
                return;
            }

            checkbox.checked = checked;
            if (checked) {
                this.params.typograf.enableRule(id);
            } else {
                this.params.typograf.disableRule(id);
            }
        });

        this.save();

        metrikaReachGoal('settings-select-all-rules');
    }

    private synchronizeMainCheckbox() {
        let count = 0;
        let checked: boolean | undefined;

        const checkboxes = this.getCheckboxes();
        checkboxes.forEach(item => {
            if (item.checked) {
                count++;
            }
        });

        if (count === checkboxes.length) {
            checked = true;
        } else if (!count) {
            checked = false;
        } else {
            checked = undefined;
        }

        this.setCheckedAllRules(checked);
    }

    private updateUI() {
        this.domSetLocale.value = this.locale;
        this.domSetMode.value = this.mode || 'default';
        this.domOnlyInvisible.checked = this.onlyInvisible;
        this.updateInvisibleSymbols();
    }

    private createLocaleContent() {
        const locales = Typograf.getLocales()
            .sort((a, b) => i18n('locale-' + a) > i18n('locale-' + b) ? 1 : -1);

        this.domSetLocale.innerHTML = '';

        locales.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.dataset.textId = `locale-${item}`;
            option.innerText = (emojiFlags[item] || '') + ' ' + i18n('locale-' + item);

            this.domSetLocale.appendChild(option);
        });
    }

    private bindEvents() {
        this.domSetLocale.addEventListener('change', this.handleChangeLocale);

        this.domSetMode.addEventListener('change', this.handleModeChange);
        this.domOnlyInvisible.addEventListener('change', this.handleModeChange);

        this.domAllRules.addEventListener('click', () => {
            this.selectAll();
        });

        this.domDefault.addEventListener('click', () => {
            this.handleDefaultClick();
        });

        this.domClose.addEventListener('click', () => {
            this.hide();
        });

        this.domRules.addEventListener('click', e => {
            const target = e.target as HTMLElement;

            if (!e.target) {
                return;
            }

            if (target.classList.contains('prefs__legend')) {
                this.handleLegendClick(target);
                return;
            }

            if (target.classList.contains('prefs__rule-checkbox')) {
                this.handleRuleClick(target as HTMLInputElement);
                return;
            }
        });
    }
}
