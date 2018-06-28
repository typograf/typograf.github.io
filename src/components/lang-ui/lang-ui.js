/** @jsx h */

import {h, Component} from 'preact';
import i18n from '../i18n';

import './lang-ui.less';

export default class LangUI extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);

        this.langs = i18n.getLangs().map(function(item, i) {
            return {
                value: item.value,
                text: item.text,
                index: i
            };
        });
        
        this.state = {...this._findLangInfo(i18n.getLang())};
    }

    _findLangInfo(value) {
        let result = null;

        this.langs.some(function(item) {
            if (item.value === value) {
                result = item;
                return true;
            }

            return false;
        });

        return result || this.langs[0];
    }

    onClick() {
        let index = this.state.index + 1;

        if (index >= this.langs.length) {
            index = 0;
        }

        const currentLang = this.langs[index];

        this.setState(currentLang);

        i18n.setLang(currentLang.value);

        this.props.onChange(currentLang.value);
    }

    render() {
        return <span class="lang-ui" onClick={this.onClick}>
            {this.state.text}
        </span>;
    }
}
