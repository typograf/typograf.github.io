var diff = require('./diff'),
    entityHighlight = require('./entity-highlight'),
    hash = require('./hash'),
    getText = require('./get-text').getText,
    prepareLocale = require('./prepare-locale'),
    Prefs = require('./prefs'),
    saveFile = require('./save-file'),
    str = require('./string'),
    debounce = require('throttle-debounce/debounce'),
    Typograf = window.Typograf,
    typograf = new Typograf(),
    showJSError = require('show-js-error/dist/show-js-error.custom');

showJSError.init({
    title: 'JavaScript error',
    userAgent: navigator.userAgent,
    sendText: 'Send 🐛',
    templateDetailedMessage: '```{message}```',
    sendUrl: 'https://github.com/typograf/typograf.github.io/issues/new?title={title}&body={body}'
});

require('./jquery.checked');
require('./metrika');
require('./function');
require('./typograf-groups');

var App = {
    last: {value: '', result: ''},
    isMobile: false,
    init: function() {
        this.setVersion();

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

        if (Prefs.rules) {
            typograf
                .enableRule(Prefs.rules.enabled)
                .disableRule(Prefs.rules.disabled);
        }

        this.updateResult = debounce(250, this.updateResult);

        this.setLinkToAddition();
        this._events();

        this.execute();
    },
    setLinkToAddition: function() {
        var browser = 'chrome';

        if (navigator.userAgent.search('YaBrowser') > -1) {
            browser = 'yabro';
        }

        if (typeof InstallTrigger !== 'undefined') {
            browser = 'firefox';
        }

        if (navigator.userAgent.search(' OPR\/') > -1) {
            browser = 'opera';
        }

        $('.extension_' + browser).show();
    },

    setVersion: function() {
        $('#version').text(Typograf.version);
    },
    copyText: function(textarea) {
        try {
            textarea[0].select();
            document.execCommand('copy');
        } catch(e) {
            window.alert(getText('notSupportCopy'));
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
            } catch(e) {
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
            var el = $('.hamburger'),
                clSelected = 'hamburger_selected';

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
            saveFile.save($('.result__text')[0], getText('notSupportSave'));
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
