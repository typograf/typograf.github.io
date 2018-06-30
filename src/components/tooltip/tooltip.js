/** @jsx h */

import {h, Component} from 'preact';
import cl from 'classnames';

import './tooltip.less';

export default class Tooltip extends Component {
    constructor(props) {
        super(props);

        this.state.visible = true;
    }   

    componentWillUnmount() {
        clearTimeout(this._timer);
    }
 
    onClose() {
        this.setState({ visible: false });
        this.props.onClose && this.props.onClose();        
    }

    render(props, state) {
        if (props.autocloseable) {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this.onClose(), 3000);
        }

        return <div class={
            cl(`tooltip tooltip_type_${this.props.type || 'ok'}`, {
                tooltip_visible: state.visible
            })
        }>{this.props.children}</div>;
    }
}
