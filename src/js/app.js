var $ = require('../../node_modules/jquery/dist/jquery.slim'),
    str = require('./string'),
    JsDiff = require('diff/dist/diff.min'),
    texts = require('./texts'),
    hash = require('./hash'),
    saveText = require('./save-text'),
    entityHighlight = require('./entity-highlight');

require('./jquery.checked');
require('./metrika');
require('./function');
require('./typograf-groups');

var typograf = new Typograf(),
    typografPrefs = new Typograf({
        mode: 'digit',
        disable: '*',
        enable: ['common/nbsp/*', 'ru/nbsp/*']
    });

var App = {
    last: {
        value: '',
        result: ''
    },
    getText: function(id, lang) {
        return texts[id][lang ? lang : this.prefs.langUI];
    },
    isMobile: false,
    init: function() {
        var body = $(document.body);
        body.removeClass('transition_no');

        this.isMobile = body.hasClass('page_is-mobile');

        if(window.location.hash === '#!prefs') {
            setTimeout(function() {
                this._onprefs();
            }.bind(this), 1);
        }

        if(!this.isMobile) {
            this._setValue(hash.getHashParam('text') || '');
        }

        this.loadFromLocalStorage();

        this.prefs.changeLangUI();

        this._events();

        this.prefs._events();

        this.execute();

        this.setVersion();
    },
    setVersion: function() {
        $('#version').html(Typograf.version);
    },
    loadFromLocalStorage: function() {
        var rules;
        try {
            rules = JSON.parse(localStorage.getItem('settings.rules'));
            this.prefs.lang = localStorage.getItem('settings.lang');
            this.prefs.langUI = localStorage.getItem('settings.langUI');
            this.prefs.mode = localStorage.getItem('settings.mode');
        } catch(e) {}

        if(rules && typeof rules === 'object' && Array.isArray(rules.disabled) && Array.isArray(rules.enabled)) {
            typograf
                .enable(rules.enabled)
                .disable(rules.disabled);
        }

        this.prefs.lang = this.prefs.lang || 'ru';
        this.prefs.langUI = this.prefs.langUI || 'ru';
        this.prefs.mode = this.prefs.mode || '';

        this.prefs.updateSelects();
    },
    copyText: function(textarea) {
        try {
            textarea[0].select();
            document.execCommand('copy');
        } catch(e) {
            window.alert(this.getText('notSupportCopy'));
        }
    },
    execute: function() {
        var value = this._getValue(),
            result = typograf.execute(value, {
                lang: this.prefs.lang,
                mode: this.prefs.mode
            });

        this.last = {
            value: value,
            result: result
        };

        if(this.isMobile) {
            $('.input__text').val(result);
        } else {
            this.updateResult();
        }
    },
    updateResult: function() {
        var value = this.last.value,
            result = this.last.result,
            resText = $('.result__text'),
            resHTML = $('.result__html'),
            resDiff = $('.result__diff');

        resText.is(':visible') && resText.val(result);
        resHTML.is(':visible') && resHTML.html(entityHighlight(result));
        resDiff.is(':visible') && resDiff.html(this.diff(value, result));
    },
    getDiffTitle: function(sym) {
        var title = '';
        if(sym === '\u00A0') {
            title = 'NO-BREAK SPACE';
        } else if(sym === '\u202F') {
            title = 'NARROW NO-BREAK SPACE';
        } else if(sym === '\u2011') {
            title = 'NON-BREAKING HYPHEN';
        }

        return title;
    },
    diff: function(o, n) {
        var diff = JsDiff.diffChars(o, n),
            html = '';

        diff.forEach(function(part){
            var val = str.escapeHTML(part.value),
                title = this.getDiffTitle(part.value);

            if(part.added) {
                html += '<ins class="diff" title="' + title + '">' + val + '</ins>';
            } else if(part.removed) {
                html += '<del class="diff" title="' + title + '">' + val + '</del>';
            } else {
                html += val;
            }
        }, this);

        return html;
    },
    prefs: {
        show: function() {
            this._build();

            $('.prefs').addClass('prefs_opened');
            $('.paranja').addClass('paranja_opened');

            this.updateSelects();
            this._synchronizeMainCheckbox();
        },
        updateSelects: function() {
            $('.prefs__set-lang').val(this.lang);
            $('.prefs__set-lang-ui').val(this.langUI);
            $('.prefs__set-mode').val(this.mode);
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
        saveToLocalStorage: function() {
            var enabled = [],
                disabled = [];

            Object.keys(typograf._enabledRules).forEach(function(name) {
                if(typograf._enabledRules[name]) {
                    enabled.push(name);
                } else {
                    disabled.push(name);
                }
            });

            try {
                localStorage.setItem('settings.rules', JSON.stringify({
                    enabled: enabled,
                    disabled: disabled
                }));

                localStorage.setItem('settings.lang', this.lang);
                localStorage.setItem('settings.langUI', this.langUI);
                localStorage.setItem('settings.mode', this.mode);
            } catch(e) {}
        },
        byDefault: function() {
            this._getCheckboxes().each(function(i, el) {
                el = $(el);
                var id = el.data('id');

                Typograf.prototype._rules.some(function(rule) {
                    if(id === rule.name) {
                        var checked = rule.disabled !== true;
                        el.checked(checked);

                        if(checked) {
                            typograf.enable(id);
                        } else {
                            typograf.disable(id);
                        }

                        return true;
                    }

                    return false;
                });
            });

            $('.prefs__all-rules').checked(undefined);

            this.saveToLocalStorage();
        },
        changeLang: function() {
            this.lang = $('.prefs__set-lang').val();
            this.saveToLocalStorage();

            App.execute();
        },
        changeLangUI: function() {
            this.langUI = $('.prefs__set-lang-ui').val();

            $('[data-text-id]').each(function(i, el) {
                el.innerHTML = App.getText(el.dataset.textId);
            });

            $('[data-value-id]').each(function(i, el) {
                el.value = App.getText(el.dataset.valueId);
            });

            $('[data-title-id]').each(function(i, el) {
                el.title = App.getText(el.dataset.titleId);
            });

            this._build();
            this.saveToLocalStorage();
        },
        changeMode: function() {
            this.mode = $('.prefs__set-mode').val();
            this.saveToLocalStorage();

            App.execute();
        },
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
                        {lang: this.langUI}
                    );

                html += '<fieldset class="prefs__fieldset"><legend class="prefs__legend">' + groupTitle + '</legend>';

                group.forEach(function(rule) {
                    var name = rule.name,
                        buf = Typograf.titles[name],
                        title = typografPrefs.execute(str.escapeHTML(buf[this.langUI] || buf.common)),
                        id = 'setting-' + name,
                        ch = typograf.enabled(name),
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
            this._getCheckboxes().each(function(i, el) {
                el = $(el);
                var id = el.data('id');

                if(el.checked()) {
                    typograf.enable(id);
                } else {
                    typograf.disable(id);
                }
            });

            this._synchronizeMainCheckbox();
            this.saveToLocalStorage();
        },
        _clickLegend: function(e) {
            $(this)
                .closest('.prefs__fieldset')
                .toggleClass('prefs__fieldset_visible');
        },
        _selectAll: function() {
            var checked = $('.prefs__all-rules').checked(),
                els = this._getCheckboxes();

            $.each(els, function(i, el) {
                el = $(el);
                var id = el.data('id');

                el.checked(checked);
                if(checked) {
                    typograf.enable(id);
                } else {
                    typograf.disable(id);
                }
            });

            this.saveToLocalStorage();
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
        _events: function() {

            $('.prefs__set-lang-ui').on('change', this.changeLangUI.bind(this));

            $('.prefs__set-lang').on('change', this.changeLang.bind(this));

            $('.prefs__set-mode').on('change', this.changeMode.bind(this));

            $('.prefs__all-rules').on('click', this._selectAll.bind(this));

            $('.prefs__default').on('click', this.byDefault.bind(this));

            var rules = $('.prefs__rules');

            rules.on('click', '.prefs__legend', this._clickLegend);

            rules.on('click', '.prefs__rule-checkbox', this._clickRule.bind(this));
        }
    },
    _setValue: function(value) {
        $('.input__text').val(value);

        this._updateValue(value);
    },
    _getValue: function() {
        return $('.input__text').val();
    },
    _updateValue: function(value) {
        if(!this.isMobile && window.location.hash !== '#!prefs') {
            window.location.hash = '#!text=' + window.encodeURIComponent(str.truncate(value, 512));
        }

        this._updateClearText(value);
    },
    _updateClearText: function(value) {
        var clear = $('.input__clear');
        if(value.length > 0) {
            clear.show();
        } else {
            clear.hide();
        }
    },
    _events: function() {
        $(window).on('message', function(e) {
            var data;
            try {
                data = JSON.parse(e.data);
            } catch(e) {
                return;
            }

            if(data && data.service === 'typograf' && data.command === 'execute') {
                e.source.postMessage(JSON.stringify({
                    service: 'typograf',
                    command: 'return',
                    text: typograf.execute(data.text, {
                        lang: this.prefs.lang,
                        mode: this.prefs.mode
                    })
                }), '*');
            }
        }.bind(this));

        this._onprefs = function() {
            var el = $('.hamburger'),
                clSelected = 'hamburger_selected';

            if(el.hasClass(clSelected)) {
                window.location.hash = '#';
                setTimeout(function() {
                    App.execute();
                }, 0);
            } else {
                window.location.hash = '#!prefs';
            }

            el.toggleClass(clSelected);
            this.prefs.toggle();
        }.bind(this);

        $('.hamburger, .paranja').on('click', this._onprefs);

        var that = this;
        $('.result__as-text, .result__as-html, .result__as-diff').on('click', function() {
            $('.result__text').hide().val('');
            $('.result__html, .result__diff').hide().html('');

            $('.result__' + this.value).show();
            that.updateResult();
        });

        $('.input__copy').on('click', function() {
            $('.result__as-text').click();

            this.copyText($('.result__text'));
        }.bind(this));

        $('.input__save').on('click', function() {
            saveText($('.result__text')[0], this.getText('notSupportSave'));
        }.bind(this));

        $('.input__clear').on('click', function() {
            this._setValue('');

            $('.input__text').focus();

            this.execute();
        }.bind(this));

        var oldValue = null;

        if(this.isMobile) {
            $('.input__execute').on('click', this.execute.bind(this));
        } else {
            $('.input__text').on('keyup input click', function() {
                var val = this._getValue();
                if(val === oldValue) {
                    return;
                }

                oldValue = val;

                this._updateValue(val);

                this.execute();
            }.bind(this));
        }
    }
};

$(document).ready(App.init.bind(App));
