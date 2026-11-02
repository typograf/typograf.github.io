import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import DOMPurify from 'dompurify';
import { i18n } from '../../i18n/i18n';
import { makeDiff } from '../diff/diff';
import { highlightEntity } from '../highlightEntity/highlightEntity';
import './result.css';

export type ResultType = 'text' | 'html' | 'diff';

interface ResultProps {
    before: string;
    result: string;
    type: ResultType;
    onTypeChange: (type: ResultType) => void;
    actions: ComponentChildren;
}

export function Result({ before, result, type, onTypeChange, actions }: ResultProps) {
    const textRef = useRef<HTMLTextAreaElement>(null);
    const previewHtml = useMemo(() => DOMPurify.sanitize(highlightEntity(result)), [result]);
    const diffHtml = useMemo(() => makeDiff(before, result), [before, result]);
    useEffect(() => {
        if (textRef.current) textRef.current.value = result;
    }, [result]);
    return <div class="table__right result">
        <div class="input__head">
            <span class="result__as">
                <input type="radio" class="result__as-text" id="result__as-text" name="view" value="text" checked={type === 'text'} onChange={() => onTypeChange('text')} /><label for="result__as-text">{i18n('text')}</label>
                <input type="radio" class="result__as-html" id="result__as-html" name="view" value="html" checked={type === 'html'} onChange={() => onTypeChange('html')} /><label for="result__as-html" style={{ color: '#bf4b15', fontSize: '0.9em' }}>&lt;HTML&gt;</label>
                <input type="radio" class="result__as-diff" id="result__as-diff" name="view" value="diff" checked={type === 'diff'} onChange={() => onTypeChange('diff')} /><label for="result__as-diff"><span style={{ borderBottom: '1px solid rgba(255, 0, 0, .5)' }}>{i18n('diff-1')}</span><span style={{ borderBottom: '1px solid rgba(0, 255, 0, .5)' }}>{i18n('diff-2')}</span></label>
            </span>
        </div>
        <div class="input__actions">{actions}</div>
        <textarea ref={textRef} autocomplete="off" class="textarea result__text" spellcheck placeholder={i18n('result')} defaultValue={result} style={{ display: type === 'text' ? 'block' : 'none' }} />
        <div class="result__html" style={{ display: type === 'html' ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: previewHtml }} />
        <div class="result__diff" style={{ display: type === 'diff' ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: diffHtml }} />
    </div>;
}
