/** @jsx h */

import { h, Component } from 'preact';

import i18n from '../i18n';
import storage from '../storage/storage';
import Typograf from '../typograf/typograf';

export default class LocaleSwitcher extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);

        this.state = {
            value: storage.get('locale') || 'ru'
        };
    }

    onChange(e) {
        const value = e.target.value;
        this.setState({ value });

        storage.set('locale', value);

        this.props.onChange(value);
    }

    render(props, state) {
        const locales = Typograf.getLocales().sort(function(a, b) {
            return i18n('locale-' + a) > i18n('locale-' + b) ? 1 : -1;
        })
        
        return <div class="locale-switcher">
            {i18n('locale')}: <select onChange={this.onChange}>
            {locales.map((value, i) => {
                const selected = value === state.value;
                return <option key={i} value={value} selected={selected}>
                    {i18n(`locale-${value}`)}
                </option>;
            })}
            </select>
        </div>;
    }
}
