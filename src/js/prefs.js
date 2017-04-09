var $ = require('../../node_modules/jquery/dist/jquery.slim'),
    localStorage = require('./local-storage'),
    GetText = require('./get-text'),
    getText = GetText.getText,
    prepareLocale = require('./prepare-locale'),
    str = require('./string'),
    Typograf = window.Typograf,
    typografPrefs = new Typograf({
        disableRule: '*',
        enableRule: ['common/nbsp/*', 'ru/nbsp/*']
    });

module.exports = {
    init: function(typograf) {
        this._typograf = typograf;

        var rules;
        try {
            rules = JSON.parse(localStorage.getItem('settings.rules'));
        } catch(e) {}

        this.locale = localStorage.getItem('settings.locale');
        this.langUI = localStorage.getItem('settings.langUI');
        this.mode = localStorage.getItem('settings.mode');

        if(typeof rules === 'object' && Array.isArray(rules.disabled) && Array.isArray(rules.enabled)) {
            this.rules = rules;
        }

        this.locale = this.locale || 'ru';

        this.langUI = this.langUI || 'ru';
        if(this.langUI === 'en') {
            this.langUI = 'en-US';
        }

        this.mode = this.mode || '';

        GetText.setLang(this.langUI);

        this._events();

        this.changeLangUI();

        this._updateSelects();
    },
    show: function() {
        this._build();

        $('.prefs').addClass('prefs_opened');
        $('.paranja').addClass('paranja_opened');

        this._updateSelects();
        this._synchronizeMainCheckbox();
    },
    hide: function() {
        $('.prefs').removeClass('prefs_opened');
        $('.paranja').removeClass('paranja_opened');
    },
    toggle: function() {
        if($('.prefs').is('.prefs_opened')) {
            this.hide();
        } else {
            this.show();
        }
    },
    save: function() {
        var enabled = [],
            disabled = [];

        Object.keys(this._typograf._enabledRules).forEach(function(name) {
            if(this._typograf._enabledRules[name]) {
                enabled.push(name);
            } else {
                disabled.push(name);
            }
        }, this);

        localStorage
            .setItem('settings.rules', JSON.stringify({
                enabled: enabled,
                disabled: disabled
            }))
            .setItem('settings.locale', this.locale)
            .setItem('settings.langUI', this.langUI)
            .setItem('settings.mode', this.mode);
    },
    byDefault: function() {
        var that = this;

        this._getCheckboxes().each(function(i, el) {
            el = $(el);
            var id = el.data('id');

            Typograf.prototype._rules.some(function(rule) {
                if(id === rule.name) {
                    var checked = rule.disabled !== true;
                    el.checked(checked);

                    if(checked) {
                        that._typograf.enableRule(id);
                    } else {
                        that._typograf.disableRule(id);
                    }

                    return true;
                }

                return false;
            }, this);
        });

        $('.prefs__all-rules').checked(undefined);

        this.save();
    },
    changeLocale: function() {
        this.locale = $('.prefs__set-locale').val();
        this.save();

        this.onChange();
    },
    changeLangUI: function() {
        this.langUI = $('.prefs__set-lang-ui').val();
        GetText.setLang(this.langUI);

        this._updateLocaleOptions();

        $('[data-text-id]').each(function(i, el) {
            el.innerHTML = getText(el.dataset.textId);
        });

        $('[data-value-id]').each(function(i, el) {
            el.value = getText(el.dataset.valueId);
        });

        $('[data-title-id]').each(function(i, el) {
            el.title = getText(el.dataset.titleId);
        });

        $('[data-placeholder-id]').each(function(i, el) {
            el.placeholder = getText(el.dataset.placeholderId);
        });

        this._build();
        this.save();

        this.onChange();
    },
    changeMode: function() {
        this.mode = $('.prefs__set-mode').val();
        this.save();

        this.onChange();
    },
    onChange: function() {},
    _build: function() {
        var groups = this._getSortedGroups(Typograf.prototype._rules, this.langUI);

        $('.prefs__rules').html(this._buildHTML(groups));
    },
    _sortByGroupIndex: function(rules) {
        rules.sort(function(a, b) {
            if(!a.name || !b.name) {
                return -1;
            }

            var indexA = Typograf.getGroupIndex(a._group),
                indexB = Typograf.getGroupIndex(b._group);

            if(indexA > indexB) {
                return 1;
            } else if(indexA === indexB) {
                return 0;
            } else {
                return -1;
            }
        });
    },
    _splitGroups: function(rules) {
        var currentGroupName,
            currentGroup,
            groups = [];

        rules.forEach(function(rule, i) {
            var groupName = rule._group;

            if(groupName !== currentGroupName) {
                currentGroupName = groupName;
                currentGroup = [];
                groups.push(currentGroup);
            }

            currentGroup.push(rule);
        }, this);

        return groups;
    },
    _sortGroupsByTitle: function(groups, lang) {
        var titles = Typograf.titles;

        groups.forEach(function(group) {
            group.sort(function(a, b) {
                var titleA = titles[a.name],
                  titleB = titles[b.name];

                return (titleA[lang] || titleA.common) > (titleB[lang] || titleB.common) ? 1 : -1;
            });
        });
    },
    _getSortedGroups: function(rules, lang) {
        var filteredRules = [];

        // Правила для live-режима не показываем в настройках
        rules.forEach(function(el) {
            if(!el.live) {
                filteredRules.push(el);
            }
        });

        this._sortByGroupIndex(filteredRules);

        var groups = this._splitGroups(filteredRules);

        this._sortGroupsByTitle(groups, lang);

        return groups;
    },
    _buildHTML: function(groups) {
        var html = '';

        groups.forEach(function(group) {
            var groupName = group[0]._group,
                groupTitle = typografPrefs.execute(
                    Typograf.getGroupTitle(groupName, this.langUI),
                    {locale: prepareLocale(this.langUI)}
                );

            html += '<fieldset class="prefs__fieldset"><legend class="prefs__legend">' + groupTitle + '</legend>';

            group.forEach(function(rule) {
                var name = rule.name,
                    buf = Typograf.titles[name];

                if(!buf || !(buf[this.langUI] || buf.common)) {
                    console.warn('Not found title for name "' + name + '".');
                }

                var title = typografPrefs.execute(
                        str.escapeHTML(buf[this.langUI] || buf.common),
                        {locale: prepareLocale(this.langUI)}
                    ),
                    id = 'setting-' + name,
                    ch = this._typograf.isEnabledRule(name),
                    checked = ch ? ' checked="checked"' : '';

                html += '<div class="prefs__rule" title="' + name + '">' +
                    '<input type="checkbox" class="prefs__rule-checkbox"' +
                    checked + ' id="' + id + '" data-id="' + name + '" /> ' +
                    '<label for="' + id + '">' + title + '</label>' +
                    '</div>';
            }, this);

            html += '</fieldset>';
        }, this);

        return html;
    },
    _getCheckboxes: function() {
        return $('.prefs__rule-checkbox');
    },
    _clickRule: function(e) {
        var that = this;

        this._getCheckboxes().each(function(i, el) {
            el = $(el);
            var id = el.data('id');

            if(el.checked()) {
                that._typograf.enableRule(id);
            } else {
                that._typograf.disableRule(id);
            }
        });

        this._synchronizeMainCheckbox();
        this.save();
    },
    _clickLegend: function(e) {
        $(this)
            .closest('.prefs__fieldset')
            .toggleClass('prefs__fieldset_visible');
    },
    _selectAll: function() {
        var that = this,
            checked = $('.prefs__all-rules').checked(),
            els = this._getCheckboxes();

        $.each(els, function(i, el) {
            el = $(el);
            var id = el.data('id');

            el.checked(checked);
            if(checked) {
                that._typograf.enableRule(id);
            } else {
                that._typograf.disableRule(id);
            }
        });

        this.save();
    },
    _synchronizeMainCheckbox: function() {
        var count = 0,
          els = this._getCheckboxes(),
          checked;

        els.each(function(i, el) {
            if(el.checked) {
                count++;
            }
        });

        if(count === els.length) {
            checked = true;
        } else if(!count) {
            checked = false;
        } else {
            checked = undefined;
        }

        $('.prefs__all-rules').checked(checked);
    },
    _updateSelects: function() {
        $('.prefs__set-locale').val(this.locale);
        $('.prefs__set-lang-ui').val(this.langUI);
        $('.prefs__set-mode').val(this.mode);
    },
    _updateLocaleOptions: function() {
        var html = Typograf.getLocales()
            .sort(function(a, b) {
                return getText('locale-' + a) > getText('locale-' + b);
            })
            .map(function(l) {
                return '<option value="' + l + '" data-text-id="locale-' + l + '"></option>\n';
            }).join('');

        $('.prefs__set-locale').html(html);
    },
    _events: function() {
        $('.prefs__set-lang-ui').on('change', this.changeLangUI.bind(this));

        $('.prefs__set-locale').on('change', this.changeLocale.bind(this));

        $('.prefs__set-mode').on('change', this.changeMode.bind(this));

        $('.prefs__all-rules').on('click', this._selectAll.bind(this));

        $('.prefs__default').on('click', this.byDefault.bind(this));

        var rules = $('.prefs__rules');

        rules.on('click', '.prefs__legend', this._clickLegend);

        rules.on('click', '.prefs__rule-checkbox', this._clickRule.bind(this));
    }
};
