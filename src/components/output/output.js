/** @jsx h */

import {h, Component} from 'preact';
import i18n from '../i18n';
import diffChars from '../diff/diff';
import saveFile from '../helpers/file-request';
import UpdatedTextarea from '../updated-textarea/updated-textarea';
import Tooltip from '../tooltip/tooltip';

import './output.less';

export default class Output extends Component {
    constructor(props) {
        super(props);

        [
            'onCopy',
            'onSave',
            'onChange',
            'onChangePreviewType',
            'onSuccessTooltipClose',
            'onErrorTooltipClose',
        ].forEach(method => {
            this[method] = this[method].bind(this);
        });

        this.currentResult = this.props.result;

        this.state = {
            previewType: 'text'
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.currentResult = nextProps.result;
    }    

    onChange(e) {
        this.currentResult = e.target.value;
    }

    onChangePreviewType(e) {
        this.setState({
            previewType: e.target.value
        });
    }

    onCopy() {
        const textarea = this._textarea.base;

        try {
            textarea.focus();
            textarea.select();
            document.execCommand('copy');

            this.setState({ isVisibleSuccessTooltip: true });
        } catch (e) {
            this.setState({ isVisibleErrorTooltip: true });
        }
    }

    onSave() {
        saveFile(this.state.result, i18n('notSupportSave'));
    }

    onSuccessTooltipClose() {
        this.setState({
            isVisibleSuccessTooltip: false
        });
    }

    onErrorTooltipClose() {
        this.setState({
            isVisibleErrorTooltip: false
        });
    }

    render(props, state) {
        const
            isText = state.previewType === 'text',
            isHtml = state.previewType === 'html',
            isDiff = state.previewType === 'diff';

        return <div class="output">
            <div class="output__bar">
                <span class="output__copy" title={i18n('copy')} onClick={this.onCopy}></span>
                <span class="output__save" title={i18n('save')} onClick={this.onSave}></span>
                <span class="output__as">
                    <label><input type="radio" class="output__as-text" checked={isText} onChange={this.onChangePreviewType} name="view" autocomplete="off" value="text" />
                        {i18n('text')}
                    </label>
                    <label><input type="radio" class="output__as-html" checked={isHtml} onChange={this.onChangePreviewType} name="view" autocomplete="off" value="html" />
                        <span class="output__tag">&lt;HTML&gt;</span>
                    </label>
                    <label><input type="radio" class="output__as-diff" checked={isDiff} onChange={this.onChangePreviewType} name="view" autocomplete="off" value="diff" />
                        <span class="output__diff1">{i18n('diff-1')}</span><span class="output__diff2">{i18n('diff-2')}</span>
                    </label>
                </span>
            </div>
            { isText ?
                <UpdatedTextarea class="output__textarea" ref={elem => this._textarea = elem} value={props.result} onChange={this.onChange} /> :
                null }
            { isHtml ?
                <div class="output__html" dangerouslySetInnerHTML={{ __html: props.result }}></div> :
                null }
            { isDiff ?
                <div class="output__diff" dangerouslySetInnerHTML={{ __html: diffChars(props.value, props.result) }}></div> :
                null }

            <Tooltip type="ok" visible={state.isVisibleSuccessTooltip} autocloseable onClose={this.onSuccessTooltipClose}>{i18n('copied')}</Tooltip>
            <Tooltip type="error" visible={state.isVisibleErrorTooltip} autocloseable onClose={this.onErrorTooltipClose}>{i18n('notSupportCopy')}</Tooltip>
        </div>;
    }
}
