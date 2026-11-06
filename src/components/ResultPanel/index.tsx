import { useMemo } from 'preact/hooks';
import DOMPurify from 'dompurify';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import { makeDiff } from '../Diff';
import { highlightEntity } from '../HighlightEntity';
import { Radio } from '../ui/Radio';
import type { ResultPanelProps } from './types';
import './index.css';

const b = block('result-panel');

export function ResultPanel({ text, before, result, type, onTypeChange }: ResultPanelProps) {
    const previewHtml = useMemo(() => type === 'html' ? DOMPurify.sanitize(highlightEntity(text)) : '', [text, type]);
    const diffHtml = useMemo(() => type === 'diff' ? makeDiff(before, result) : '', [before, result, type]);

    return <div class={b()}>
        <div class={b('head')}>
            <span class={b('as')}>
                <Radio class={b('as-html')} id="result-panel__as-html" name="view" value="html" checked={type === 'html'} onChange={() => onTypeChange('html')} /><label for="result-panel__as-html" style={{ color: 'var(--html-accent)', fontSize: '0.9em' }}>&lt;HTML&gt;</label>
                <Radio class={b('as-diff')} id="result-panel__as-diff" name="view" value="diff" checked={type === 'diff'} onChange={() => onTypeChange('diff')} /><label for="result-panel__as-diff"><span style={{ borderBottom: '1px solid rgba(255, 0, 0, .5)' }}>{i18n('diff-1')}</span><span style={{ borderBottom: '1px solid rgba(0, 255, 0, .5)' }}>{i18n('diff-2')}</span></label>
            </span>
        </div>
        {type === 'html' && <div class={b('html')} dangerouslySetInnerHTML={{ __html: previewHtml }} />}
        {type === 'diff' && <div class={b('diff')} dangerouslySetInnerHTML={{ __html: diffHtml }} />}
    </div>;
}
