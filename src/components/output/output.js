
/** @jsx h */

import {h, Component} from 'preact';
import i18n from '../i18n';
import diffChars from '../diff/diff';

import './output.less';

export default class Output extends Component {
    constructor(props) {
        super(props);

        this.onChangePreviewType = this.onChangePreviewType.bind(this);

        this.state = {
            previewType: 'text'
        };
    }

    onChangePreviewType(e) {
        this.setState({
            previewType: e.target.value
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
                <span class="output__save" title={i18n('save')} onSave={this.onSave}></span>
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
                <textarea class="output__textarea" value={props.result}></textarea> :
                null }
            { isHtml ?
                <div class="output__html" dangerouslySetInnerHTML={{ __html: props.result }}></div> :
                null }
            { isDiff ?
                <div class="output__diff" dangerouslySetInnerHTML={{ __html: diffChars(props.value, props.result) }}></div> :
                null }
        </div>;
    }
}
