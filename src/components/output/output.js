
/** @jsx h */

import {h, Component} from 'preact';
import i18n from '../i18n';

import './output.less';

export default class Output extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);

        this.state = { value: this.props.value };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }        
    }    

    onChange(e) {
        this._onChange(e.target.value);
    }

    _onChange(value) {
        this.setState({ value });
    }

    onSelect() {

    }

    render(props, state) {
        return <div class="output">
            <div class="output__bar">
            </div>
            <textarea
                class="output__textarea"
                onInput={this.onChange}
                onKeyUp={this.onChange}
                onSelect={this.onSelect}
                value={state.value}>
            </textarea>
        </div>
    }
};
