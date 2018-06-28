/** @jsx h */

import {h, render, Component} from 'preact';
import 'preact/debug';

import saveFile from '../helpers/save-file';

import i18n from '../i18n';
import hash from '../lib/hash';

import Header from '../header/header';
import Input from '../input/input';
import Output from '../output/output';
import Tooltip from '../tooltip/tooltip';
import Footer from '../footer/footer';

import diffChars from '../diff/diff';
import entityHighlight from '../entity-highlight/entity-highlight';
import storage from '../storage/storage';
import {default as Typograf, prepareLocale} from '../typograf/typograf';
import Page from '../page/page';

import './app.less';

const typograf = new Typograf();

class App extends Component {
    constructor(props) {
        super(props);

        this.isMobile = Page.isMobile;

        this._bindEvents();

        this.state = {
            isVisiblePrefs: false,
            value: this.isMobile ? '' : (hash.getHashParam('text') || ''),
            result: ''
        };

        if (window.location.hash === '#!prefs') {
            setTimeout(() => {
                this.setState({isVisiblePrefs: true});
            }, 1);
        }

        //this._prefs = new Prefs(typograf);
        //this._prefs.onChange = this.execute.bind(this);

        /*if (this._prefs.rules) {
            typograf
                .enableRule(this._prefs.rules.enabled)
                .disableRule(this._prefs.rules.disabled);
        }*/

        //this.execute();
    }

    _bindEvents() {
        [
            'onHeaderClick',
            'onLangUIChange',
            'onLocaleChange',
            'onValueChange'
        ].forEach(method => {
            this[method] = this[method].bind(this);
        });


        // Для работы букмарклета.
        window.addEventListener('message', e => {
            let data;
            try {
                data = JSON.parse(e.data);
            } catch (e) {
                return;
            }

            if (data && data.service === 'typograf' && data.command === 'execute') {
                const
                    type = storage.get('mode'),
                    locale = storage.get('locale');

                e.source.postMessage(JSON.stringify({
                    service: 'typograf',
                    command: 'return',
                    text: typograf.execute(data.text, {
                        locale: prepareLocale(locale),
                        htmlEntity: {type}
                    })
                }), '*');
            }
        }, false);
    }

    onHeaderClick() {
        this.setState({
            isVisiblePrefs: !this.state.isVisiblePrefs
        })
    }

    onLangUIChange() {
        // Вынужденная мера, перерисовка всей локализации на клиенте.
        this.forceUpdate();
        Page.updateTitle();
    }

    onLocaleChange() {
        this.execute();
    }

    onValueChange(value) {
        this.setState({value});
        this.execute();
    }

    render(props, state) {
        return <div class="app">
            <Header onClick={this.onHeaderClick} selected={state.isVisiblePrefs} />
            <div class="app__container">
                <div class="app__table">
                    <Input onChange={this.onValueChange} onLocaleChange={this.onLocaleChange} value={state.value} />
                    <Output value={state.result}></Output>
                </div>
            </div>
            <Footer onLangUIChange={this.onLangUIChange} />
        </div>;
    }

    copyText(textarea) {
        try {
            textarea[0].select();
            document.execCommand('copy');

            render(<Tooltip autocloseable>{i18n('copied')}</Tooltip>, document.querySelector('.tooltip-container'));
        } catch (e) {
            render(<Tooltip type="error" autocloseable>{i18n('notSupportCopy')}</Tooltip>, document.querySelector('.tooltip-contianer'));
        }
    }

    execute() {
        const
            value = this.state.value,
            locale = storage.get('locale'),
            mode = storage.get('mode'),
            result = typograf.execute(value, {
                locale: prepareLocale(locale),
                htmlEntity: {type: mode}
            });

        this.setState({result});
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
        resDiff.is(':visible') && resDiff.html(diffChars(value, result));
    }

    _events() {
        this._onprefs = () => {
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

        $('.result__as-text, .result__as-html, .result__as-diff').on('click', (e) => {
            $('.result__text').hide().val('');
            $('.result__html, .result__diff').hide().html('');

            $('.result__' + e.target.value).show();
            this.updateResult();
        });

        $('.input__copy').on('click', () => {
            $('.result__as-text').click();

            this.copyText($('.result__text'));
        });

        $('.input__save').on('click', () => {
            saveFile.save($('.result__text')[0], i18n('notSupportSave'));
        });
    }
}

render(<App/>, document.querySelector('.app-container'));
