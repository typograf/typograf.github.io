import { useCallback, useLayoutEffect, useRef } from 'preact/hooks';
import type { PendingSelection, TypographWithSelectionOptions } from '../types';
import { restoreSelection } from '../utils';

export function useTypographWithSelection({ textRef, pair, execute, onRestore }: TypographWithSelectionOptions) {
    const pendingSelection = useRef<PendingSelection | null>(null);

    const executeKeepingSelection = useCallback((selectedOnly = false) => {
        const input = textRef.current;
        const selection = input && input.selectionStart !== input.selectionEnd
            ? {
                value: input.value,
                start: input.selectionStart,
                end: input.selectionEnd,
                direction: input.selectionDirection,
            }
            : undefined;
        if (selectedOnly && !selection) return false;
        pendingSelection.current = selection ? { selection, selectedOnly } : null;
        execute(selectedOnly ? selection : undefined);
        return true;
    }, [execute, textRef]);

    useLayoutEffect(() => {
        const pending = pendingSelection.current;
        const input = textRef.current;
        pendingSelection.current = null;
        if (!pending || !input) return;
        const { selection, selectedOnly } = pending;
        if (selectedOnly) {
            const end = selection.end + input.value.length - selection.value.length;
            input.setSelectionRange(selection.start, end, selection.direction);
        } else {
            restoreSelection(input, selection);
        }
        onRestore(input);
    }, [onRestore, pair, textRef]);

    return executeKeepingSelection;
}
