/** @jsx h */

import { h, Component } from 'preact';

import i18n from '../i18n';
import storage from '../storage/storage';
import PrefsHtmlEntities from '../prefs-html-entities/prefs-html-entities';
import {default as Typograf, prepareLocale} from '../typograf/typograf';

import './prefs.less';
import '../button/button.less';

const typografPrefs = new Typograf({
    disableRule: '*',
    enableRule: ['common/nbsp/*', 'ru/nbsp/*']
});

export default class Prefs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            main: undefined,
            locale: storage.get('locale', 'ru'),
            mode: storage.get('mode') || '',
            onlyInvisible: storage.get('onlyInvisible', false),
            groups: this.getSortedGroups()
        };

        const rules = storage.get('rules');
        if (rules && Array.isArray(rules.disabled) && Array.isArray(rules.enabled)) {
            this._enableDisableRules(this.state.groups, rules.enabled, rules.disabled);
        }

        [
            'onClose',
            'onDefault',
            'onModeChange',
            'onOnlyInvisibleChange'
        ].forEach(function(method) {
            this[method] = this[method].bind(this);
        });
    }

    onRuleClick(id, e) {
        const checked = e.target.checked;

        const groups = clone(this.state.groups);
        groups.forEach(group => {
            group.rules.some(function(rule) {
                if (rule.name === id) {
                    rule.checked = checked;
                    return true;
                }

                return false;
            })
        });

        this.setState({
            main: this._getMainChecked,
            groups
        });            
    }

    onMainChange(e) {
        const
            groups = clone(this.state.groups),
            checked = e.target.checked;

        groups.forEach(group => {
            group.rules.forEach(rule => {
                rule.checked = checked;
            });
        });

        this.setState({
            main: checked,
            groups
        });
    }

    onModeChange(e) {
        const mode = e.target.value;
        this.setState({mode});

        storage.set('mode', mode);
    }

    onDefault() {
        this.setState({
            mode: '',
            locale: 'ru',
            onlyInvisible: false,
            groups: this.getSortedGroups()
        })
    }

    onClose() {
        this.props.onClose();
    }

    render(props, state) {
        return <div class="prefs">
            <div class="prefs__items">
                <div class="prefs__item prefs__item_first">
                    <div class="prefs__title">{i18n('prefs')}</div>
                </div>
                <div class="prefs__mode prefs__item">
                    <PrefsHtmlEntities onModeChange={this.onModeChange} mode={state.mode} onOnlyInvisibleChange={state.onOnlyInvisibleChange} onlyInvisible={state.onlyInvisible} />
                </div>
                <div class="prefs__item prefs__item_last">
                    <div class="prefs__rules-title">{i18n('rules')}</div>
                    <div class="prefs__top">
                        <label><input type="checkbox" class="prefs__all-rules" autocomplete="off" onMainChange={this.onMainChange} /> {i18n('select-all')}</label>
                    </div>
                    <div class="prefs__rules">
                    {state.groups.map(group => <PrefsRuleGroup rules={group.rules} title={group.title} />)}
                    </div>
                </div>
            </div>
            <div class="prefs__actions">
                <span class="prefs__default button" onClick={this.onDefault}>{i18n('default')}</span>
                <span class="prefs__close button button_active" onClick={this.onClose}>{i18n('close')}</span>
            </div>
        </div>;
    }

    getSortedGroups() {
        const rules = Typograf.prototype._rules,
            lang = i18n.getLang(),
            filteredRules = [];

        // Правила для live-режима не показываем в настройках.
        rules.forEach(function(el) {
            if (!el.live) {
                filteredRules.push(el);
            }
        });

        this._sortByGroupIndex(filteredRules);

        const groups = this._splitGroups(filteredRules);
        this._sortGroupsByTitle(groups, lang);

        return groups;
    }

    save() {
        const
            enabled = [],
            disabled = [],
            state = this.state;

        state.groups.forEach(group => {
            group.rules.forEach(rule => {
                const name = rule.name;
                if (rule.checked) {
                    enabled.push(name);
                } else {
                    disabled.push(name);
                }
            });
        });

        storage
            .set('settings.rules', JSON.stringify({ enabled, disabled }))
            .set('settings.locale', state.locale)
            .set('settings.mode', state.mode)
            .set('settings.onlyInvisible', state.onlyInvisible);
    }

    byDefault() {
        const groups = clone(this.state.groups);
        groups.forEach(group => {
            group.rules.forEach(rule => {
                Typograf.prototype._rules.some(typografRule => {
                    if (rule.id === typografRule.id) {
                        rule.checked = typografRule.disabled !== true;

                        return true;
                    }

                    return false;
                });
            });
        });

        this.setState({
            all: undefined,
            groups
        });
    }

    _enableDisableRules(groups, enabled, disabled) {
        groups.forEach(group => {
            group.rules.forEach(rule => {
                const name = rule.name;
                if (enabled.indexOf(name) > -1) {
                    rule.checked = true;
                } else if (disabled.indexOf(name) > -1) {
                    rule.checked = false;
                } else {
                    Typograf.prototype._rules.some(typografRule => {
                        if (typografRule.name === rule.name) {
                            rule.checked = rule.disabled === true ? false : true;
                            return true;
                        }

                        return false;
                    });
                }
            });
        });
    }    

    _sortByGroupIndex(rules) {
        rules.sort(function(a, b) {
            if (!a.name || !b.name) {
                return -1;
            }

            const
                indexA = Typograf.getGroupIndex(a._group),
                indexB = Typograf.getGroupIndex(b._group);

            if (indexA > indexB) {
                return 1;
            } else if (indexA === indexB) {
                return 0;
            } else {
                return -1;
            }
        });
    }

    _splitGroups(rules) {
        let
            currentGroupName,
            currentGroup;

        const groups = [];

        rules.forEach(function(rule) {
            var groupName = rule._group;

            if (groupName !== currentGroupName) {
                currentGroupName = groupName;
                currentGroup = [];
                groups.push(currentGroup);
            }

            currentGroup.push(rule);
        }, this);

        return groups;
    }

    _sortGroupsByTitle(groups, lang) {
        const titles = Typograf.titles;

        groups.forEach(function(group) {
            group.sort(function(a, b) {
                const
                    titleA = titles[a.name],
                    titleB = titles[b.name];

                return (titleA[lang] || titleA.common) > (titleB[lang] || titleB.common) ? 1 : -1;
            });
        });
    }

    _clickLegend() {
        $(this)
            .closest('.prefs__fieldset')
            .toggleClass('prefs__fieldset_visible')
            .find('.prefs__group-rules')
            .slideToggle('fast');
    }

    _getMainChecked(groups) {
        let 
            count = 0,
            countChecked = 0;

        groups.forEach(group => {
            group.rules.forEach(rule => {
                count++;
                if (rule.checked) {
                    countChhecked++;
                }
            });
        });

        if (countChecked === count) {
            return true;
        } else if (!countChecked) {
            return false;
        }

        return undefined;
    }
}
