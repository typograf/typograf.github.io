/** @jsx h */

import {h, render, Component} from 'preact';

// TODO
import 'preact/debug';

import hash from '../lib/hash';

import Header from '../header/header';
import Input from '../input/input';
import Output from '../output/output';
import Footer from '../footer/footer';

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
            isVisiblePrefs: window.location.hash === '#!prefs',
            value: this.isMobile ? '' : (hash.getHashParam('text') || ''),
            result: ''
        };

        if (this._prefs.rules) {
            typograf
                .enableRule(this._prefs.rules.enabled)
                .disableRule(this._prefs.rules.disabled);
        }
    }
    
    _bindEvents() {
        [
            'onHeaderClick',
            'onLangUIChange',
            'onLocaleChange',
            'onPrefsClose',
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
        const isVisiblePrefs = !this.state.isVisiblePrefs;

        this.setState({isVisiblePrefs});
        this._onVisiblePrefs(isVisiblePrefs);
    }

    onPrefsClose() {
        this.setState({isVisiblePrefs: false});
        this._onVisiblePrefs(false);
    }

    _onVisiblePrefs(isVisible) {
        this.execute();

        if (isVisible) {
            window.location.hash = '#!prefs';
        } else {           
            window.location.hash = '';
            setTimeout(() => {
                this.execute();
            }, 0);
        }
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
            <div class="app__body">
                <Paranja visible={this.isVisiblePrefs} />
                <Prefs visible={this.isVisiblePrefs} onClose={this.onPrefsClose} />
                <Input onChange={this.onValueChange} onLocaleChange={this.onLocaleChange} value={state.value} />
                <Output value={state.value} result={state.result}></Output>
            </div>
            <Footer onLangUIChange={this.onLangUIChange} />
        </div>;
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
}

render(<App/>, document.querySelector('.app-container'));
