/** @jsx h */

import {h, Component} from 'preact';

export default class Output extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            value: props.value
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value
            })
        }
    }    

    shouldComponentUpdate(nextProps) {
        return nextProps.value !== this.state.value;
    }

    render(props, state) {
        return <textarea class={props['class']} value={state.value} />;
    }
}
