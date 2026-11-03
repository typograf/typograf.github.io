import type { TargetedEvent } from 'preact';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import DOMPurify from 'dompurify';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import { makeDiff } from '../Diff';
import { highlightEntity } from '../HighlightEntity';
import { Textarea } from '../ui/Textarea';
import type { ResultPanelProps, ResultType } from './types';
import './index.css';

const b = block('result-panel');

export function ResultPanel({ before, result, type, onTypeChange, actions }: ResultPanelProps) {
    const textRef = useRef<HTMLTextAreaElement>(null);
    const textValueRef = useRef(result);
    const previewHtml = useMemo(() => type === 'html' ? DOMPurify.sanitize(highlightEntity(result)) : '', [result, type]);
    const diffHtml = useMemo(() => type === 'diff' ? makeDiff(before, result) : '', [before, result, type]);
    useEffect(() => {
        textValueRef.current = result;
        if (textRef.current) textRef.current.value = result;
    }, [result]);

    const changeType = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        if (textRef.current) textValueRef.current = textRef.current.value;
        onTypeChange(event.currentTarget.value as ResultType);
    }, [onTypeChange]);

    return <div class={b()}>
        <div class={b('head')}>
            <span class={b('as')}>
                <input type="radio" class={b('as-text')} id="result-panel__as-text" name="view" value="text" checked={type === 'text'} onChange={changeType} /><label for="result-panel__as-text">{i18n('text')}</label>
                <input type="radio" class={b('as-html')} id="result-panel__as-html" name="view" value="html" checked={type === 'html'} onChange={changeType} /><label for="result-panel__as-html" style={{ color: 'var(--html-accent)', fontSize: '0.9em' }}>&lt;HTML&gt;</label>
                <input type="radio" class={b('as-diff')} id="result-panel__as-diff" name="view" value="diff" checked={type === 'diff'} onChange={changeType} /><label for="result-panel__as-diff"><span style={{ borderBottom: '1px solid rgba(255, 0, 0, .5)' }}>{i18n('diff-1')}</span><span style={{ borderBottom: '1px solid rgba(0, 255, 0, .5)' }}>{i18n('diff-2')}</span></label>
            </span>
        </div>
        <div class={b('actions')}>{actions}</div>
        {type === 'text' && <Textarea ref={textRef} autocomplete="off" class={b('text')} spellcheck placeholder={i18n('result')} defaultValue={textValueRef.current} />}
        {type === 'html' && <div class={b('html')} dangerouslySetInnerHTML={{ __html: previewHtml }} />}
        {type === 'diff' && <div class={b('diff')} dangerouslySetInnerHTML={{ __html: diffHtml }} />}
    </div>;
}
