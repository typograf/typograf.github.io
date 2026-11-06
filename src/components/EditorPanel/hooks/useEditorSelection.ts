import { useCallback, useRef, useState } from 'preact/hooks';
import type { SelectionKind } from '../types';

export function useEditorSelection(text: string) {
    const [selectionKind, setSelectionKind] = useState<SelectionKind>('none');
    const updateSelectionKind = useCallback(({ selectionStart, selectionEnd, value }: HTMLTextAreaElement) => {
        if (selectionStart === selectionEnd) {
            setSelectionKind('none');
        } else {
            setSelectionKind(selectionStart === 0 && selectionEnd === value.length ? 'all' : 'partial');
        }
    }, []);
    const textRef = useRef<HTMLTextAreaElement>(null);
    const getCopyContent = useCallback(() => {
        const input = textRef.current;
        if (input && input.selectionStart !== input.selectionEnd) {
            const selected = input.value.slice(input.selectionStart, input.selectionEnd);
            return { text: selected, partial: selected.length < input.value.length };
        }
        return { text, partial: false };
    }, [text]);
    const selectAll = useCallback(() => {
        textRef.current?.focus();
        textRef.current?.select();
    }, []);

    return {
        textRef,
        selectionKind,
        updateSelectionKind,
        selectAll,
        getCopyContent,
    };
}
