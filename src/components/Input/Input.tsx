import { useRef } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import '../Textarea/Textarea';
import './Input.css';

interface InputProps {
    value: string;
    onChange: (value: string) => void;
}

export function Input({ value, onChange }: InputProps) {
    const textRef = useRef<HTMLTextAreaElement>(null);
    return <>
        <button class="input__clear" type="button" title={i18n('clear')} style={{ display: value ? 'block' : 'none' }} onClick={() => {
            onChange('');
            textRef.current?.focus();
        }} />
        <textarea ref={textRef} autocomplete="off" class="textarea input__text" autofocus spellcheck placeholder={i18n('input-text')} value={value} onInput={event => onChange(event.currentTarget.value)} />
    </>;
}
