/** @jsx h */

import { h, Component, cloneElement } from 'preact';

import i18n from '../i18n';
import str from '../lib/string';
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

        const
            mode = storage.get('mode') || '',
            onlyInvisible = storage.get('onlyInvisible', false);

        this.state = {
            all: undefined,
            locale: storage.get('locale', 'ru'),
            mode,
            onlyInvisible
        };

        const rules = storage.get('rules');
        if (rules && Array.isArray(rules.disabled) && Array.isArray(rules.enabled)) {
            this.state.rules = rules;
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

        if (checked) {
            this.props.typograf.enableRule(id);
        } else {
            this.props.typograf.disableRule(id);
        }

        this.state.rules.some(function(rule) {
            if (rule.id === id) {
                rules.checked = checked;
            }
        });
    
        this._synchronizeMainCheckbox();
            
        this.props.onChange();
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
            rules: '',
            onlyInvisible: false
        })
    }

    onClose() {
        this.props.onClose();
    }

    render(props, state) {
        const langUI = i18n.getLang();

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
                        <label><input type="checkbox" class="prefs__all-rules" autocomplete="off" /> {i18n('select-all')}</label>
                    </div>
                    <div class="prefs__rules">
                    {
                        groups.map(function(group) {
                            const
                                name = group[0]._group,
                                title = typografPrefs.execute(
                                    Typograf.getGroupTitle(name, langUI),
                                    {locale: prepareLocale(langUI)}
                                );
                            return <PrefsRuleGroup list= title={title} />
                        }, this)
                    }
                    </div>
                </div>
            </div>
            <div class="prefs__actions">
                <span class="prefs__default button" onClick={this.onDefault}>{i18n('default')}</span>
                <span class="prefs__close button button_active" onClick={this.onClose}>{i18n('close')}</span>
            </div>
        </div>;
    }

    save() {
        const
            enabled = [],
            disabled = [];

        Object.keys(this._typograf._enabledRules).forEach(function(name) {
            if (this._typograf._enabledRules[name]) {
                enabled.push(name);
            } else {
                disabled.push(name);
            }
        }, this);

        storage
            .set('settings.rules', JSON.stringify({ enabled, disabled }))
            .set('settings.locale', this.locale)
            .set('settings.mode', this.mode)
            .set('settings.onlyInvisible', this.onlyInvisible);
    }

    byDefault() {
        this.state.rules.forEach(function(rule) {
            Typograf.prototype._rules.some(typografRule => {
                if (rule.id === typografRule.id) {
                    rule.checked = typografRule.disabled !== true
                    if (checked) {
                        props.typograf.enableRule(id);
                    } else {
                        props.typograf.disableRule(id);
                    }

                    return true;
                }

                return false;
            });
        });
    }

    onChange() {}

    rebuild() {
        const groups = this._getSortedGroups(Typograf.prototype._rules, i18n.getLang());
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

    _getSortedGroups(rules, lang) {
        const filteredRules = [];

        // Правила для live-режима не показываем в настройках
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

    _buildHTML(groups) {
        let html = '';
        const langUI = i18n.getLang();

        groups.forEach(function(group) {
            const
                groupName = group[0]._group,
                groupTitle = typografPrefs.execute(
                    Typograf.getGroupTitle(groupName, langUI),
                    {locale: prepareLocale(langUI)}
                );

            html += '<fieldset class="prefs__fieldset"><legend class="prefs__legend button">' +
                groupTitle +
                '</legend><div class="prefs__group-rules">';

            group.forEach(function(rule) {
                const
                    buf = Typograf.titles[name];

                if (!buf || !(buf[langUI] || buf.common)) {
                    console.warn('Not found title for name "' + name + '".');
                }

                const
                    title = typografPrefs.execute(
                        str.escapeHTML(buf[langUI] || buf.common),
                        {locale: prepareLocale(langUI)}
                    ),
                    id = 'setting-' + name,
                    ch = this._typograf.isEnabledRule(name),
                    checked = ch ? ' checked="checked"' : '';

                html += '<div class="prefs__rule" title="' + name + '">' +
                    '<input type="checkbox" class="prefs__rule-checkbox"' +
                    checked + ' id="' + id + '" data-id="' + name + '" /> ' +
                    '<label for="' + id + '">' + title + langPrefix + '</label>' +
                    '</div>';
            }, this);

            html += '</div></fieldset>';
        }, this);

        return html;
    }
    _clickLegend() {
        $(this)
            .closest('.prefs__fieldset')
            .toggleClass('prefs__fieldset_visible')
            .find('.prefs__group-rules')
            .slideToggle('fast');
    }

    _selectAll(checked) {
        const rules = this.state.rules.map(rule => {
            const result = clone(rule);

            result.checked = checked;

            if (checked) {
                this.props.typograf.enableRule(rule.id);
            } else {
                this.props.typograf.disableRule(rule.id);
            }

            return result;
        });

        this.onChange();
    }

    _getAllChecked() {
        let count = 0;

        const rules = this.state.rules;
        rules.forEach(function() {
            if (el.checked) {
                count++;
            }
        });

        if (count === rules.length) {
            checked = true;
        } else if (!count) {
            checked = false;
        } else {
            checked = undefined;
        }

        return checked;
    }
}
