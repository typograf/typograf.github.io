import '../../services/show-js-error';

import $ from 'jquery';
import '../../helpers/jquery.checked';

import { debounce } from 'throttle-debounce';
import Typograf from 'typograf/dist/typograf.all';

import langUI from '../lang-ui/lang-ui';

import entityHighlight from '../entity-highlight/entity-highlight';
import prepareLocale from '../../helpers/prepare-locale';
import { makeDiff } from '../diff/diff';

import Tooltip from '../tooltip/tooltip';

import { saveFile } from '../../helpers/save-file';
import Prefs from '../prefs/prefs';
import i18n from '../../helpers/i18n';
import texts from '../../i18n/texts';
i18n.texts = texts;

import { getHashParam } from '../../helpers/hash';
import { truncate } from '../../helpers/string';
import { copyText } from '../../helpers/copy-text';

import '../input/input';
import '../header/header';
import '../footer/footer';

import '../../helpers/typograf-groups';
import '../../service-worker';

import { metrikaHit, metrikaReachGoal } from '../../services/metrika';
metrikaHit();

import './app.less';

const typograf = new Typograf();

export default class App {
    constructor() {
        this.last = {value: '', result: ''};

        const body = $(document.body);
        body.removeClass('transition_no');

        this.isMobile = body.hasClass('page_is-mobile');

        if (window.location.hash === '#!prefs') {
            setTimeout(() => {
                this._onprefs();
            }, 1);
        }

        if (!this.isMobile) {
            this._setValue(getHashParam('text') || '');
        }

        this._tooltip = new Tooltip();

        this._prefs = new Prefs(typograf);
        this._prefs.onChange = this.execute.bind(this);

        langUI.onChange = () => {
            this._prefs.changeLangUI();

            metrikaReachGoal('switch-lang');
        };

        if (this._prefs.rules) {
            typograf
                .enableRule(this._prefs.rules.enabled)
                .disableRule(this._prefs.rules.disabled);
        }

        this.updateResult = debounce(250, this.updateResult);

        this._events();

        this.execute();
    }

    copyText(text) {
        if (copyText(text)) {
            this._tooltip.show(i18n('copied'), 'ok', true);
        } else {
            this._tooltip.show(i18n('notSupportCopy'), 'error', true);
        }
    }

    execute() {
        const
            value = this._getValue(),
            result = typograf.execute(value, {
                locale: prepareLocale(this._prefs.locale),
                htmlEntity: {type: this._prefs.mode}
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
        resDiff.is(':visible') && resDiff.html(makeDiff(value, result));
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
            window.location.hash = '#!text=' + window.encodeURIComponent(truncate(value, 512));
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
                        locale: prepareLocale(this._prefs.locale),
                        htmlEntity: {type: this._prefs.mode}
                    })
                }), '*');
            }
        }, false);

        this._onprefs = () => {
            const
                el = $('.header'),
                clSelected = 'header_selected';

            if (el.hasClass(clSelected)) {
                window.location.hash = '';

                setTimeout(() => {
                    this.execute();
                }, 0);
            } else {
                window.location.hash = '#!prefs';
            }

            el.toggleClass(clSelected);
            this._prefs.toggle();
        };

        $('.header, .paranja').on('click', this._onprefs);

        $('.result__as-text, .result__as-html, .result__as-diff').on('click', (e) => {
            $('.result__text').hide().val('');
            $('.result__html, .result__diff').hide().html('');

            $('.result__' + e.target.value).show();
            this.updateResult();
        });

        $('.input__copy').on('click', () => {
            this.copyText(this.last.result);

            metrikaReachGoal('copy-text');
        });

        $('.input__save').on('click', () => {
            saveFile($('.result__text')[0], i18n('notSupportSave'));

            metrikaReachGoal('save-text');
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
