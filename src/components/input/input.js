/** @jsx h */

import {h, Component} from 'preact';
import i18n from '../i18n';
import LocaleSwitcher from '../locale-switcher/locale-switcher';

import './input.less';

export default class Input extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onClear = this.onClear.bind(this);
        this.onSelect = this.onSelect.bind(this);

        this.state = { value: props.value };
    }

    onChange(e) {
        this._onChange(e.target.value);
    }

    onLocaleChange() {
        this.props.on;
    }

    _onChange(value) {
        this.setState({ value });
        this.props.onChange(value);
    }

    onClear() {
        this._onChange('');        
    }

    onSelect() {

    }

    render(props, state) {
        return <div class="input">
            <div class="input__bar">
                <LocaleSwitcher onChange={props.onLocaleChange} />
            </div>
            {state.value.length ?
                <div class="input__clear" title={i18n('clear')} onClick={this.onClear}>×</div>
                : null}
            <textarea class="input__textarea" onInput={this.onChange} onKeyUp={this.onChange} onSelect={this.onSelect} value={state.value}></textarea>
        </div>;
    }
}
