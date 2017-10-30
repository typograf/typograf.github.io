require('./show-js-error');

require('./lib/jquery.checked');
require('./lib/metrika')(28700106);
require('./lib/function');

require('./typograf-groups');
require('./extension');
require('./version');

var hash = require('./lib/hash');
var str = require('./lib/string');

var i18n = require('./i18n');
var langUI = require('./lang-ui');
var diff = require('./diff');
var entityHighlight = require('./entity-highlight');
var prepareLocale = require('./prepare-locale');
var Prefs = require('./prefs');
var saveFile = require('./save-file');
var debounce = require('throttle-debounce/debounce');
var typograf = new window.Typograf();

var App = {
    last: {value: '', result: ''},
    isMobile: false,
    init: function() {
        var body = $(document.body);
        body.removeClass('transition_no');

        this.isMobile = body.hasClass('page_is-mobile');

        if (window.location.hash === '#!prefs') {
            setTimeout(function() {
                this._onprefs();
            }.bind(this), 1);
        }

        if (!this.isMobile) {
            this._setValue(hash.getHashParam('text') || '');
        }

        Prefs.init(typograf);
        Prefs.onChange = this.execute.bind(this);
        langUI.onChange = Prefs.changeLangUI.bind(Prefs);

        if (Prefs.rules) {
            typograf
                .enableRule(Prefs.rules.enabled)
                .disableRule(Prefs.rules.disabled);
        }

        this.updateResult = debounce(250, this.updateResult);

        this._events();

        this.execute();
    },
    copyText: function(textarea) {
        try {
            textarea[0].select();
            document.execCommand('copy');
        } catch (e) {
            window.alert(i18n('notSupportCopy'));
        }
    },
    execute: function() {
        var value = this._getValue(),
            result = typograf.execute(value, {
                locale: prepareLocale(Prefs.locale),
                htmlEntity: {type: Prefs.mode}
            });

        this.last = {
            value: value,
            result: result
        };

        if (this.isMobile) {
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
        resDiff.is(':visible') && resDiff.html(diff.make(value, result));
    },
    _setValue: function(value) {
        $('.input__text').val(value);

        this._updateValue(value);
    },
    _getValue: function() {
        return $('.input__text').val();
    },
    _updateValue: function(value) {
        if (!this.isMobile && window.location.hash !== '#!prefs') {
            window.location.hash = '#!text=' + window.encodeURIComponent(str.truncate(value, 512));
        }

        this._updateClearText(value);
    },
    _updateClearText: function(value) {
        var clear = $('.input__clear');
        if (value.length > 0) {
            clear.show();
        } else {
            clear.hide();
        }
    },
    _events: function() {
        window.addEventListener('message', function(e) {
            var data;
            try {
                data = JSON.parse(e.data);
            } catch (e) {
                return;
            }

            if (data && data.service === 'typograf' && data.command === 'execute') {
                e.source.postMessage(JSON.stringify({
                    service: 'typograf',
                    command: 'return',
                    text: typograf.execute(data.text, {
                        locale: prepareLocale(Prefs.locale),
                        htmlEntity: {type: Prefs.mode}
                    })
                }), '*');
            }
        }.bind(this), false);

        this._onprefs = function() {
            var el = $('.header'),
                clSelected = '.header_selected';

            if (el.hasClass(clSelected)) {
                window.location.hash = '';

                setTimeout(function() {
                    this.execute();
                }.bind(this), 0);
            } else {
                window.location.hash = '#!prefs';
            }

            el.toggleClass(clSelected);
            Prefs.toggle();
        }.bind(this);

        $('.header, .paranja').on('click', this._onprefs);

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
            saveFile.save($('.result__text')[0], i18n('notSupportSave'));
        }.bind(this));

        $('.input__clear').on('click', function() {
            this._setValue('');

            $('.input__text').focus();

            this.execute();
        }.bind(this));

        var oldValue = null;

        if (this.isMobile) {
            $('.input__execute').on('click', this.execute.bind(this));
        } else {
            $('.input__text').on('keyup input click', function() {
                var val = this._getValue();
                if (val === oldValue) {
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
