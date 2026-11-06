import type { TargetedEvent } from 'preact';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import { isJSON } from '../../helpers/json';
import { isHTML } from '../../helpers/string';
import { Textarea } from '../ui/Textarea';
import type { SourceTextInputProps } from './types';
import './index.css';

const b = block('source-text-input');

export function SourceTextInput({ value, onChange, onSelectionChange, textRef }: SourceTextInputProps) {
    const [{ caret, selected }, setSelection] = useState({ caret: 0, selected: 0 });
    const { text, format, length } = useMemo(() => {
        const text = value.replace(/\r\n?/g, '\n');
        return {
            text,
            format: isHTML(text) && !isJSON(text) ? 'html' : 'text',
            length: [...text].length,
        };
    }, [value]);
    const linesBeforeCaret = text.slice(0, caret).split('\n');
    const line = linesBeforeCaret.length;
    const column = [...linesBeforeCaret[line - 1]].length + 1;

    const updateSelection = useCallback(() => {
        const input = textRef.current;
        if (!input) return;
        const { selectionStart, selectionEnd, selectionDirection } = input;
        const caret = selectionDirection === 'backward' ? selectionStart : selectionEnd;
        const selected = [...input.value.slice(selectionStart, selectionEnd)].length;
        setSelection(previous => previous.caret === caret && previous.selected === selected
            ? previous
            : { caret, selected });
        onSelectionChange(input);
    }, [onSelectionChange, textRef]);
    useLayoutEffect(updateSelection, [value, updateSelection]);
    useEffect(() => {
        const input = textRef.current;
        input?.addEventListener('selectionchange', updateSelection);
        return () => input?.removeEventListener('selectionchange', updateSelection);
    }, [textRef, updateSelection]);

    const clear = useCallback(() => {
        onChange('');
        textRef.current?.focus();
    }, [onChange, textRef]);
    const changeText = useCallback((event: TargetedEvent<HTMLTextAreaElement>) => {
        onChange(event.currentTarget.value);
        updateSelection();
    }, [onChange, updateSelection]);

    return <>
        <div class={b('field')}>
            <button class={b('clear')} type="button" title={i18n('clear')} style={{ display: value ? 'block' : 'none' }} onClick={clear} />
            <Textarea ref={textRef} autocomplete="off" class={b('text')} autofocus spellcheck
                placeholder={i18n('input-text')} value={value} onInput={changeText}
                onClick={updateSelection} onKeyUp={updateSelection} onSelect={updateSelection} onFocus={updateSelection} />
        </div>
        <div class={b('status')}>
            {selected > 0
                ? <span>{i18n('editor-selected')}: {selected}</span>
                : <span>{i18n('editor-line')} {line}, {i18n('editor-column')} {column}</span>}
            <span>{i18n('editor-characters')}: {length}</span>
            <span class={b('status-format')}>{i18n('editor-format')}: {i18n(format)}</span>
        </div>
    </>;
}
