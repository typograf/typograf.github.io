import type { TargetedEvent } from 'preact';
import { useCallback, useRef } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import { Textarea } from '../ui/Textarea';
import type { SourceTextInputProps } from './types';
import './index.css';

const b = block('source-text-input');

export function SourceTextInput({ value, onChange }: SourceTextInputProps) {
    const textRef = useRef<HTMLTextAreaElement>(null);
    const clear = useCallback(() => {
        onChange('');
        textRef.current?.focus();
    }, [onChange]);
    const changeText = useCallback((event: TargetedEvent<HTMLTextAreaElement>) => {
        onChange(event.currentTarget.value);
    }, [onChange]);

    return <>
        <button class={b('clear')} type="button" title={i18n('clear')} style={{ display: value ? 'block' : 'none' }} onClick={clear} />
        <Textarea ref={textRef} autocomplete="off" class={b('text')} autofocus spellcheck placeholder={i18n('input-text')} value={value} onInput={changeText} />
    </>;
}
