var str = require('./string'),
    $ = require('./dom'),
    texts = require('./texts'),
    hash = require('./hash');

require('./metrika');
require('./function');

function getGroupName(str) {
    return str.split('/')[1];
}

function getGroupIndexByRuleName(ruleName) {
    var groupName = getGroupName(ruleName);

    return Typograf.groupsByName[groupName].index;
}

function getGroupTitle(name, lang) {
    return Typograf.groupsByName[name].title[lang];
}

function getRuleLang(str) {
    return str.split('/')[0];
}

var typograf = new Typograf(),
    typografPrefs = new Typograf({
        mode: 'digit',
        disable: '*',
        enable: ['common/nbsp/*', 'ru/nbsp/*']
    });

var App = {
    getText: function(id, lang) {
        return this._texts[id][lang ? lang : this.prefs.langUI];
    },
    isMobile: false,
    init: function() {
        this.isMobile = $.hasClass(document.body, 'page_is-mobile');

        if(window.location.hash === '#!prefs') {
            setTimeout(function() {
                this._onprefs();
            }.bind(this), 1);
        }

        if(!this.isMobile) {
            this._setValue(hash.getHashParam('text') || '');
        }

        this.loadFromLocalStorage();

        Typograf.groupsByName = {};
        Typograf.groups.forEach(function(group, i) {
            group.index = i;
            Typograf.groupsByName[group.name] = group;
        });

        this.prefs.changeLangUI();

        this._events();

        this.prefs._events();

        this.execute();
        
        this.setVersion();
    },
    setVersion: function() {
        var version = (Typograf.version || '4.0.0').split('.');
        $('#version').innerHTML = version[0] + '.' + version[1];
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
            this.fixLegasyRules(rules.enabled);
            this.fixLegasyRules(rules.disabled);

            typograf
                .enable(rules.enabled)
                .disable(rules.disabled);
        }

        this.prefs.lang = this.prefs.lang || 'ru';
        this.prefs.langUI = this.prefs.langUI || 'ru';
        this.prefs.mode = this.prefs.mode || '';
    },
    fixLegasyRules: function(rules) {
        var oldRules = {
            'common/sym/copy': 'common/symbols/copy',
            'common/sym/cf': 'common/symbols/cf',
            'common/sym/arrows': 'common/symbols/arrows',
            'ru/punctuation/quot': 'ru/punctuation/quote',
            'en/punctuation/quot': 'en/punctuation/quote',
            'ru/optalign/quot': 'ru/optalign/quote',
            'ru/nbsp/xxxx': 'ru/nbsp/year',
            'common/nbsp/afterPara': 'common/nbsp/afterParagraph',
            'ru/date/main': 'ru/date/fromISO',
            'ru/nbsp/cc': 'ru/nbsp/centuries',
            'common/punctuation/exclamation': 'ru/punctuation/exclamation',
            'common/punctuation/exclamationQuestion': 'ru/punctuation/exclamationQuestion'
        };
        
        Array.isArray(rules) && rules.forEach(function(rule, i) {
            if (oldRules[rule]) {
                rules[i] = oldRules[rule];
            }
        });
    },
    copyText: function(textarea) {
        try {
            textarea.select();
            document.execCommand('copy');
        } catch(e) {
            window.alert(this.getText('notSupportCopy'));
        }
    },
    saveText: function(textarea) {
        if(!window.Blob) {
            alert(this.getText(notSupportSave));
            return;
        }

        var textToWrite = textarea.value,
            textFileAsBlob = new Blob([textToWrite], {type:'text/plain'}),
            fileNameToSaveAs = 'text.txt',
            downloadLink = document.createElement('a');

        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = 'Download File';

        if(window.webkitURL != null) {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        } else {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = function() {
                document.body.removeChild(downloadLink);
            };
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
        }

        downloadLink.click();
    },
    execute: function() {
        var res = typograf.execute(this._getValue(), {
            lang: this.prefs.lang,
            mode: this.prefs.mode
        });

        if(this.isMobile) {
            $('.input__text').value = res;
        } else {
            $('.result__html').innerHTML = res.replace(/(\u00A0|&nbsp;|&#160;)/g, '<span class="nbsp">\u00A0</span>');
            $('.result__text').value = res;
        }
    },
    prefs: {
        show: function() {
            this._build();

            $.show('.prefs');
            $.hide('.input');

            $('.prefs__set-lang').value = this.lang;
            $('.prefs__set-lang-ui').value = this.langUI;
            $('.prefs__set-mode').value = this.mode;

            this._synchronizeMainCheckbox();
        },
        hide: function() {
            $.hide('.prefs');
            $.show('.input');
        },
        toggle: function() {
            if($.isVisible('.prefs')) {
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
            var els = this._getCheckboxes(),
                setCheckbox = function(rule) {
                    if(id === rule.name) {
                        var checked = rule.enabled === false || rule.disabled === true;
                        checked = !checked;
                        els[i].checked = checked;

                        if(checked) {
                            typograf.enable(id);
                        } else {
                            typograf.disable(id);
                        }

                        return true;
                    }

                    return false;
                };
            for(var i = 0; i < els.length; i++) {
                var id = els[i].dataset['id'];
                Typograf.prototype._rules.some(setCheckbox);
            }

            $('.prefs__all-rules').checked = false;
            $('.prefs__set-mode').value = '';

            this.saveToLocalStorage();
        },
        changeLang: function() {
            this.lang = $('.prefs__set-lang').value;
            this._build();
            this.saveToLocalStorage();
        },
        changeLangUI: function() {
            this.langUI = $('.prefs__set-lang-ui').value;

            var els = document.querySelectorAll('[data-text-id]'),
                item, i;

            for(i = 0; i < els.length; i++) {
                item = els[i];
                item.innerHTML = App.getText(item.dataset.textId);
            }

            els = document.querySelectorAll('[data-value-id]');
            for(i = 0; i < els.length; i++) {
                item = els[i];
                item.value = App.getText(item.dataset.valueId);
            }

            els = document.querySelectorAll('[data-title-id]');
            for(i = 0; i < els.length; i++) {
                item = els[i];
                item.title = App.getText(item.dataset.titleId);
            }

            this._build();
        },
        changeMode: function() {
            this.mode = $('.prefs__set-mode').value;
            this._build();
            this.saveToLocalStorage();
        },
        _build: function() {
            var rules = Typograf.prototype._rules,
                buf = [];

            rules.forEach(function(el) {
                if(!el.live) {
                    buf.push(el);
                }
            });

            buf.sort(function(a, b) {
                return a.title > b.title ? 1 : -1;
            });

            buf.sort(function(a, b) {
                if(!a.name || !b.name) {
                    return -1;
                }

                var indexA = getGroupIndexByRuleName(a.name),
                    indexB = getGroupIndexByRuleName(b.name);

                if(indexA > indexB) {
                    return 1;
                } else if(indexA === indexB) {
                    return 0;
                } else {
                    return -1;
                }
            });

            var currentGroupName,
                currentGroup,
                groups = [];
            buf.forEach(function(rule, i) {
                var groupName = getGroupName(rule.name),
                    ruleLang = getRuleLang(rule.name);

                if(ruleLang !== this.lang && ruleLang !== 'common') {
                    return;
                }

                if(groupName !== currentGroupName) {
                    currentGroupName = groupName;
                    currentGroup = [];
                    groups.push(currentGroup);
                }

                currentGroup.push(rule);
            }, this);

            var html = '';

            groups.forEach(function(group) {
                var groupName = getGroupName(group[0].name),
                    groupTitle = typografPrefs.execute(
                        getGroupTitle(groupName, this.langUI),
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

                    html += '<div class="prefs__rule">' +
                        '<input type="checkbox"' + checked + ' id="' + id + '" data-id="' + name + '" /> ' +
                        '<label for="' + id + '">' + title + '</label>' +
                        '</div>';
                }, this);

                html += '</fieldset>';
            }, this);

            $('.prefs__rules').innerHTML = html;
        },
        _getCheckboxes: function() {
            return $('.prefs__rules').querySelectorAll('input');
        },
        _clickRule: function(e) {
            if(e.target &&
                e.target.tagName &&
                e.target.tagName.toLowerCase() !== 'input') {
                return;
            }

            var els = this._getCheckboxes();

            for(var i = 0; i < els.length; i++) {
                var id = els[i].dataset['id'];

                if(els[i].checked) {
                    typograf.enable(id);
                } else {
                    typograf.disable(id);
                }
            }

            this._synchronizeMainCheckbox();
            this.saveToLocalStorage();
        },
        _selectAll: function() {
            var checked = $('.prefs__all-rules').checked,
                els = this._getCheckboxes();

            for(var i = 0; i < els.length; i++) {
                var el = els[i],
                    id = el.dataset['id'];

                el.checked = checked;
                if(checked) {
                    typograf.enable(id);
                } else {
                    typograf.disable(id);
                }
            }

            this.saveToLocalStorage();
        },
        _synchronizeMainCheckbox: function() {
            var els = this._getCheckboxes(),
                count = 0;
            for(var i = 0; i < els.length; i++) {
                if(els[i].checked) {
                    count++;
                }
            }

            $('.prefs__all-rules').checked = count === els.length;
        },
        _events: function() {
            $.on('.prefs__set-lang', 'change', this.changeLang.bind(this));

            $.on('.prefs__set-lang-ui', 'change', this.changeLangUI.bind(this));

            $.on('.prefs__set-mode', 'change', this.changeMode.bind(this));

            $.on('.prefs__rules', 'click', this._clickRule.bind(this));

            $.on('.prefs__all-rules', 'click', this._selectAll.bind(this));

            $.on('.prefs__default', 'click', this.byDefault.bind(this));
        }
    },
    _setValue: function(value) {
        $('.input__text').value = value;

        this._updateValue(value);
    },
    _getValue: function() {
        return $('.input__text').value;
    },
    _updateValue: function(value) {
        if(!this.isMobile && window.location.hash !== '#!prefs') {
            window.location.hash = '#!text=' + window.encodeURIComponent(str.truncate(value, 512));
        }

        this._updateClearText(value);
    },
    _updateClearText: function(value) {
        if(value.length > 0) {
            $.show('.input__clear');
        } else {
            $.hide('.input__clear');
        }
    },
    _events: function() {
        var that = this;

        $.on(window, 'message', function(e) {
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
            var el = $('.set-prefs'),
                clSelected = 'set-prefs_selected';

            if($.hasClass(el, clSelected)) {
                window.location.hash = '#';
                setTimeout(function() {
                    App.execute();
                }, 0);
            } else {
                window.location.hash = '#!prefs';
            }

            $.toggleClass(el, clSelected);
            this.prefs.toggle();
        }.bind(this);
        $.on('.set-prefs', 'click', this._onprefs);

        this._onastext = function() {
            $.show('.result__text');
            $.hide('.result__html');
        };
        $.on('.result__as-text', 'click', this._onastext);

        $.on('.result__as-html', 'click', function() {
            $.show('.result__html');
            $.hide('.result__text');
        });

        $.on('.input__copy', 'click', function() {
            $('.result__as-text').setAttribute('checked', 'checked');
            that._onastext();
            that.copyText($('.result__text'));
        });

        $.on('.input__save', 'click', function() {
            that.saveText($('.result__text'));
        });

        $.on('.input__clear', 'click', function() {
            this._setValue('');

            $('.input__text').focus();

            this.execute();
        }.bind(this));

        var oldValue = null;

        if(this.isMobile) {
            $.on('.input__execute', 'click', this.execute.bind(this));
        } else {
            $.on('.input__text', ['keyup', 'input', 'click'], function() {
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

App._texts = texts;

$.on(document, 'DOMContentLoaded', App.init.bind(App));
