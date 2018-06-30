/** @jsx h */

/* eslint-disable */

import { h, Component } from 'preact';

import i18n from '../i18n';
import str from '../lib/string';
import storage from '../storage/storage';
import {default as Typograf, prepareLocale} from '../typograf/typograf';

import './prefs.less';
import '../button/button.less';

const
    typografPrefs = new Typograf({
        disableRule: '*',
        enableRule: ['common/nbsp/*', 'ru/nbsp/*']
    }),
    typografEntities = new Typograf({
        disableRule: '*',
        enableRule: ['common/nbsp/*', 'common/punctuation/quote'],
        locale: ['ru', 'en-US']
    });

export default class Prefs {
    constructor(typograf) {
        this._typograf = typograf;
        this._wasRebuilt = false;

        let rules;
        try {
            rules = JSON.parse(storage.get('rules'));
        } catch (e) {
            console.log(e);
        }

        this.locale = storage.get('locale');
        this.mode = storage.get('mode');
        this.onlyInvisible = storage.get('onlyInvisible');

        if (rules && Array.isArray(rules.disabled) && Array.isArray(rules.enabled)) {
            this.rules = rules;
        }

        this.locale = this.locale || 'ru';

        this.mode = this.mode || '';
        this.onlyInvisible = this.onlyInvisible || false;

        this._events();

        this.changeLangUI();
        this._updateSelects();
    }

    show() {
        if (!this._wasRebuilt) {
            this.rebuild();
            this._wasRebuilt = true;
        }

        $('.prefs').addClass('prefs_opened');
        $('.paranja').addClass('paranja_opened');

        this._updateSelects();
        this._synchronizeMainCheckbox();
    }

    hide() {
        $('.prefs').removeClass('prefs_opened');
        $('.paranja').removeClass('paranja_opened');
    }

    toggle() {
        if ($('.prefs').is('.prefs_opened')) {
            this.hide();
        } else {
            this.show();
        }
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
        this._getCheckboxes().each((i, el) => {
            el = $(el);
            const id = el.data('id');

            Typograf.prototype._rules.some(rule => {
                if (id === rule.name) {
                    const checked = rule.disabled !== true;
                    el.checked(checked);

                    if (checked) {
                        this._typograf.enableRule(id);
                    } else {
                        this._typograf.disableRule(id);
                    }

                    return true;
                }

                return false;
            });
        });

        $('.prefs__all-rules').checked(undefined);

        $('.prefs__set-mode').val('');
        $('.prefs__only-invisible').checked(false);

        this.changeMode();

        this.save();
        this.onChange();
    }

    changeLocale() {
        this.locale = $('.prefs__set-locale').val();
        this.save();

        this.onChange();
    }

    changeLangUI() {
        this._updateLocaleOptions();

        $('[data-text-id]').each(function(i, el) {
            el.innerHTML = i18n(el.dataset.textId);
        });

        $('[data-value-id]').each(function(i, el) {
            el.value = i18n(el.dataset.valueId);
        });

        $('[data-title-id]').each(function(i, el) {
            el.title = i18n(el.dataset.titleId);
        });

        $('[data-placeholder-id]').each(function(i, el) {
            el.placeholder = i18n(el.dataset.placeholderId);
        });

        this.rebuild();
        this.save();

        this.onChange();
    }

    changeMode() {
        this.mode = $('.prefs__set-mode').val();
        this.onlyInvisible = $('.prefs__only-invisible').checked();
        this.save();
        this.updateInvisibleSymbols();
        this.onChange();
    }

    updateInvisibleSymbols() {
        let html = typografEntities.execute(i18n('html-entities-example'), {
            htmlEntity: {
                type: this.mode,
                onlyInvisible: this.onlyInvisible
            }
        });

        html = str
            .escapeHTML(html)
            .replace(/(&amp;#?[\da-z_-]+;)/gi, '<span style="color: green;">$1</span>');

        $('.prefs__html-entities-example').html(html);
        $('.prefs__invisible-symbols-container')[this.mode ? 'show' : 'hide']();
    }

    onChange() {}

    rebuild() {
        const groups = this._getSortedGroups(Typograf.prototype._rules, i18n.getLang());

        $('.prefs__rules').html(this._buildHTML(groups));
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
                    name = rule.name,
                    ruleLang = name.split('/')[0],
                    langPrefix = ruleLang === 'common' ? '' : '<span class="prefs__rule-lang">' + ruleLang + '</span>',
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

    _getCheckboxes() {
        return $('.prefs__rule-checkbox');
    }

    _clickRule() {
        this._getCheckboxes().each((i, el) => {
            el = $(el);
            const id = el.data('id');

            if (el.checked()) {
                this._typograf.enableRule(id);
            } else {
                this._typograf.disableRule(id);
            }
        });

        this._synchronizeMainCheckbox();
        this.save();

        this.onChange();
    }

    _clickLegend() {
        $(this)
            .closest('.prefs__fieldset')
            .toggleClass('prefs__fieldset_visible')
            .find('.prefs__group-rules')
            .slideToggle('fast');
    }

    _selectAll() {
        const
            checked = $('.prefs__all-rules').checked(),
            els = this._getCheckboxes();

        $.each(els, (i, el) => {
            el = $(el);
            const id = el.data('id');

            el.checked(checked);
            if (checked) {
                this._typograf.enableRule(id);
            } else {
                this._typograf.disableRule(id);
            }
        });

        this.save();

        this.onChange();
    }

    _synchronizeMainCheckbox() {
        let
            count = 0,
            checked;

        const els = this._getCheckboxes();
        els.each(function(i, el) {
            if (el.checked) {
                count++;
            }
        });

        if (count === els.length) {
            checked = true;
        } else if (!count) {
            checked = false;
        } else {
            checked = undefined;
        }

        $('.prefs__all-rules').checked(checked);
    }

    _updateSelects() {
        $('.prefs__set-locale').val(this.locale);
        $('.prefs__set-mode').val(this.mode);
        $('.prefs__only-invisible').val(this.onlyInvisible);

        this.updateInvisibleSymbols();
    }

    _updateLocaleOptions() {
        const html = Typograf.getLocales()
            .sort(function(a, b) {
                return i18n('locale-' + a) > i18n('locale-' + b) ? 1 : -1;
            })
            .map(function(l) {
                return '<option value="' + l + '" data-text-id="locale-' + l + '"></option>\n';
            }).join('');

        $('.prefs__set-locale')
            .html(html)
            .val(this.locale);
    }

    _events() {
        $('.prefs__set-locale').on('change', this.changeLocale.bind(this));

        $('.prefs__set-mode, .prefs__only-invisible').on('change', this.changeMode.bind(this));

        $('.prefs__all-rules').on('click', this._selectAll.bind(this));

        $('.prefs__default').on('click', this.byDefault.bind(this));

        $('.prefs__close').on('click', this.hide.bind(this));

        var rules = $('.prefs__rules');

        rules.on('click', '.prefs__legend', this._clickLegend);

        rules.on('click', '.prefs__rule-checkbox', this._clickRule.bind(this));
    }
}
