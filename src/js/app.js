import './show-js-error';

import Metrika from './lib/metrika';
Metrika(28700106);

import './lib/jquery.checked';
import './typograf-groups';
import './extension';
import './version';

import hash from './lib/hash';
import str from './lib/string';

import i18n from './i18n';
import langUI from './lang-ui';

import diff from './diff';
import entityHighlight from './entity-highlight';
import prepareLocale from './prepare-locale';

import saveFile from './save-file';
import debounce from 'throttle-debounce/debounce';

import PrefsClass from './prefs';
let Prefs;

const typograf = new window.Typograf();

class App {
    constructor() {
        this.last = {value: '', result: ''};

        var body = $(document.body);
        body.removeClass('transition_no');

        this.isMobile = body.hasClass('page_is-mobile');

        if (window.location.hash === '#!prefs') {
            setTimeout(() => {
                this._onprefs();
            }, 1);
        }

        if (!this.isMobile) {
            this._setValue(hash.getHashParam('text') || '');
        }

        Prefs = new PrefsClass(typograf);
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
    }

    copyText(textarea) {
        try {
            textarea[0].select();
            document.execCommand('copy');
        } catch (e) {
            window.alert(i18n('notSupportCopy'));
        }
    }

    execute() {
        const
            value = this._getValue(),
            result = typograf.execute(value, {
                locale: prepareLocale(Prefs.locale),
                htmlEntity: {type: Prefs.mode}
            });

        this.last = { value, result };

        if (this.isMobile) {
            $('.input__text').val(result);
        } else {
            this.updateResult();
        }
    }

    updateResult() {
        const
            value = this.last.value,
            result = this.last.result,
            resText = $('.result__text'),
            resHTML = $('.result__html'),
            resDiff = $('.result__diff');

        resText.is(':visible') && resText.val(result);
        resHTML.is(':visible') && resHTML.html(entityHighlight(result));
        resDiff.is(':visible') && resDiff.html(diff.make(value, result));
    }

    _setValue(value) {
        $('.input__text').val(value);

        this._updateValue(value);
    }

    _getValue() {
        return $('.input__text').val();
    }

    _updateValue(value) {
        if (!this.isMobile && window.location.hash !== '#!prefs') {
            window.location.hash = '#!text=' + window.encodeURIComponent(str.truncate(value, 512));
        }

        this._updateClearText(value);
    }

    _updateClearText(value) {
        const clear = $('.input__clear');
        if (value.length > 0) {
            clear.show();
        } else {
            clear.hide();
        }
    }

    _events() {
        window.addEventListener('message', e => {
            let data;
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
        }, false);

        this._onprefs = () => {
            const
                el = $('.header'),
                clSelected = '.header_selected';

            if (el.hasClass(clSelected)) {
                window.location.hash = '';

                setTimeout(() => {
                    this.execute();
                }, 0);
            } else {
                window.location.hash = '#!prefs';
            }

            el.toggleClass(clSelected);
            Prefs.toggle();
        };

        $('.header, .paranja').on('click', this._onprefs);

        $('.result__as-text, .result__as-html, .result__as-diff').on('click', () => {
            $('.result__text').hide().val('');
            $('.result__html, .result__diff').hide().html('');

            $('.result__' + this.value).show();
            this.updateResult();
        });

        $('.input__copy').on('click', () => {
            $('.result__as-text').click();

            this.copyText($('.result__text'));
        });

        $('.input__save').on('click', () => {
            saveFile.save($('.result__text')[0], i18n('notSupportSave'));
        });

        $('.input__clear').on('click', () => {
            this._setValue('');

            $('.input__text').focus();

            this.execute();
        });

        let oldValue = null;

        if (this.isMobile) {
            $('.input__execute').on('click', this.execute.bind(this));
        } else {
            $('.input__text').on('keyup input click', () => {
                const val = this._getValue();
                if (val === oldValue) {
                    return;
                }

                oldValue = val;

                this._updateValue(val);

                this.execute();
            });
        }
    }
}

$(document).ready(function() {
    new App();
});
