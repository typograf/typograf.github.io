var str = require('./lib/string');
var localStorage = require('./lib/local-storage');

var i18n = require('./i18n');
var prepareLocale = require('./prepare-locale');
var Typograf = window.Typograf;
var typografPrefs = new Typograf({
    disableRule: '*',
    enableRule: ['common/nbsp/*', 'ru/nbsp/*']
});
var typografEntities = new Typograf({
    disableRule: '*',
    enableRule: ['common/nbsp/*', 'common/punctuation/quote'],
    locale: ['ru', 'en-US']
});

module.exports = {
    init: function(typograf) {
        this._typograf = typograf;
        this._wasRebuilt = false;

        var rules;
        try {
            rules = JSON.parse(localStorage.getItem('settings.rules'));
        } catch(e) {}

        this.locale = localStorage.getItem('settings.locale');
        this.mode = localStorage.getItem('settings.mode');
        this.onlyInvisible = localStorage.getItem('settings.onlyInvisible');

        if (rules && Array.isArray(rules.disabled) && Array.isArray(rules.enabled)) {
            this.rules = rules;
        }

        this.locale = this.locale || 'ru';

        this.mode = this.mode || '';
        this.onlyInvisible = this.onlyInvisible || false;

        this._events();

        this.changeLangUI();
        this._updateSelects();
    },
    show: function() {
        if (!this._wasRebuilt) {
            this.rebuild();
            this._wasRebuilt = true;
        }

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
        if ($('.prefs').is('.prefs_opened')) {
            this.hide();
        } else {
            this.show();
        }
    },
    save: function() {
        var enabled = [],
            disabled = [];

        Object.keys(this._typograf._enabledRules).forEach(function(name) {
            if (this._typograf._enabledRules[name]) {
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
            .setItem('settings.mode', this.mode)
            .setItem('settings.onlyInvisible', this.onlyInvisible);
    },
    byDefault: function() {
        var that = this;

        this._getCheckboxes().each(function(i, el) {
            el = $(el);
            var id = el.data('id');

            Typograf.prototype._rules.some(function(rule) {
                if (id === rule.name) {
                    var checked = rule.disabled !== true;
                    el.checked(checked);

                    if (checked) {
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

        $('.prefs__set-mode').val('');
        $('.prefs__only-invisible').checked(false);

        this.changeMode();

        this.save();
        this.onChange();
    },
    changeLocale: function() {
        this.locale = $('.prefs__set-locale').val();
        this.save();

        this.onChange();
    },
    changeLangUI: function(e, value) {
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
    },
    changeMode: function() {
        this.mode = $('.prefs__set-mode').val();
        this.onlyInvisible = $('.prefs__only-invisible').checked();
        this.save();
        this.updateInvisibleSymbols();
        this.onChange();
    },
    updateInvisibleSymbols: function() {
        var html = typografEntities.execute(i18n('html-entities-example'), {
            htmlEntity: {
                type: this.mode,
                onlyInvisible: this.onlyInvisible
            }
        });

        html = str
            .escapeHTML(html)
            .replace(/(&amp;#?[\da-z_-]+;)/gi, '<span style="color: green;">$1</span>');

        $('.prefs__html-entities-example').html(html);
    },
    onChange: function() {},
    rebuild: function() {
        var groups = this._getSortedGroups(Typograf.prototype._rules, i18n.lang);

        $('.prefs__rules').html(this._buildHTML(groups));
    },
    _sortByGroupIndex: function(rules) {
        rules.sort(function(a, b) {
            if (!a.name || !b.name) {
                return -1;
            }

            var indexA = Typograf.getGroupIndex(a._group),
                indexB = Typograf.getGroupIndex(b._group);

            if (indexA > indexB) {
                return 1;
            } else if (indexA === indexB) {
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

            if (groupName !== currentGroupName) {
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
            if (!el.live) {
                filteredRules.push(el);
            }
        });

        this._sortByGroupIndex(filteredRules);

        var groups = this._splitGroups(filteredRules);

        this._sortGroupsByTitle(groups, lang);

        return groups;
    },
    _buildHTML: function(groups) {
        var html = '',
            langUI = i18n.lang;

        groups.forEach(function(group) {
            var groupName = group[0]._group,
                groupTitle = typografPrefs.execute(
                    Typograf.getGroupTitle(groupName, langUI),
                    {locale: prepareLocale(langUI)}
                );

            html += '<fieldset class="prefs__fieldset"><legend class="prefs__legend button">' +
                groupTitle +
                '</legend><div class="prefs__group-rules">';

            group.forEach(function(rule) {
                var name = rule.name,
                    ruleLang = name.split('\/')[0],
                    langPrefix = ruleLang === 'common' ? '' : '<span class="prefs__rule-lang">' + ruleLang + '</span>',
                    buf = Typograf.titles[name];

                if (!buf || !(buf[langUI] || buf.common)) {
                    console.warn('Not found title for name "' + name + '".');
                }

                var title = typografPrefs.execute(
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
    },
    _getCheckboxes: function() {
        return $('.prefs__rule-checkbox');
    },
    _clickRule: function(e) {
        var that = this;

        this._getCheckboxes().each(function(i, el) {
            el = $(el);
            var id = el.data('id');

            if (el.checked()) {
                that._typograf.enableRule(id);
            } else {
                that._typograf.disableRule(id);
            }
        });

        this._synchronizeMainCheckbox();
        this.save();

        this.onChange();
    },
    _clickLegend: function(e) {
        $(this)
            .closest('.prefs__fieldset')
            .toggleClass('prefs__fieldset_visible')
            .find('.prefs__group-rules')
            .slideToggle('fast');
    },
    _selectAll: function() {
        var that = this,
            checked = $('.prefs__all-rules').checked(),
            els = this._getCheckboxes();

        $.each(els, function(i, el) {
            el = $(el);
            var id = el.data('id');

            el.checked(checked);
            if (checked) {
                that._typograf.enableRule(id);
            } else {
                that._typograf.disableRule(id);
            }
        });

        this.save();

        this.onChange();
    },
    _synchronizeMainCheckbox: function() {
        var count = 0,
          els = this._getCheckboxes(),
          checked;

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
    },
    _updateSelects: function() {
        $('.prefs__set-locale').val(this.locale);
        $('.prefs__set-mode').val(this.mode);
        $('.prefs__only-invisible').val(this.onlyInvisible);
        this.updateInvisibleSymbols();
    },
    _updateLocaleOptions: function() {
        var html = Typograf.getLocales()
            .sort(function(a, b) {
                return i18n('locale-' + a) > i18n('locale-' + b);
            })
            .map(function(l) {
                return '<option value="' + l + '" data-text-id="locale-' + l + '"></option>\n';
            }).join('');

        $('.prefs__set-locale')
            .html(html)
            .val(this.locale);
    },
    _events: function() {
        $('.prefs__set-locale').on('change', this.changeLocale.bind(this));

        $('.prefs__set-mode, .prefs__only-invisible').on('change', this.changeMode.bind(this));

        $('.prefs__all-rules').on('click', this._selectAll.bind(this));

        $('.prefs__default').on('click', this.byDefault.bind(this));

        $('.prefs__close').on('click', this.hide.bind(this));

        var rules = $('.prefs__rules');

        rules.on('click', '.prefs__legend', this._clickLegend);

        rules.on('click', '.prefs__rule-checkbox', this._clickRule.bind(this));
    }
};
