(function() {

// for iPad 1
if(!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if(typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {
            },
            fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

function $(cls) {
    return document.querySelector(cls);
}

var div = document.createElement('div'),
    hasClassList = !!div.classList,
    addClass = hasClassList ? function(el, name) {
        el.classList.add(name);
    } : function(el, name) { // support IE9
        var re = new RegExp('(^|\\s)' + name + '(\\s|$)', 'g');
        if(!re.test(name.className)) {
            el.className = (el.className + ' ' + name)
                .replace(/\s+/g, ' ')
                .replace(/(^ | $)/g, '');
        }
    },
    removeClass = hasClassList ? function(el, name) {
        el.classList.remove(name);
    } : function(el, name) { // support IE9
        var re = new RegExp('(^|\\s)' + name + '(\\s|$)', 'g');
        el.className = el.className
            .replace(re, '$1')
            .replace(/\s+/g, ' ')
            .replace(/(^ | $)/g, '');
    },
    toggleClass = function(el, name) {
        if(hasClass(el, name)) {
            removeClass(el, name);
        } else {
            addClass(el, name);
        }
    },
    hasClass = hasClassList ? function(el, name) {
        return el.classList.contains(name);
    } : function(el, name) { // support IE9
        var re = new RegExp('(^|\\s)' + name + '(\\s|$)', 'g');
        return el.className.search(re) > -1;
    };

function escapeHTML(text) {
    return text.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
}

function hide(el) {
    $(el).style.display = 'none';
}

function show(el) {
    $(el).style.display = 'block';
}

function isVisible(el) {
    return !!$(el).offsetHeight;
}

function toggle(el) {
    if(isVisible(el)) {
        show(el);
    } else {
        hide(el);
    }
}

function getGroupName(str) {
    return str.split('/')[1];
}

function getRuleLang(str) {
    return str.split('/')[0];
}

function getHashParams(param) {
    var hash = window.location.hash.replace(/^#!/, ''),
        buf = hash.split('&'),
        params = {};

    for(var i = 0; i < buf.length; i++) {
        var el = buf[i].split('=');
        if(el.length > 1 && el[1] !== undefined) {
            try {
                params[el[0]] = window.decodeURIComponent(el[1]);
            } catch(e) {
                params[el[0]] = el[1];
            }
        }
    }

    return params;
}

function getHashParam(param) {
    return getHashParams()[param];
}

function truncateString(text, len) {
    if(text) {
        return text.length > len ? text.substr(0, len) : text;
    }

    return '';
}

function addEvent(elem, type, callback) {
    var elem = typeof elem === 'string' ? $(elem) : elem;
    if(Array.isArray(type)) {
        type.forEach(function(el) {
            elem.addEventListener(el, callback, false);
        });
    } else {
        elem.addEventListener(type, callback, false);
    }
}

var typograf = new Typograf(),
    typografPrefs = new Typograf({lang: 'ru', mode: 'digit'});

typografPrefs.disable('*').enable(['common/nbsp/*', 'ru/nbsp/*']);

var App = {
    isMobile: false,
    init: function() {
        this.isMobile = document.body.className.search('page_is-mobile') > -1;

        if(window.location.hash === '#!prefs') {
            setTimeout((function() {
                this._onprefs();
            }).bind(this), 1);
        }

        if(!this.isMobile) {
            this._setValue(getHashParam('text') || '');
        }

        this.loadFromLocalStorage();

        this._updateLang();

        this._events();

        this.prefs._events();

        this.execute();
    },
    loadFromLocalStorage: function() {
        var rules;
        try {
            rules = JSON.parse(localStorage.getItem('settings.rules'));
            this.prefs.lang = localStorage.getItem('settings.lang');
            this.prefs.mode = localStorage.getItem('settings.mode');
        } catch(e) {}

        if(rules && typeof rules === 'object' && Array.isArray(rules.disabled) && Array.isArray(rules.enabled)) {
            typograf
                .enable(rules.enabled)
                .disable(rules.disabled);
        }

        this.prefs.lang = this.prefs.lang || 'ru';
        this.prefs.mode = this.prefs.mode || '';
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

            show('.prefs');
            hide('.input');

            $('.prefs__set-lang').value = this.lang;
            $('.prefs__set-mode').value = this.mode;

            this._synchronizeMainCheckbox();
        },
        hide: function() {
            hide('.prefs');
            show('.input');
        },
        toggle: function() {
            if(isVisible('.prefs')) {
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
                localStorage.setItem('settings.mode', this.mode);
            } catch(e) {}
        },
        byDefault: function() {
            var els = this._getCheckboxes();
            for(var i = 0; i < els.length; i++) {
                var id = els[i].dataset['id'],
                    checked;
                Typograf.prototype._rules.some(function(rule) {
                    if(id === rule.name) {
                        var checked = !(rule.enabled === false);
                        els[i].checked = checked;

                        if(checked) {
                            typograf.enable(id);
                        } else {
                            typograf.disable(id);
                        }

                        return true;
                    }

                    return false;
                });
            }

            $('.prefs__all-rules').checked = false;
            $('.prefs__set-mode').value = '';

            this.saveToLocalStorage();
        },
        groupTitle: {
            punctuation: {
                title: 'Пунктуация',
                index: 1
            },
            optalign: {
                title: 'Висячая пунктуация',
                index: 2
            },
            dash: {
                title: 'Тире и дефис',
                index: 3
            },
            nbsp: {
                title: 'Неразрывный пробел',
                index: 4
            },
            space: {
                title: 'Пробел',
                index: 5
            },
            html: {
                title: 'HTML',
                index: 6
            },
            date: {
                title: 'Дата',
                index: 7
            },
            money: {
                title: 'Деньги',
                index: 8
            },
            'number': {
                title: 'Числа и математические выражения',
                index: 9
            },
            sym: {
                title: 'Символы',
                index: 10
            },
            other: {
                title: 'Прочее',
                index: 11
            }
        },
        changeLang: function() {
            this.lang = $('.prefs__set-lang').value;
            this._build();
            this.saveToLocalStorage();

            App._updateLang();
        },
        changeMode: function() {
            this.mode = $('.prefs__set-mode').value;
            this._build();
            this.saveToLocalStorage();
        },
        _build: function() {
            var rules = Typograf.prototype._rules,
                that = this;

            var buf = [];
            rules.forEach(function(el) {
                buf.push(el);
            });

            buf.sort(function(a, b) {
                return a.title > b.title ? 1 : -1;
            });

            buf.sort(function(a, b) {
                if(!a.name || !b.name) {
                    return -1;
                }

                var indexA = that.groupTitle[getGroupName(a.name)].index,
                    indexB = that.groupTitle[getGroupName(b.name)].index;

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
                    groupTitle = typografPrefs.execute(this.groupTitle[groupName].title);

                html += '<fieldset class="prefs__fieldset"><legend class="prefs__legend">' + groupTitle + '</legend>';

                group.forEach(function(rule) {
                    var title = typografPrefs.execute(escapeHTML(rule.title)),
                        name = rule.name,
                        id = 'setting-' + name,
                        ch = typograf.enabled(name),
                        checked = ch ? ' checked="checked"' : '';

                    html += '<div class="prefs__rule"><input type="checkbox"' + checked + ' id="' + id + '" data-id="' + name + '" /> <label for="' + id + '">' + title + '</label></div>';
                }, this);

                html += '</fieldset>';
            }, this);

            $('.prefs__rules').innerHTML = html;
        },
        _getCheckboxes: function() {
            return $('.prefs__rules').querySelectorAll('input');
        },
        _clickRule: function(e) {
            if(e.target && e.target.tagName && e.target.tagName.toLowerCase() !== 'input') {
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
            addEvent('.prefs__set-lang', 'change', this.changeLang.bind(this));

            addEvent('.prefs__set-mode', 'change', this.changeMode.bind(this));

            addEvent('.prefs__rules', 'click', this._clickRule.bind(this));

            addEvent('.prefs__all-rules', 'click', this._selectAll.bind(this));

            addEvent('.prefs__default', 'click', this.byDefault.bind(this));
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
            window.location.hash = '#!text=' + window.encodeURIComponent(truncateString(value, 512));
        }

        this._updateClearText(value);
    },
    _updateClearText: function(value) {
        if(value.length > 0) {
            show('.input__clear');
        } else {
            hide('.input__clear');
        }
    },
    _updateLang: function() {
        var el = $('.current-lang');
        el.innerHTML = this.prefs.lang;
        el.value = this.prefs.lang;
    },
    _events: function() {
        addEvent(window, 'message', (function(e) {
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
        }).bind(this));

        this._onprefs = (function() {
            var el = $('.set-prefs'),
                clSelected = 'set-prefs_selected';

            if(hasClass(el, clSelected)) {
                window.location.hash = '#';
                setTimeout(function() {
                    App.execute();
                }, 0);
            } else {
                window.location.hash = '#!prefs';
            }
            toggleClass(el, clSelected);
            this.prefs.toggle();
        }).bind(this);
        addEvent('.set-prefs', 'click', this._onprefs);

        if(!this.isMobile) {
            addEvent('.result__as-text', 'click', function() {
                show('.result__text');
                hide('.result__html');
            });

            addEvent('.result__as-html', 'click', function() {
                show('.result__html');
                hide('.result__text');
            });
        }

        addEvent('.input__clear', 'click', (function() {
            this._setValue('');

            $('.input__text').focus();

            this.execute();
        }).bind(this));

        var oldValue = null;

        if(this.isMobile) {
            addEvent('.input__execute', 'click', this.execute.bind(this));
        } else {
            addEvent('.input__text', ['keyup', 'input', 'click'], (function() {
                var val = this._getValue();
                if(val === oldValue) {
                    return;
                }

                oldValue = val;

                this._updateValue(val);

                this.execute();
            }).bind(this));
        }
    }
};

addEvent(window, 'load', App.init.bind(App));

})();
