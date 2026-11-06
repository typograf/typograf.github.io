import { diffChars } from 'diff';
import type { TextSelection } from '../SourceTextInput/types';

export function restoreSelection(input: HTMLTextAreaElement, selection: TextSelection) {
    const { value, start, end, direction } = selection;
    if (input.value === value) return;
    const changes = diffChars(value, input.value, { timeout: 25 });

    const mapOffset = (offset: number) => {
        if (offset === 0) return 0;
        if (offset === value.length) return input.value.length;
        if (!changes) return Math.min(offset, input.value.length);

        let before = 0;
        let after = 0;
        for (const change of changes) {
            const length = change.value.length;
            if (!change.added) {
                if (offset < before + length) return after + (change.removed ? 0 : offset - before);
                before += length;
            }
            if (!change.removed) after += length;
        }
        return after;
    };

    input.setSelectionRange(mapOffset(start), mapOffset(end), direction);
}
